/**
 * content.ts — single source of truth for the engagement.
 *
 * OPERATION  → language-neutral structural data (coordinates, tools, code,
 *              numbers). This is the "fake live" telemetry of the run.
 * COPY       → localized strings keyed by Locale (en / ru).
 *
 * Keeping the two apart means the timeline geometry never has to be
 * duplicated across languages.
 */

export type Locale = "en" | "ru";

export const LOCALES: Locale[] = ["en", "ru"];

/* ----------------------------------------------------------------- */
/* Phase registry — drives the navbar indicator and the timeline rail */
/* ----------------------------------------------------------------- */

export interface PhaseMeta {
  id: string;
  index: string; // "00".."09"
  code: string; // mono codename, language-neutral
}

export const PHASES: PhaseMeta[] = [
  { id: "entry", index: "00", code: "ENTRY" },
  { id: "recon", index: "01", code: "RECON" },
  { id: "swarm", index: "02", code: "SWARM" },
  { id: "contact", index: "03", code: "CONTACT" },
  { id: "review", index: "04", code: "REVIEW" },
  { id: "chaining", index: "05", code: "CHAIN" },
  { id: "proven", index: "06", code: "PROVEN" },
  { id: "delivered", index: "07", code: "REPORT" },
  { id: "license", index: "08", code: "ACCESS" },
  { id: "engage", index: "09", code: "ENGAGE" },
];

/* ----------------------------------------------------------------- */
/* OPERATION — neutral telemetry                                      */
/* ----------------------------------------------------------------- */

export type ReconKind = "root" | "subdomain" | "port" | "tech";

export interface ReconNode {
  id: string;
  label: string;
  kind: ReconKind;
  x: number; // 0..100 within a 100x66 field
  y: number;
}

export interface SwarmAgent {
  id: string;
  tool: string;
  /** fan angle in degrees, 0 = straight up */
  angle: number;
  /** normalized travel distance 0..1 */
  reach: number;
}

export type ChainKind = "recon" | "vuln" | "creds" | "lateral" | "rce";

export interface ChainNode {
  id: string;
  kind: ChainKind;
  x: number;
  y: number;
}

export const OPERATION = {
  target: "acme-corp.example",
  startedAt: "2026.06.27 04:11:08Z",

  recon: {
    nodes: [
      { id: "root", label: "acme-corp.example", kind: "root", x: 50, y: 33 },
      { id: "api", label: "api.acme-corp.example", kind: "subdomain", x: 20, y: 14 },
      { id: "auth", label: "auth.acme-corp.example", kind: "subdomain", x: 80, y: 16 },
      { id: "staging", label: "staging.acme-corp.example", kind: "subdomain", x: 16, y: 52 },
      { id: "vpn", label: "vpn.acme-corp.example", kind: "subdomain", x: 84, y: 54 },
      { id: "p443", label: ":443 nginx/1.25", kind: "port", x: 35, y: 60 },
      { id: "p22", label: ":22 OpenSSH 9.6", kind: "port", x: 66, y: 62 },
      { id: "p5432", label: ":5432 postgres", kind: "port", x: 50, y: 6 },
      { id: "tech1", label: "Next.js · Node 20", kind: "tech", x: 8, y: 31 },
      { id: "tech2", label: "Cloudflare WAF", kind: "tech", x: 92, y: 35 },
    ] as ReconNode[],
    links: [
      ["root", "api"],
      ["root", "auth"],
      ["root", "staging"],
      ["root", "vpn"],
      ["root", "p443"],
      ["root", "p22"],
      ["root", "p5432"],
      ["api", "tech1"],
      ["auth", "tech2"],
    ] as [string, string][],
    tools: ["crt.sh", "subfinder", "amass", "whatweb", "httpx", "dnsx"],
  },

  swarm: {
    agents: [
      { id: "injection", tool: "sqlmap", angle: -68, reach: 1.0 },
      { id: "xss", tool: "dalfox", angle: -46, reach: 0.86 },
      { id: "auth", tool: "hydra", angle: -22, reach: 0.96 },
      { id: "config", tool: "nuclei", angle: -4, reach: 0.78 },
      { id: "cors", tool: "ffuf", angle: 18, reach: 0.9 },
      { id: "network", tool: "nmap", angle: 40, reach: 0.84 },
      { id: "leak", tool: "trufflehog", angle: 60, reach: 0.94 },
      { id: "cve", tool: "nuclei -t cves", angle: 76, reach: 1.0 },
    ] as SwarmAgent[],
    ticker: [
      "nmap -sV -p-",
      "nuclei -severity critical,high",
      "ffuf -w raft-large",
      "sqlmap --batch --risk 3",
      "dalfox pipe",
      "katana -jc",
      "httpx -title -tech",
      "trufflehog git",
    ],
  },

  finding: {
    id: "KRX-0481",
    title: "SQL Injection",
    endpoint: "POST /api/login",
    param: "username",
    severity: "CRITICAL",
    cvss: "9.8",
    cwe: "CWE-89",
    evidence: [
      { t: "out", v: "$ kryx replay KRX-0481 --prove" },
      { t: "sys", v: "→ baseline request  username=admin" },
      { t: "sys", v: "→ probe  username=admin' AND SLEEP(4)-- -" },
      { t: "hit", v: "Δ response time  4.02s  (baseline 0.08s)" },
      { t: "sys", v: "→ boolean  username=admin' AND 1=1-- -  →  200" },
      { t: "sys", v: "→ boolean  username=admin' AND 1=2-- -  →  401" },
      { t: "hit", v: "differential confirmed · injectable" },
      { t: "out", v: "extracting current_user()…" },
      { t: "leak", v: "current_user  =  app_rw@db-primary" },
      { t: "ok", v: "proof captured · 0 false positives" },
    ],
    exploit: [
      { ln: "POST /api/login HTTP/1.1" },
      { ln: "Host: api.acme-corp.example" },
      { ln: "Content-Type: application/json" },
      { ln: "" },
      { ln: '{ "username": "admin\'"' },
      { ln: "    UNION SELECT" },
      { ln: "      id, email, password_hash" },
      { ln: '    FROM users-- -", "password": "x" }' },
    ],
    exploitNote: "Single unauthenticated request returns the full credential table.",
  },

  review: {
    falsePositivesScreened: 1284,
    rounds: [
      { claim: "Timing delta is the injection", counter: "Could be network jitter", result: "re-run ×20 · σ 0.9%" },
      { claim: "Boolean differential holds", counter: "Could be rate-limit 401", result: "headers identical · no RL" },
      { claim: "UNION returns real rows", counter: "Could be reflected echo", result: "row hashes match DB" },
    ],
    verdict: "VALIDATED · reproducible",
  },

  chain: {
    nodes: [
      { id: "recon", kind: "recon", x: 8, y: 50 },
      { id: "sqli", kind: "vuln", x: 30, y: 26 },
      { id: "creds", kind: "creds", x: 52, y: 58 },
      { id: "lateral", kind: "lateral", x: 74, y: 30 },
      { id: "rce", kind: "rce", x: 94, y: 56 },
    ] as ChainNode[],
    edges: [
      ["recon", "sqli"],
      ["sqli", "creds"],
      ["creds", "lateral"],
      ["lateral", "rce"],
    ] as [string, string][],
  },

  proven: {
    duration: "11m 42s",
    requests: "3,418",
    chainHops: 5,
    blastRadius: "domain admin",
  },

  report: {
    findings: [
      { sev: "CRIT", title: "SQL Injection → credential dump", ref: "KRX-0481" },
      { sev: "HIGH", title: "Reused service creds enable lateral move", ref: "KRX-0490" },
      { sev: "HIGH", title: "Postgres reachable from staging", ref: "KRX-0492" },
      { sev: "MED", title: "Verbose error leaks stack trace", ref: "KRX-0507" },
    ],
    compliance: ["SOC 2", "ISO 27001", "GDPR"],
  },

  pricing: [
    {
      id: "starter",
      price: "$99",
      targets: "3 targets",
      agents: "8 hunter agents",
      history: "30-day operation history",
      featured: false,
    },
    {
      id: "pro",
      price: "$999",
      targets: "25 targets",
      agents: "32 hunter agents",
      history: "1-year operation history",
      featured: true,
    },
    {
      id: "enterprise",
      price: "$9,999",
      targets: "Unlimited targets",
      agents: "Dedicated agent fleet",
      history: "Full retention + export",
      featured: false,
    },
  ],

  github: "github.com/xxxoff/Kryx",
} as const;

/* ----------------------------------------------------------------- */
/* COPY — localized strings                                          */
/* ----------------------------------------------------------------- */

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface Copy {
  nav: { phaseWord: string; launch: string; request: string };

  entry: {
    sloganA: string;
    sloganB: string;
    hint: string;
    sub: string;
    boot: string;
  };

  recon: { tag: string; title: string; body: string; bullets: string[]; legend: Record<ReconKind, string> };

  swarm: {
    tag: string;
    title: string;
    body: string;
    parallel: string;
    agents: Record<string, string>; // id -> hunt label
  };

  contact: {
    tag: string;
    title: string;
    body: string;
    severity: string;
    tabs: { evidence: string; exploit: string; remediation: string };
    remediation: string[];
    paramLabel: string;
  };

  review: {
    tag: string;
    title: string;
    body: string;
    claimLabel: string;
    counterLabel: string;
    resultLabel: string;
    screened: string;
  };

  chaining: {
    tag: string;
    title: string;
    body: string;
    nodes: Record<string, { label: string; detail: string }>;
    hint: string;
  };

  proven: {
    tag: string;
    status: string;
    title: string;
    body: string;
    stats: { duration: string; requests: string; hops: string; blast: string };
  };

  delivered: {
    tag: string;
    title: string;
    body: string;
    reportTitle: string;
    severityCol: string;
    findingCol: string;
    trust: string[];
    complianceLabel: string;
  };

  license: {
    tag: string;
    title: string;
    body: string;
    perMonth: string;
    recommended: string;
    cta: string;
    tiers: Record<string, { name: string; tagline: string; extras: string[]; rbac: string }>;
  };

  engage: {
    tag: string;
    title: string;
    body: string;
    placeholder: string;
    cta: string;
    note: string;
    success: string;
  };

  footer: {
    tagline: string;
    columns: FooterColumn[];
    legal: string;
    disclaimer: string;
  };
}

export const COPY: Record<Locale, Copy> = {
  en: {
    nav: { phaseWord: "PHASE", launch: "Launch App", request: "Request Access" },

    entry: {
      sloganA: "Think like the attacker.",
      sloganB: "Find it first.",
      hint: "scroll to begin engagement",
      sub: "Autonomous multi-agent penetration testing. A swarm that hunts real vulnerabilities with real tools — and proves every one.",
      boot: "kryx engage --target acme-corp.example",
    },

    recon: {
      tag: "Target acquired",
      title: "The swarm maps your perimeter before it touches it.",
      body: "Recon agents resolve the live attack surface — domains, subdomains, open ports and the stack behind them — and assemble it into a working map of the target.",
      bullets: [
        "Passive + active discovery — DNS, WHOIS, certificate transparency",
        "Subdomain enumeration and HTTP fingerprinting at scale",
        "Every asset typed, scoped and handed to the hunters",
      ],
      legend: { root: "Target", subdomain: "Subdomain", port: "Open port", tech: "Technology" },
    },

    swarm: {
      tag: "Swarm deploys",
      title: "Eight hunters break across the map at once.",
      body: "From a single point the fleet fans out — each agent owns a class of weakness and drives the right tool against the right surface, in parallel.",
      parallel: "8 vectors · simultaneous",
      agents: {
        injection: "Injection — SQL / NoSQL / command",
        xss: "Cross-site scripting",
        auth: "Authentication & session",
        config: "Misconfiguration",
        cors: "CORS & origin trust",
        network: "Network & exposed services",
        leak: "Secrets & info leak",
        cve: "Known CVEs",
      },
    },

    contact: {
      tag: "Contact",
      title: "A vector lights up. Kryx makes contact.",
      body: "The moment a hunter lands a hit, the finding opens with everything you need to act — captured live, not summarized later.",
      severity: "Severity",
      tabs: { evidence: "Evidence", exploit: "Exploit", remediation: "Remediation" },
      remediation: [
        "Replace string-built SQL with parameterized queries / prepared statements.",
        "Enforce least-privilege on the application database role.",
        "Add positive input validation on the login handler.",
      ],
      paramLabel: "param",
    },

    review: {
      tag: "Adversarial review",
      title: "Then a second agent tries to prove it wrong.",
      body: "Every finding faces an independent validator whose only job is to disprove it. Claims that survive are reproducible — the rest never reach you.",
      claimLabel: "Claim",
      counterLabel: "Counter-test",
      resultLabel: "Result",
      screened: "false positives screened out this run",
    },

    chaining: {
      tag: "Chaining",
      title: "Single findings become an APT-grade kill chain.",
      body: "Kryx connects what it proves. Isolated weaknesses link into the path a real adversary would walk — from first contact to full control.",
      nodes: {
        recon: { label: "Recon", detail: "Exposed login surface mapped on api.acme-corp.example." },
        sqli: { label: "SQL Injection", detail: "Unauthenticated injection on /api/login dumps the user table." },
        creds: { label: "Credential access", detail: "Recovered service hash cracks to a reused operator password." },
        lateral: { label: "Lateral movement", detail: "Reused creds open SSH to the staging jump host." },
        rce: { label: "Remote code exec", detail: "Postgres COPY TO PROGRAM yields code execution as db admin." },
      },
      hint: "select a node",
    },

    proven: {
      tag: "Exploit proven",
      status: "EXPLOIT PROVEN",
      title: "Not a maybe. A demonstrated breach.",
      body: "The engagement closes with a working exploit chain — every hop reproduced, every claim backed by proof you can re-run.",
      stats: { duration: "Time to proof", requests: "Requests sent", hops: "Chain hops", blast: "Blast radius" },
    },

    delivered: {
      tag: "Delivered",
      title: "A board-ready report drops the moment the run ends.",
      body: "Severity, evidence and remediation — structured, audited, and safe to run against production.",
      reportTitle: "Engagement report · acme-corp.example",
      severityCol: "Sev",
      findingCol: "Finding",
      trust: [
        "Scope you control",
        "Non-destructive by default",
        "Full audit trail",
      ],
      complianceLabel: "Compliance",
    },

    license: {
      tag: "Access levels",
      title: "Point the engine at your own attack surface.",
      body: "Three tiers of access to the same swarm. Scale targets, agents and retention as the operation grows.",
      perMonth: "/mo",
      recommended: "Recommended",
      cta: "Request Access",
      tiers: {
        starter: { name: "Starter", tagline: "For a single product and its perimeter.", rbac: "Owner + member", extras: ["GitHub webhooks", "Email support"] },
        pro: { name: "Pro", tagline: "For security teams running continuous engagements.", rbac: "RBAC: owner / admin / member / viewer", extras: ["GitHub + GitLab webhooks", "Slack integration", "Priority support"] },
        enterprise: { name: "Enterprise", tagline: "For org-wide, audited red-team programs.", rbac: "SSO + scoped RBAC", extras: ["All integrations", "Dedicated SLA", "Audit & compliance export"] },
      },
    },

    engage: {
      tag: "Engage",
      title: "Now point it at yours.",
      body: "Private beta. Request access and run the swarm against an attack surface you own.",
      placeholder: "you@company.com",
      cta: "Request Access",
      note: "Private beta · no spam.",
      success: "Request received — we'll be in touch.",
    },

    footer: {
      tagline: "Think like the attacker. Find it first.",
      columns: [
        { title: "Operation", links: [ { label: "Home", href: "#entry" }, { label: "How it works", href: "#recon" }, { label: "Why Kryx", href: "#review" }, { label: "Pricing", href: "#license" } ] },
        { title: "Company", links: [ { label: "About", href: "#" }, { label: "Launch App", href: "#" }, { label: "Docs", href: "#" } ] },
        { title: "Resources", links: [ { label: "GitHub", href: "https://github.com/xxxoff/Kryx" }, { label: "Status", href: "#" }, { label: "Security", href: "#" } ] },
      ],
      legal: "© 2026 Kryx",
      disclaimer: "Authorised security testing only.",
    },
  },

  ru: {
    nav: { phaseWord: "ФАЗА", launch: "Запустить App", request: "Запросить доступ" },

    entry: {
      sloganA: "Думай как атакующий.",
      sloganB: "Найди первым.",
      hint: "прокрутите, чтобы начать операцию",
      sub: "Автономный пентест на рое агентов. Рой сам находит реальные уязвимости реальными инструментами — и доказывает каждую.",
      boot: "kryx engage --target acme-corp.example",
    },

    recon: {
      tag: "Цель захвачена",
      title: "Рой составляет карту периметра прежде, чем коснётся его.",
      body: "Агенты разведки разворачивают живую поверхность атаки — домены, поддомены, открытые порты и стек за ними — и собирают рабочую карту цели.",
      bullets: [
        "Пассивный и активный сбор — DNS, WHOIS, certificate transparency",
        "Перечисление поддоменов и HTTP-фингерпринтинг в масштабе",
        "Каждый актив типизирован, проверен на скоуп и передан охотникам",
      ],
      legend: { root: "Цель", subdomain: "Поддомен", port: "Открытый порт", tech: "Технология" },
    },

    swarm: {
      tag: "Развёртывание роя",
      title: "Восемь охотников расходятся по карте одновременно.",
      body: "Из одной точки рой разлетается — каждый агент отвечает за свой класс уязвимостей и ведёт нужный инструмент против нужной поверхности, параллельно.",
      parallel: "8 векторов · одновременно",
      agents: {
        injection: "Инъекции — SQL / NoSQL / команды",
        xss: "Межсайтовый скриптинг",
        auth: "Аутентификация и сессии",
        config: "Ошибки конфигурации",
        cors: "CORS и доверие источника",
        network: "Сеть и открытые сервисы",
        leak: "Секреты и утечки",
        cve: "Известные CVE",
      },
    },

    contact: {
      tag: "Контакт",
      title: "Вектор загорается. Kryx выходит на контакт.",
      body: "Как только охотник попадает, находка раскрывается со всем, что нужно для действия — захвачено вживую, а не пересказано потом.",
      severity: "Критичность",
      tabs: { evidence: "Доказательство", exploit: "Эксплойт", remediation: "Исправление" },
      remediation: [
        "Замените сборку SQL строками на параметризованные запросы / prepared statements.",
        "Примените принцип наименьших привилегий к роли БД приложения.",
        "Добавьте позитивную валидацию ввода в обработчик логина.",
      ],
      paramLabel: "параметр",
    },

    review: {
      tag: "Состязательная проверка",
      title: "Затем второй агент пытается это опровергнуть.",
      body: "Каждую находку проверяет независимый валидатор, чья единственная задача — опровергнуть её. Выжившие утверждения воспроизводимы — остальные до вас не доходят.",
      claimLabel: "Утверждение",
      counterLabel: "Контр-тест",
      resultLabel: "Результат",
      screened: "ложных срабатываний отсеяно за этот прогон",
    },

    chaining: {
      tag: "Связывание",
      title: "Одиночные находки становятся цепочкой уровня APT.",
      body: "Kryx связывает то, что доказал. Изолированные слабости складываются в путь, которым прошёл бы реальный противник — от первого контакта до полного контроля.",
      nodes: {
        recon: { label: "Разведка", detail: "Открытая поверхность логина найдена на api.acme-corp.example." },
        sqli: { label: "SQL-инъекция", detail: "Неаутентифицированная инъекция в /api/login выгружает таблицу пользователей." },
        creds: { label: "Доступ к учёткам", detail: "Восстановленный хэш сервиса ломается в переиспользованный пароль оператора." },
        lateral: { label: "Боковое перемещение", detail: "Переиспользованные учётки открывают SSH к staging jump-хосту." },
        rce: { label: "Удалённое выполнение", detail: "Postgres COPY TO PROGRAM даёт исполнение кода от имени админа БД." },
      },
      hint: "выберите узел",
    },

    proven: {
      tag: "Эксплойт доказан",
      status: "EXPLOIT PROVEN",
      title: "Не «возможно». Продемонстрированный пробив.",
      body: "Операция завершается рабочей цепочкой эксплойта — каждый шаг воспроизведён, каждое утверждение подкреплено доказательством, которое можно перезапустить.",
      stats: { duration: "Время до пруфа", requests: "Запросов отправлено", hops: "Шагов цепочки", blast: "Радиус поражения" },
    },

    delivered: {
      tag: "Доставлено",
      title: "Отчёт для совета директоров — в момент завершения прогона.",
      body: "Критичность, доказательства и исправления — структурно, аудируемо и безопасно для продакшена.",
      reportTitle: "Отчёт операции · acme-corp.example",
      severityCol: "Крит",
      findingCol: "Находка",
      trust: [
        "Скоуп под вашим контролем",
        "Недеструктивно по умолчанию",
        "Полный аудит-трейл",
      ],
      complianceLabel: "Соответствие",
    },

    license: {
      tag: "Уровни доступа",
      title: "Направьте движок на собственную поверхность атаки.",
      body: "Три уровня доступа к одному рою. Масштабируйте цели, агентов и хранение по мере роста операции.",
      perMonth: "/мес",
      recommended: "Рекомендуем",
      cta: "Запросить доступ",
      tiers: {
        starter: { name: "Starter", tagline: "Для одного продукта и его периметра.", rbac: "Owner + member", extras: ["GitHub webhooks", "Поддержка по email"] },
        pro: { name: "Pro", tagline: "Для команд безопасности с непрерывными операциями.", rbac: "RBAC: owner / admin / member / viewer", extras: ["GitHub + GitLab webhooks", "Интеграция со Slack", "Приоритетная поддержка"] },
        enterprise: { name: "Enterprise", tagline: "Для аудируемых red-team программ масштаба организации.", rbac: "SSO + гранулярный RBAC", extras: ["Все интеграции", "Выделенный SLA", "Экспорт для аудита и комплаенса"] },
      },
    },

    engage: {
      tag: "Контакт",
      title: "Теперь направьте на свою.",
      body: "Закрытая бета. Запросите доступ и запустите рой против поверхности атаки, которой владеете вы.",
      placeholder: "you@company.com",
      cta: "Запросить доступ",
      note: "Закрытая бета · без спама.",
      success: "Запрос получен — мы свяжемся с вами.",
    },

    footer: {
      tagline: "Думай как атакующий. Найди первым.",
      columns: [
        { title: "Операция", links: [ { label: "Главная", href: "#entry" }, { label: "Как это работает", href: "#recon" }, { label: "Почему Kryx", href: "#review" }, { label: "Тарифы", href: "#license" } ] },
        { title: "Компания", links: [ { label: "О нас", href: "#" }, { label: "Запустить App", href: "#" }, { label: "Документация", href: "#" } ] },
        { title: "Ресурсы", links: [ { label: "GitHub", href: "https://github.com/xxxoff/Kryx" }, { label: "Статус", href: "#" }, { label: "Безопасность", href: "#" } ] },
      ],
      legal: "© 2026 Kryx",
      disclaimer: "Только авторизованное тестирование на проникновение.",
    },
  },
};
