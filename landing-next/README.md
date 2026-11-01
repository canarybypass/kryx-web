# Kryx — The Engagement

A premium, scroll-driven landing page for **Kryx** (kryx.sh) — an autonomous
multi-agent penetration testing platform.

> Think like the attacker. Find it first.

The entire page is **one continuous hacking operation unfolded vertically**.
Scrolling is the passage of time through a single live engagement: from target
acquisition, through a swarm of hunter agents, to an adversarially-validated,
proven APT-grade exploit chain and a board-ready report. A timeline rail on the
left draws itself as you scroll and highlights the current phase.

This is a static front-end — all operation data and logs are fake constants
that simulate a live run.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — design tokens in `tailwind.config.ts` / `app/globals.css`
- **Framer Motion** — scroll-linked (`useScroll` / `useTransform`) cinematics
- **Lenis** — smooth scroll (auto-disabled under `prefers-reduced-motion`)
- **lucide-react** — icons
- **i18n** — `en` / `ru`, all copy in `lib/content.ts`

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start dev server → http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

> The first `dev`/`build` fetches **Space Grotesk** and **JetBrains Mono** via
> `next/font/google`, so an internet connection is required on first run.

## The phases (this is the structure)

| #  | Phase     | What happens |
|----|-----------|--------------|
| 00 | `ENTRY`   | Full-screen intro — slogan, blinking `kryx engage` command, scan-grid field |
| 01 | `RECON`   | The target map assembles node-by-node as you scroll (domains, ports, tech) |
| 02 | `SWARM`   | Eight hunter agents fan out from a core along animated beams, tool ticker |
| 03 | `CONTACT` | A vector lights up — the finding opens with clickable **Evidence / Exploit / Remediation** tabs (`layoutId`) |
| 04 | `REVIEW`  | A validator agent tries to disprove the finding · false-positive counter · `VALIDATED` stamp |
| 05 | `CHAIN`   | Findings link into a kill-chain graph — SVG paths draw on scroll, nodes are clickable |
| 06 | `PROVEN`  | Status flips to **EXPLOIT PROVEN** — accent flash, strike summary |
| 07 | `REPORT`  | Board-ready report preview · trust config · compliance badges |
| 08 | `ACCESS`  | Pricing as engine access tiers (Starter / Pro / Enterprise) |
| 09 | `ENGAGE`  | Closing command line + waitlist form + footer |

## Project layout

```
app/
  layout.tsx        fonts, providers, Navbar, TimelineRail
  page.tsx          composes the phases in order
  globals.css       design tokens, scan-grid, reduced-motion fallbacks
components/
  Navbar.tsx        sticky nav + live phase indicator
  TimelineRail.tsx  the scroll-driven left spine
  TabbedFinding.tsx Evidence / Exploit / Remediation core (phase 03)
  KillChainGraph.tsx scroll-drawn, clickable graph (phase 05)
  SmoothScroll.tsx  Lenis (reduced-motion aware)
  Footer.tsx
  phases/           PhaseEntry … PhaseEngage
  primitives/       Terminal, Typewriter, Reveal, CountUp, SectionHeading,
                    PhaseShell, Logo
lib/
  content.ts        OPERATION data (neutral) + COPY (en / ru)
  i18n.tsx          locale provider / hook
  hooks.ts          useActivePhase, useMounted
```

## Design system

- **Background** `#050507`, **panels** `#0C0D10` with hairline `rgba` borders.
- A single accent — **electric cyan `#46E5FF`** — reserved for statuses, active
  tabs and the `EXPLOIT PROVEN` climax. Everything else is a graphite-to-white
  scale. Red (`#FF5B5B`) appears only as a severity/danger status.
- **Space Grotesk** for display type, **JetBrains Mono** for commands, logs and
  phase labels.

## Accessibility

- Full **`prefers-reduced-motion`** support: smooth scroll is disabled, all
  scroll-linked sequences collapse to calm static blocks, marquees and loops
  stop, and reveals render in place.
- Visible focus rings, `aria` roles on the finding tabs, keyboard-operable
  kill-chain nodes and language toggle.
- Mobile-first; verified at 375 / 768 / 1440.

## Internationalisation

Toggle `EN / RU` in the navbar. All strings live in `lib/content.ts` under
`COPY`; structural operation telemetry is language-neutral in `OPERATION`.

---

© 2026 Kryx · **Authorised security testing only.**
GitHub: [github.com/xxxoff/Kryx](https://github.com/xxxoff/Kryx)
