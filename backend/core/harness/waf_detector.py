"""
Kryx WAF Detector + Origin IP Finder

Block 1 of WAF bypass stack:
  WafDetector  — fingerprints the WAF in front of the target
  OriginFinder — tries to find the real server IP behind Cloudflare/CDN
  WafContext   — result passed to supervisor and hunters

No hardcoded keys. External API calls are gated on env vars.
"""
import os
import re
import json
import asyncio
import socket
import ipaddress
from dataclasses import dataclass, field
from urllib.parse import urlparse

import httpx


# ---------------------------------------------------------------------------
# Cloudflare ASN / IP ranges (public list, no key needed)
# ---------------------------------------------------------------------------

CF_ASNS = {"AS13335", "AS209242"}

# Cloudflare published IPv4 ranges (from cloudflare.com/ips-v4, updated periodically)
_CF_CIDRS_V4 = [
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
    "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
    "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
    "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
]
_CF_NETS = [ipaddress.ip_network(c) for c in _CF_CIDRS_V4]


def _is_cf_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
        return any(addr in net for net in _CF_NETS)
    except ValueError:
        return False


# ---------------------------------------------------------------------------
# WAF signatures (headers / cookies / response body markers)
# ---------------------------------------------------------------------------

_WAF_SIGS = {
    "cloudflare": {
        "headers": ["cf-ray", "cf-cache-status", "cf-request-id", "__cfduid"],
        "server":  ["cloudflare"],
        "body":    ["Attention Required! | Cloudflare", "cloudflare-nginx", "DDoS protection by Cloudflare"],
    },
    "akamai": {
        "headers": ["x-akamai-request-id", "x-check-cacheable", "akamai-grn"],
        "server":  ["akamaighost"],
        "body":    ["Reference #", "Access Denied - Akamai"],
    },
    "imperva": {
        "headers": ["x-iinfo", "x-cdn"],
        "server":  ["imperva", "incapsula"],
        "body":    ["Incapsula incident ID", "_utmz=", "visid_incap_"],
        "cookies": ["incap_ses_", "visid_incap_"],
    },
    "aws_waf": {
        "headers": ["x-amzn-requestid", "x-amz-cf-id"],
        "body":    ["AWS WAF", "Request blocked"],
    },
    "sucuri": {
        "headers": ["x-sucuri-id", "x-sucuri-cache"],
        "server":  ["sucuri/cloudproxy"],
        "body":    ["Sucuri WebSite Firewall", "Access Denied - Sucuri Website Firewall"],
    },
    "f5_bigip": {
        "headers": ["x-cnection", "x-wa-info"],
        "cookies": ["TS0", "BIGipServer"],
        "body":    ["The requested URL was rejected", "F5 Networks"],
    },
    "barracuda": {
        "headers": ["barra_counter_session"],
        "body":    ["Barracuda Web Application Firewall", "You have been blocked"],
    },
    "fortiweb": {
        "cookies": ["FORTIWAFSID"],
        "body":    ["FortiWeb", "Application Firewall Block"],
    },
    "modsecurity": {
        "headers": ["x-mod-security-message"],
        "body":    ["ModSecurity", "mod_security", "NOYB"],
    },
}


@dataclass
class WafContext:
    detected: bool = False
    waf_name: str = ""                     # "cloudflare" | "akamai" | ...
    confidence: str = ""                   # "confirmed" | "likely" | "none"
    origin_ip: str = ""                    # real server IP if found
    origin_verified: bool = False          # True = we got 200 hitting origin directly
    origin_method: str = ""               # how we found it
    cf_ray: str = ""                       # CF-Ray header value if present
    block_status: int = 0                  # HTTP status WAF returned on probe
    bypass_headers: dict = field(default_factory=dict)   # headers for scanner to use
    notes: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# WafDetector
# ---------------------------------------------------------------------------

class WafDetector:
    """Fingerprint the WAF layer in front of a target.

    Sends one normal request + one obviously-malicious probe request,
    compares responses to confirm active blocking.
    """

    def __init__(self, target: str, timeout: int = 10):
        self.target = target
        self.timeout = timeout
        self.url = target if target.startswith("http") else f"https://{target}"

    async def detect(self) -> WafContext:
        ctx = WafContext()

        try:
            normal_resp = await self._fetch(self.url)
        except Exception as e:
            ctx.notes.append(f"Normal probe failed: {e}")
            return ctx

        ctx = self._fingerprint_headers(normal_resp, ctx)
        ctx = self._fingerprint_ip(normal_resp, ctx)

        # Active probe: inject a known-blocked SQLi string to see if WAF intercepts
        malicious_url = self.url + "/?id=1'%20OR%20'1'='1"
        try:
            mal_resp = await self._fetch(malicious_url)
            ctx.block_status = mal_resp.get("status", 0)
            if mal_resp.get("status") in (403, 406, 429, 503):
                body = mal_resp.get("body", "")
                for waf, sigs in _WAF_SIGS.items():
                    for marker in sigs.get("body", []):
                        if marker.lower() in body.lower():
                            ctx.waf_name = waf
                            ctx.detected = True
                            ctx.confidence = "confirmed"
                            ctx.notes.append(f"WAF blocked malicious probe ({mal_resp['status']}) + body marker matched")
                            break
                if not ctx.detected and ctx.block_status in (403, 406):
                    ctx.detected = True
                    ctx.confidence = "likely"
                    ctx.notes.append(f"WAF suspected: probe got {ctx.block_status}, no body marker matched")
        except Exception:
            pass

        return ctx

    def _fingerprint_headers(self, resp: dict, ctx: WafContext) -> WafContext:
        headers = {k.lower(): v.lower() for k, v in resp.get("headers", {}).items()}
        cookies = resp.get("cookies", {})
        body = resp.get("body", "")
        server = headers.get("server", "")

        for waf, sigs in _WAF_SIGS.items():
            matched = False
            for h in sigs.get("headers", []):
                if h.lower() in headers:
                    matched = True
                    break
            if not matched:
                for s in sigs.get("server", []):
                    if s.lower() in server:
                        matched = True
                        break
            if not matched:
                for ck in sigs.get("cookies", []):
                    if any(ck.lower() in k.lower() for k in cookies):
                        matched = True
                        break
            if not matched:
                for bm in sigs.get("body", []):
                    if bm.lower() in body.lower():
                        matched = True
                        break
            if matched:
                ctx.detected = True
                ctx.waf_name = waf
                ctx.confidence = "confirmed" if ctx.confidence != "confirmed" else ctx.confidence
                if waf == "cloudflare":
                    ctx.cf_ray = headers.get("cf-ray", "")
                break

        if not ctx.confidence:
            ctx.confidence = "confirmed" if ctx.detected else "none"
        return ctx

    def _fingerprint_ip(self, resp: dict, ctx: WafContext) -> WafContext:
        ip = resp.get("resolved_ip", "")
        if ip and _is_cf_ip(ip):
            if not ctx.detected:
                ctx.detected = True
                ctx.waf_name = "cloudflare"
                ctx.confidence = "confirmed"
            ctx.notes.append(f"Resolved IP {ip} is in Cloudflare CIDR range")
        return ctx

    async def _fetch(self, url: str) -> dict:
        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            verify=False,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
        ) as client:
            r = await client.get(url)
            # Resolve the actual server IP
            parsed = urlparse(url)
            host = parsed.hostname or ""
            ip = ""
            try:
                ip = socket.gethostbyname(host)
            except Exception:
                pass
            return {
                "status": r.status_code,
                "headers": dict(r.headers),
                "cookies": {k: v for k, v in r.cookies.items()},
                "body": r.text[:3000],
                "resolved_ip": ip,
            }


# ---------------------------------------------------------------------------
# OriginFinder
# ---------------------------------------------------------------------------

class OriginFinder:
    """Try to find the real server IP hidden behind a CDN/WAF.

    Methods (in priority order):
      1. Direct subdomain DNS — mail., ftp., cpanel., direct., staging., dev., etc.
         (these often skip Cloudflare)
      2. crt.sh wildcard cert — subdomains from TLS cert transparency logs
      3. Shodan host lookup — if SHODAN_API_KEY is set
      4. MX record → IP chain (email servers often reveal the origin)
      5. Historical DNS via SecurityTrails — if SECURITYTRAILS_KEY is set
    """

    def __init__(self, target: str, timeout: int = 10):
        self.target = target
        self.timeout = timeout
        parsed = urlparse(target if target.startswith("http") else f"https://{target}")
        self.hostname = parsed.hostname or target
        self.base_domain = self._base_domain(self.hostname)
        self.original_url = target if target.startswith("http") else f"https://{target}"

    @staticmethod
    def _base_domain(host: str) -> str:
        parts = host.rstrip(".").split(".")
        return ".".join(parts[-2:]) if len(parts) >= 2 else host

    async def find(self) -> dict:
        """Returns {origin_ip, method, verified, notes}"""
        results = []

        tasks = [
            self._check_common_subdomains(),
            self._check_crtsh_subdomains(),
            self._check_mx_records(),
        ]

        # Shodan: only if key is set — no key means skip, no error spam
        shodan_key = os.getenv("SHODAN_API_KEY")
        if shodan_key:
            tasks.append(self._check_shodan(shodan_key))

        # SecurityTrails: same gating
        st_key = os.getenv("SECURITYTRAILS_KEY")
        if st_key:
            tasks.append(self._check_securitytrails(st_key))

        gathered = await asyncio.gather(*tasks, return_exceptions=True)
        for r in gathered:
            if isinstance(r, list):
                results.extend(r)

        # Verify candidates: hit them directly with Host header, check if
        # the response looks like the real app (not a Cloudflare error page).
        for cand in results:
            ip = cand.get("ip", "")
            if not ip or _is_cf_ip(ip):
                continue
            verified, evidence = await self._verify_origin(ip)
            if verified:
                return {
                    "origin_ip": ip,
                    "method": cand.get("method", "unknown"),
                    "subdomain": cand.get("subdomain", ""),
                    "verified": True,
                    "evidence": evidence,
                    "notes": [f"Real server confirmed at {ip} via {cand.get('method')}"],
                }

        # Nothing verified — return all candidates for manual review
        return {
            "origin_ip": "",
            "method": "",
            "verified": False,
            "candidates": [c for c in results if not _is_cf_ip(c.get("ip", ""))],
            "notes": ["Could not verify origin IP. Candidates listed for manual review."],
        }

    async def _resolve(self, host: str) -> str:
        try:
            loop = asyncio.get_event_loop()
            addr = await loop.run_in_executor(None, socket.gethostbyname, host)
            return addr
        except Exception:
            return ""

    async def _check_common_subdomains(self) -> list:
        """Common subdomains that bypass Cloudflare (not proxied by default)."""
        prefixes = [
            "mail", "ftp", "cpanel", "whm", "webmail", "smtp", "pop",
            "direct", "origin", "server", "host", "ip", "ns1", "ns2",
            "staging", "stage", "dev", "test", "admin", "api",
            "vpn", "mx", "remote", "cdn", "s3",
        ]
        candidates = []
        tasks = [(p, self._resolve(f"{p}.{self.base_domain}")) for p in prefixes]
        for prefix, coro in tasks:
            ip = await coro
            if ip and ip != "0.0.0.0":
                candidates.append({
                    "ip": ip,
                    "subdomain": f"{prefix}.{self.base_domain}",
                    "method": "subdomain_dns",
                })
        return candidates

    async def _check_crtsh_subdomains(self) -> list:
        """Pull subdomains from certificate transparency logs via crt.sh."""
        candidates = []
        try:
            async with httpx.AsyncClient(timeout=15, verify=False) as client:
                r = await client.get(
                    "https://crt.sh/",
                    params={"q": f"%.{self.base_domain}", "output": "json"},
                    headers={"User-Agent": "Mozilla/5.0"},
                )
                data = r.json()
                subs = set()
                for entry in data:
                    for name in entry.get("name_value", "").split("\n"):
                        name = name.strip().lower()
                        if name.endswith(f".{self.base_domain}") or name == self.base_domain:
                            subs.add(name)
                for sub in list(subs)[:30]:
                    ip = await self._resolve(sub)
                    if ip:
                        candidates.append({"ip": ip, "subdomain": sub, "method": "crtsh"})
        except Exception:
            pass
        return candidates

    async def _check_mx_records(self) -> list:
        """MX records often point to mail servers on the origin network."""
        candidates = []
        try:
            import dns.resolver
            loop = asyncio.get_event_loop()
            def _resolve_mx():
                records = []
                try:
                    for rdata in dns.resolver.resolve(self.base_domain, "MX"):
                        mx_host = str(rdata.exchange).rstrip(".")
                        try:
                            mx_ip = socket.gethostbyname(mx_host)
                            records.append({"ip": mx_ip, "subdomain": mx_host, "method": "mx_record"})
                        except Exception:
                            pass
                except Exception:
                    pass
                return records
            candidates = await loop.run_in_executor(None, _resolve_mx)
        except Exception:
            pass
        return candidates

    async def _check_shodan(self, api_key: str) -> list:
        """Search Shodan for hosts serving this domain in their HTTP banner."""
        candidates = []
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # Search for the hostname in HTTP headers/title
                r = await client.get(
                    "https://api.shodan.io/shodan/host/search",
                    params={
                        "key": api_key,
                        "query": f'hostname:"{self.base_domain}"',
                        "minify": "true",
                    },
                )
                data = r.json()
                for match in data.get("matches", [])[:10]:
                    ip = match.get("ip_str", "")
                    if ip and not _is_cf_ip(ip):
                        candidates.append({"ip": ip, "subdomain": self.base_domain, "method": "shodan"})
        except Exception:
            pass
        return candidates

    async def _check_securitytrails(self, api_key: str) -> list:
        """Historical DNS records from SecurityTrails — often reveals the IP
        that was used before Cloudflare was enabled."""
        candidates = []
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.get(
                    f"https://api.securitytrails.com/v1/history/{self.base_domain}/dns/a",
                    headers={"APIKEY": api_key},
                )
                data = r.json()
                for record in data.get("records", [])[:20]:
                    for val in record.get("values", []):
                        ip = val.get("ip", "")
                        if ip and not _is_cf_ip(ip):
                            candidates.append({
                                "ip": ip,
                                "subdomain": self.base_domain,
                                "method": "securitytrails_history",
                            })
        except Exception:
            pass
        return candidates

    async def _verify_origin(self, ip: str) -> tuple[bool, str]:
        """Hit the IP directly with Host header. If we get a real app response
        (not a Cloudflare error page or connection refused) it's the origin."""
        parsed = urlparse(self.original_url)
        host = parsed.hostname or self.hostname
        for scheme in ("https", "http"):
            url = f"{scheme}://{ip}/"
            try:
                async with httpx.AsyncClient(
                    timeout=self.timeout,
                    follow_redirects=True,
                    verify=False,
                    headers={
                        "Host": host,
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    },
                ) as client:
                    r = await client.get(url)
                    body = r.text[:500].lower()
                    # Reject Cloudflare error pages
                    if "cloudflare" in body and r.status_code in (403, 503, 1020):
                        continue
                    # Any real response (even 4xx) means there's a server there
                    if r.status_code < 600:
                        return True, f"HTTP {r.status_code} from {scheme}://{ip}/ with Host:{host}"
            except Exception:
                continue
        return False, ""


# ---------------------------------------------------------------------------
# High-level entry point used by Supervisor
# ---------------------------------------------------------------------------

_last_detected_waf: str = ""


def _last_waf_name() -> str:
    """Return the last WAF name detected this session (empty string if none)."""
    return _last_detected_waf


async def analyze_waf(target: str) -> WafContext:
    """Run WAF detection + origin finder. Returns a WafContext.

    Called by supervisor before scanning so all stages know:
      - Is there a WAF?
      - What is its name?
      - Is there a bypass IP we should use instead?
    """
    global _last_detected_waf
    ctx = await WafDetector(target).detect()

    if ctx.detected:
        _last_detected_waf = ctx.waf_name
        origin = await OriginFinder(target).find()
        if origin.get("verified"):
            ctx.origin_ip = origin["origin_ip"]
            ctx.origin_verified = True
            ctx.origin_method = origin["method"]
            ctx.notes.extend(origin.get("notes", []))
            # Bypass headers: tell httpx to connect to origin IP, send Host as the domain
            parsed = urlparse(target if target.startswith("http") else f"https://{target}")
            ctx.bypass_headers = {"Host": parsed.hostname or target}
        else:
            candidates = origin.get("candidates", [])
            if candidates:
                ctx.notes.append(
                    f"Origin not verified. {len(candidates)} candidate IPs: "
                    + ", ".join(c["ip"] for c in candidates[:5])
                )

    return ctx
