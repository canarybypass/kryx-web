/* ============================================================
   Demonstration scan log. PURELY FICTIONAL / for show.
   No working exploits or payloads — illustrative output only.
   ============================================================ */

export type LogKind =
  | "sys" // kryx system line
  | "tool" // a tool being invoked
  | "info" // neutral info
  | "found" // a finding surfaced
  | "ok" // validated / confirmed
  | "rejected" // false positive culled
  | "stage"; // stage header

export type LogLine = {
  kind: LogKind;
  text: string;
  // optional delay multiplier for pacing
  pause?: number;
};

export const SCAN_LOG: LogLine[] = [
  { kind: "sys", text: "kryx engine v1.0 — session a7f3c9 initialised", pause: 1 },
  { kind: "sys", text: "target → demo.acme-corp.example  (authorised scope)", pause: 1.4 },

  { kind: "stage", text: "STAGE 01 · RECON" },
  { kind: "tool", text: "nmap   -sV -T4 demo.acme-corp.example" },
  { kind: "info", text: "  443/tcp  open  https   nginx/1.25.3" },
  { kind: "info", text: "  22/tcp   open  ssh     OpenSSH 9.6" },
  { kind: "tool", text: "subfinder -d acme-corp.example" },
  { kind: "info", text: "  + api.acme-corp.example" },
  { kind: "info", text: "  + staging.acme-corp.example", pause: 1.2 },
  { kind: "tool", text: "crt.sh  + whatweb  → 14 hosts fingerprinted", pause: 1.4 },

  { kind: "stage", text: "STAGE 02 · HUNT  (8 agents)" },
  { kind: "tool", text: "nuclei  -severity medium,high,critical" },
  { kind: "found", text: "  [hunter:cve]    outdated component → CVE-2024-XXXX" },
  { kind: "found", text: "  [hunter:config] verbose error leaks stack trace" },
  { kind: "tool", text: "ffuf    -w params  api.acme-corp.example/v1/FUZZ" },
  { kind: "found", text: "  [hunter:injection] reflected parameter on /v1/search" },
  { kind: "tool", text: "sqlmap  --batch  (confirm-only, scoped)" },
  { kind: "found", text: "  [hunter:cors]   wildcard ACAO with credentials" },
  { kind: "found", text: "  [hunter:xss]    candidate sink in /profile", pause: 1.4 },

  { kind: "stage", text: "STAGE 03 · VALIDATE  (adversarial)" },
  { kind: "info", text: "  re-testing 6 candidate findings…" },
  { kind: "rejected", text: "  ✕ xss /profile — sink sanitised, cannot trigger" },
  { kind: "rejected", text: "  ✕ cve component — version not actually exposed" },
  { kind: "ok", text: "  ✓ injection /v1/search — confirmed, evidence captured" },
  { kind: "ok", text: "  ✓ cors wildcard — confirmed exploitable" },
  { kind: "ok", text: "  ✓ config stack-trace — confirmed leak", pause: 1.2 },

  { kind: "stage", text: "STAGE 04 · CHAIN BUILDER" },
  { kind: "info", text: "  cors-trust → injection → data read" },
  { kind: "found", text: "  chain#1  severity HIGH  · 3 steps · validated", pause: 1.3 },

  { kind: "stage", text: "STAGE 05 · REPORT" },
  { kind: "ok", text: "  4 validated findings · 2 false positives culled" },
  { kind: "sys", text: "report.md generated → ready for engineering", pause: 1.6 },
];
