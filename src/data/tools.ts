export type Tool = {
  name: string;
  role: string;
  stage: string;
};

// Real tools wired under the hood — shown as the "engine".
// Only tools actually integrated in the engine are listed (no aspirational picks).
export const TOOLS: Tool[] = [
  { name: "nmap", role: "Port & service mapping", stage: "Recon" },
  { name: "subfinder", role: "Passive subdomain discovery", stage: "Recon" },
  { name: "crt.sh", role: "Certificate transparency", stage: "Recon" },
  { name: "whatweb", role: "Tech fingerprinting", stage: "Recon" },
  { name: "Playwright", role: "JS-aware crawl & DOM", stage: "Recon" },
  { name: "nuclei", role: "Templated CVE / exposure scanning", stage: "Hunt" },
  { name: "sqlmap", role: "Injection exploitation", stage: "Hunt" },
  { name: "ssl audit", role: "TLS / cipher analysis", stage: "Hunt" },
  { name: "semgrep", role: "Source code SAST", stage: "Hunt" },
  { name: "gitleaks", role: "Secret scanning", stage: "Hunt" },
  { name: "NVD API", role: "CVE intelligence", stage: "Hunt" },
];
