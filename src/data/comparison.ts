export type Row = {
  label: string;
  kryx: string;
  manual: string;
  scanner: string;
  // which column "wins" for subtle highlighting
};

export const COMPARISON: Row[] = [
  {
    label: "Time to first findings",
    kryx: "Minutes",
    manual: "Days–weeks",
    scanner: "Hours",
  },
  {
    label: "Coverage",
    kryx: "8 parallel hunters + chains",
    manual: "Limited by headcount",
    scanner: "Signature breadth only",
  },
  {
    label: "Autonomy",
    kryx: "Fully autonomous swarm",
    manual: "Fully manual",
    scanner: "Scheduled, no reasoning",
  },
  {
    label: "False positives",
    kryx: "Near-zero — adversarially validated",
    manual: "Low, but slow",
    scanner: "High — noise floods triage",
  },
  {
    label: "Attack chains",
    kryx: "APT-grade multi-step paths",
    manual: "Expert-dependent",
    scanner: "None — isolated CVEs",
  },
  {
    label: "Real exploitation",
    kryx: "Drives real tools",
    manual: "Yes",
    scanner: "Mostly passive checks",
  },
];

export const DIFFERENTIATORS = [
  {
    id: "validation",
    title: "Adversarial validation",
    desc: "A second, independent agent attacks every finding and tries to disprove it. Only what survives the assault is reported — so triage stops being a tax.",
    metric: "≈ 0",
    metricLabel: "false positives",
  },
  {
    id: "tools",
    title: "Real tools, real exploitation",
    desc: "Kryx orchestrates nmap, nuclei, sqlmap, ffuf and more — driving them like an operator would. Not a model hallucinating a scanner it never ran.",
    metric: "9+",
    metricLabel: "integrated tools",
  },
  {
    id: "chains",
    title: "APT-grade attack chains",
    desc: "Individual weaknesses are stitched into the multi-step routes a real adversary would walk — privilege escalation, lateral movement, impact.",
    metric: "5",
    metricLabel: "stage pipeline",
  },
  {
    id: "swarm",
    title: "An autonomous swarm",
    desc: "Eight specialist hunters work the target in parallel, coordinated by a central core. A fleet of operators — not a single prompt in a loop.",
    metric: "8",
    metricLabel: "parallel hunters",
  },
];
