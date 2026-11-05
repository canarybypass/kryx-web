"""
Kryx Auth Context - authenticated scanning.

The user supplies a session cookie and/or auth headers (e.g. a bearer token).
Set once per scan; every TARGET-facing request (crawler, detectors, sqlmap)
sends them, so Kryx reaches and tests the authenticated surface - where the
high-value bugs live. External API calls (NVD/Shodan/LLM) must NOT use this.
"""
import httpx
from urllib.parse import urlparse

_HEADERS: dict = {}
_COOKIES: dict = {}

# Origin bypass: when WAF is detected and real server IP is found,
# all target requests route to this IP with a Host header override.
_ORIGIN_IP: str = ""
_ORIGIN_HEADERS: dict = {}  # {"Host": "target.com"}

# WAF bypass mode: when True, client() returns a WafBypassClient (curl_cffi)
# instead of httpx. Set by supervisor after WAF detection.
_WAF_BYPASS_ACTIVE: bool = False
_WAF_TARGET_URL: str = ""


def set_auth(headers: dict | None = None, cookies: dict | None = None):
    global _HEADERS, _COOKIES
    _HEADERS = dict(headers or {})
    _COOKIES = dict(cookies or {})


def set_origin_bypass(ip: str, host_headers: dict | None = None):
    """Activate origin bypass: route all target requests to `ip` directly."""
    global _ORIGIN_IP, _ORIGIN_HEADERS
    _ORIGIN_IP = ip
    _ORIGIN_HEADERS = dict(host_headers or {})


def clear_origin_bypass():
    global _ORIGIN_IP, _ORIGIN_HEADERS
    _ORIGIN_IP = ""
    _ORIGIN_HEADERS = {}


def activate_waf_bypass(target_url: str):
    """Switch all probe requests to WafBypassClient (curl_cffi Chrome impersonation)."""
    global _WAF_BYPASS_ACTIVE, _WAF_TARGET_URL
    _WAF_BYPASS_ACTIVE = True
    _WAF_TARGET_URL = target_url


def deactivate_waf_bypass():
    global _WAF_BYPASS_ACTIVE, _WAF_TARGET_URL
    _WAF_BYPASS_ACTIVE = False
    _WAF_TARGET_URL = ""


def is_waf_bypass_active() -> bool:
    return _WAF_BYPASS_ACTIVE


def clear_auth():
    set_auth({}, {})
    clear_origin_bypass()
    deactivate_waf_bypass()
    from core.harness.waf_bypass import clear_sessions
    clear_sessions()


def is_authed() -> bool:
    return bool(_HEADERS or _COOKIES)


def auth_headers() -> dict:
    return dict(_HEADERS)


def auth_cookies() -> dict:
    return dict(_COOKIES)


def client(target_url: str = "", **kwargs) -> "httpx.AsyncClient | WafBypassClient":
    """Return the right HTTP client for target requests.

    Decision tree:
      1. WAF bypass active  → WafBypassClient (curl_cffi Chrome 120 impersonation)
         Handles: TLS fingerprint (JA3/JA4), HTTP/2 SETTINGS, Chrome headers,
                  CF challenge solving, jittered delays, proxy support
      2. Origin IP known    → httpx + _OriginBypassTransport (direct IP, Host header)
      3. Normal             → plain httpx with auth headers/cookies

    External API calls (NVD, Shodan, LLM) must NOT use this client.
    """
    extra_headers = {**_ORIGIN_HEADERS, **_HEADERS, **(kwargs.pop("headers", None) or {})}
    extra_cookies = {**_COOKIES, **(kwargs.pop("cookies", None) or {})}

    if _WAF_BYPASS_ACTIVE:
        from core.harness.waf_bypass import WafBypassClient
        return WafBypassClient(
            target_url=target_url or _WAF_TARGET_URL,
            extra_cookies=extra_cookies,
            extra_headers=extra_headers,
        )

    transport = None
    if _ORIGIN_IP and target_url:
        transport = _OriginBypassTransport(target_url, _ORIGIN_IP)

    return httpx.AsyncClient(
        headers=extra_headers or None,
        cookies=extra_cookies or None,
        transport=transport,
        **kwargs,
    )


# forward reference satisfied at runtime
try:
    from core.harness.waf_bypass import WafBypassClient
except ImportError:
    WafBypassClient = None  # type: ignore


class _OriginBypassTransport(httpx.AsyncBaseTransport):
    """Rewrites the destination IP to bypass Cloudflare while keeping Host header.

    httpx normally resolves DNS. This transport intercepts the connection and
    forces it to the known origin IP instead, so the WAF layer is skipped.
    """

    def __init__(self, target_url: str, origin_ip: str):
        parsed = urlparse(target_url if target_url.startswith("http") else f"https://{target_url}")
        self._host = parsed.hostname or ""
        self._origin_ip = origin_ip
        self._scheme = parsed.scheme
        self._inner = httpx.AsyncHTTPTransport(verify=False)

    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        # Only rewrite requests going to the target domain
        if request.url.host == self._host:
            rewritten = request.url.copy_with(host=self._origin_ip)
            request = request.__class__(
                method=request.method,
                url=rewritten,
                headers=request.headers,
                stream=request.stream,
                extensions=request.extensions,
            )
        return await self._inner.handle_async_request(request)


def sqlmap_args() -> list[str]:
    """--cookie / --header flags for sqlmap so it scans authenticated."""
    args: list[str] = []
    if _COOKIES:
        args += ["--cookie", "; ".join(f"{k}={v}" for k, v in _COOKIES.items())]
    for k, v in _HEADERS.items():
        args += ["--header", f"{k}: {v}"]
    return args


def parse_cookie_string(s: str) -> dict:
    """Parse 'a=1; b=2' into a dict."""
    out = {}
    for part in (s or "").split(";"):
        if "=" in part:
            k, v = part.split("=", 1)
            out[k.strip()] = v.strip()
    return out
