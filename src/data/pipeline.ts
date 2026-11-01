export type Stage = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  body: string;
  detail: string[];
  accent: "lime" | "cyan" | "danger";
};

export const STAGES: Stage[] = [
  {
    id: "recon",
    index: "01",
    name: "Recon",
    tagline: "Map the attack surface",
    body: "Kryx fingerprints everything reachable — DNS, WHOIS, live HTTP services and the full subdomain footprint — before a single probe is fired.",
    detail: ["DNS / WHOIS", "HTTP fingerprinting", "Subdomain discovery", "Surface graph"],
    accent: "cyan",
  },
  {
    id: "hunt",
    index: "02",
    name: "Hunt",
    tagline: "Eight hunters, in parallel",
    body: "A swarm of eight specialist agents attacks at once — each owning a class of weakness, each driving real tooling, not guessing.",
    detail: [
      "Injection",
      "XSS",
      "Auth",
      "Config",
      "CORS",
      "Network",
      "Info-disclosure",
      "CVE",
    ],
    accent: "lime",
  },
  {
    id: "validate",
    index: "03",
    name: "Validate",
    tagline: "Adversarial proof, near-zero false positives",
    body: "An independent agent tries to disprove every finding. Anything it can't confirm is rejected — so what survives is real.",
    detail: ["Independent reviewer", "Disprove, then keep", "Evidence required", "False positives culled"],
    accent: "danger",
  },
  {
    id: "chain",
    index: "04",
    name: "Chain Builder",
    tagline: "From findings to attack paths",
    body: "Isolated issues are assembled into APT-grade kill chains — the multi-step routes a real operator would actually take.",
    detail: ["Path synthesis", "Privilege escalation", "Lateral movement", "Impact modelling"],
    accent: "cyan",
  },
  {
    id: "report",
    index: "05",
    name: "Reporter",
    tagline: "A report your team can act on",
    body: "Everything resolves into a professional, evidence-backed pentest report in clean markdown — ready to ship to engineering.",
    detail: ["Executive summary", "Reproduction steps", "Severity & impact", "Markdown export"],
    accent: "lime",
  },
];

export const HUNTERS = [
  "injection",
  "xss",
  "auth",
  "config",
  "cors",
  "network",
  "info-disclosure",
  "cve",
] as const;
