/* ============================================================
   Central content + config. Edit copy / links / pricing here.
   ============================================================ */

export const SITE = {
  name: "Kryx",
  domain: "kryx.io",
  status: "coming soon",
  github: "https://github.com/xxxoff/Kryx",
  // "Launch App" target — point this at the dashboard deploy.
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://kryx.io/app",
  tagline: "Think like the attacker. Find it first.",
  description:
    "An autonomous swarm of agents that breaks in before the real adversary does.",
};

export const NAV = [
  { label: "Pipeline", href: "#pipeline" },
  { label: "Live Scan", href: "#terminal" },
  { label: "Why Kryx", href: "#why" },
  { label: "Engine", href: "#engine" },
  { label: "Pricing", href: "#pricing" },
];
