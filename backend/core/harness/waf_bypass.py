"""
Kryx WAF Bypass Client - Block 2

Replaces httpx with curl_cffi for all target requests when WAF is detected.

What this solves:
  - TLS fingerprint (JA3/JA4): curl_cffi impersonates Chrome 120 TLS ClientHello
    including cipher suite order, extensions, GREASE values — httpx exposes Python ssl
  - HTTP/2 SETTINGS: Chrome 119+ sends HEADER_TABLE_SIZE=65536, ENABLE_PUSH=0,
    INITIAL_WINDOW_SIZE=6291456, MAX_HEADER_LIST_SIZE=262144, WINDOW_UPDATE=15663105
    curl_cffi sets all of these automatically per impersonation profile
  - Header fingerprint: full Chrome 120 header set in correct wire order
  - CF challenge: auto-detects challenge pages, solves with Playwright, recycles
    cf_clearance + __cf_bm cookies for subsequent requests
  - Behavioral: jittered delays between requests

No hardcoded credentials. PROXY_URL and WAF_* settings come from env only.
"""
import asyncio
import os
import random
import time
import logging
from dataclasses import dataclass, field
from typing import Any

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration from env — no defaults that expose infra
# ---------------------------------------------------------------------------

PROXY_URL      = os.getenv("PROXY_URL", "")           # socks5://user:pass@host:port
WAF_DELAY_MIN  = float(os.getenv("WAF_DELAY_MIN", "0.8"))
WAF_DELAY_MAX  = float(os.getenv("WAF_DELAY_MAX", "2.5"))
CF_TIMEOUT     = int(os.getenv("CF_CHALLENGE_TIMEOUT", "25"))  # seconds to wait for cf_clearance

# curl_cffi Chrome profile — newer = better, must be installed
# Full list: chrome_103 through chrome_152, plus PSK variants
CF_IMPERSONATE = os.getenv("CF_IMPERSONATE_PROFILE", "chrome_120")


# ---------------------------------------------------------------------------
# Chrome 120 header set (wire order matters for HTTP/2 HPACK fingerprinting)
# Research-confirmed order from hpx-browser and curl-impersonate source.
# ---------------------------------------------------------------------------

def chrome_120_headers(url: str = "", referer: str = "") -> dict:
    """Return a Chrome 120 navigation request header set in wire order.

    HTTP/2 HPACK compression is order-sensitive — Cloudflare checks the order.
    These match a navigation request (address bar / link click).
    For XHR/fetch requests, sec-fetch-mode=cors, sec-fetch-dest=empty.
    """
    h = {
        "sec-ch-ua": '"Chromium";v="120", "Google Chrome";v="120", "Not-A.Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "upgrade-insecure-requests": "1",
        "user-agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "accept": (
            "text/html,application/xhtml+xml,application/xml;q=0.9,"
            "image/avif,image/webp,image/apng,*/*;q=0.8,"
            "application/signed-exchange;v=b3;q=0.7"
        ),
        "sec-fetch-site": "none",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        "sec-fetch-dest": "document",
        "accept-encoding": "gzip, deflate, br",   # NOT zstd — that's Chrome 123+
        "accept-language": "en-US,en;q=0.9",
    }
    if referer:
        h["referer"] = referer
    return h


# ---------------------------------------------------------------------------
# CF challenge detection
# ---------------------------------------------------------------------------

_CF_CHALLENGE_MARKERS = [
    "challenges.cloudflare.com",
    "cf_chl_opt",
    "__cf_chl",
    "challenge-platform",
    "Just a moment",
]


def is_cf_challenge(status: int, headers: dict, body: str) -> bool:
    """Return True if the response is a Cloudflare challenge page."""
    # Most reliable: cf-mitigated header
    if headers.get("cf-mitigated", "").lower() == "challenge":
        return True
    # Body markers
    body_low = body[:4000].lower()
    for marker in _CF_CHALLENGE_MARKERS:
        if marker.lower() in body_low:
            return True
    # 403 with cf-ray usually means IP ban (cookie won't fix) — don't retry those
    return False


def is_cf_ip_ban(status: int, headers: dict, body: str) -> bool:
    """403 error codes 1006/1007/1008/1010 = IP ban. cf_clearance won't help."""
    if status != 403:
        return False
    body_low = body[:2000].lower()
    for code in ("error code: 1006", "error code: 1007", "error code: 1008", "error code: 1010"):
        if code in body_low:
            return True
    return False


# ---------------------------------------------------------------------------
# CF challenge solver (Playwright)
# ---------------------------------------------------------------------------

@dataclass
class CfSession:
    cf_clearance: str = ""
    cf_bm: str = ""
    user_agent: str = ""
    solved_at: float = 0.0
    valid: bool = False

    def is_fresh(self, ttl: int = 1500) -> bool:
        """cf_clearance default TTL is 30 min; we treat it as 25 min to be safe."""
        return self.valid and (time.monotonic() - self.solved_at) < ttl


async def solve_cf_challenge(url: str) -> CfSession:
    """Launch a stealth Playwright browser, navigate to `url`, wait for
    Cloudflare to issue cf_clearance, and return the session cookies + UA.

    Requires: playwright install chromium  (run once after pip install)
    headless=False is intentional — CF detects headless Chrome via several
    navigator properties. Use Xvfb on headless servers.
    """
    session = CfSession()
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        log.error("playwright not installed: pip install playwright && playwright install chromium")
        return session

    # playwright-stealth patches navigator.webdriver and other automation leaks
    stealth_available = False
    try:
        from playwright_stealth import stealth_async
        stealth_available = True
    except ImportError:
        log.warning("playwright-stealth not installed — CF may detect headless: pip install playwright-stealth")

    async with async_playwright() as pw:
        browser_args = [
            "--no-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
            "--disable-web-security",
            "--lang=en-US,en",
        ]
        # headless=False is critical against CF; use Xvfb on Linux servers
        browser = await pw.chromium.launch(headless=False, args=browser_args)
        ctx = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            locale="en-US",
            timezone_id="America/New_York",
            viewport={"width": 1366, "height": 768},
            java_script_enabled=True,
        )
        page = await ctx.new_page()

        if stealth_available:
            await stealth_async(page)

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=CF_TIMEOUT * 1000)

            # Wait for cf_clearance to appear (CF challenge takes 2-10s)
            deadline = time.monotonic() + CF_TIMEOUT
            while time.monotonic() < deadline:
                cookies = await ctx.cookies()
                cf_c = next((c for c in cookies if c["name"] == "cf_clearance"), None)
                if cf_c:
                    session.cf_clearance = cf_c["value"]
                    session.user_agent   = await page.evaluate("() => navigator.userAgent")
                    cf_bm = next((c for c in cookies if c["name"] == "__cf_bm"), None)
                    session.cf_bm        = cf_bm["value"] if cf_bm else ""
                    session.solved_at    = time.monotonic()
                    session.valid        = True
                    log.info("[waf_bypass] cf_clearance obtained for %s", url)
                    break
                await asyncio.sleep(1)

            if not session.valid:
                log.warning("[waf_bypass] CF challenge not solved within %ds for %s", CF_TIMEOUT, url)

        except Exception as e:
            log.error("[waf_bypass] Playwright error: %s", e)
        finally:
            await browser.close()

    return session


# ---------------------------------------------------------------------------
# WafBypassClient — drop-in replacement for httpx when WAF is detected
# ---------------------------------------------------------------------------

class WafBypassClient:
    """curl_cffi-based async HTTP client that impersonates Chrome 120.

    Usage:
        client = WafBypassClient(target_url="https://example.com")
        resp = await client.get("https://example.com/page")

    Automatically:
      - Uses Chrome 120 TLS fingerprint (JA3/JA4)
      - Sets correct HTTP/2 SETTINGS
      - Sends full Chrome header set in wire order
      - Detects CF challenges and solves them with Playwright
      - Recycles cf_clearance cookie across requests
      - Applies jittered delays
    """

    def __init__(self, target_url: str = "", extra_cookies: dict | None = None,
                 extra_headers: dict | None = None):
        self.target_url    = target_url
        self.extra_cookies = dict(extra_cookies or {})
        self.extra_headers = dict(extra_headers or {})
        self._cf_session   = CfSession()
        self._last_request = 0.0

    async def _jitter(self):
        elapsed = time.monotonic() - self._last_request
        delay = random.uniform(WAF_DELAY_MIN, WAF_DELAY_MAX)
        if elapsed < delay:
            await asyncio.sleep(delay - elapsed)
        self._last_request = time.monotonic()

    def _make_session(self):
        """Return a curl_cffi AsyncSession configured for Chrome 120."""
        try:
            from curl_cffi.requests import AsyncSession
        except ImportError:
            raise ImportError(
                "curl_cffi not installed. Run: pip install curl_cffi\n"
                "This is required for WAF bypass (TLS/HTTP2 fingerprint impersonation)."
            )
        cookies = dict(self.extra_cookies)
        if self._cf_session.valid:
            cookies["cf_clearance"] = self._cf_session.cf_clearance
            if self._cf_session.cf_bm:
                cookies["__cf_bm"] = self._cf_session.cf_bm

        # Merge headers: Chrome base → auth headers → caller overrides
        headers = chrome_120_headers(self.target_url)
        headers.update(self.extra_headers)
        # If we have a cf_clearance, use the exact UA that solved the challenge
        if self._cf_session.valid and self._cf_session.user_agent:
            headers["user-agent"] = self._cf_session.user_agent

        proxy = PROXY_URL if PROXY_URL else None
        return AsyncSession(
            impersonate=CF_IMPERSONATE,
            headers=headers,
            cookies=cookies or None,
            proxies={"https": proxy, "http": proxy} if proxy else None,
            verify=False,
            timeout=20,
            allow_redirects=True,
        )

    async def _request(self, method: str, url: str, **kwargs) -> Any:
        await self._jitter()

        async with self._make_session() as session:
            resp = await session.request(method, url, **kwargs)

        # CF challenge detected — solve it then retry once
        if is_cf_challenge(resp.status_code, dict(resp.headers), resp.text):
            if is_cf_ip_ban(resp.status_code, dict(resp.headers), resp.text):
                log.warning("[waf_bypass] IP banned (1006/1007) on %s — proxy rotation needed", url)
                return resp

            log.info("[waf_bypass] CF challenge detected on %s — solving...", url)
            if not self._cf_session.is_fresh():
                self._cf_session = await solve_cf_challenge(url)

            if self._cf_session.valid:
                await self._jitter()
                async with self._make_session() as session:
                    resp = await session.request(method, url, **kwargs)

        return resp

    async def get(self, url: str, **kwargs):
        return await self._request("GET", url, **kwargs)

    async def post(self, url: str, **kwargs):
        return await self._request("POST", url, **kwargs)

    async def request(self, method: str, url: str, **kwargs):
        return await self._request(method, url, **kwargs)

    # Context manager support
    async def __aenter__(self):
        return self

    async def __aexit__(self, *_):
        pass


# ---------------------------------------------------------------------------
# Convenience: convert curl_cffi response to dict (same shape as httpx probes)
# ---------------------------------------------------------------------------

def resp_to_dict(resp) -> dict:
    """Normalize curl_cffi response to the same dict shape probes return."""
    try:
        headers = dict(resp.headers)
    except Exception:
        headers = {}
    try:
        cookies = {k: v for k, v in resp.cookies.items()}
    except Exception:
        cookies = {}
    return {
        "status": resp.status_code,
        "headers": headers,
        "cookies": cookies,
        "body": resp.text,
        "url": str(resp.url),
    }


# ---------------------------------------------------------------------------
# Global bypass session cache (per target domain, reuse cf_clearance)
# ---------------------------------------------------------------------------

_sessions: dict[str, CfSession] = {}


def get_cached_session(domain: str) -> CfSession:
    s = _sessions.get(domain, CfSession())
    return s if s.is_fresh() else CfSession()


def cache_session(domain: str, session: CfSession):
    _sessions[domain] = session


def clear_sessions():
    _sessions.clear()
