# Kryx — Marketing Landing

A premium, 3D-driven marketing site for **Kryx**, an autonomous multi-agent
penetration-testing platform.

> **Slogan:** _Think like the attacker. Find it first._

This is a standalone showcase site. It does **not** contain the product
dashboard — the "Launch App" button links out to it (see
[Linking the dashboard](#linking-the-dashboard)).

---

## Quick start

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build
```

Requires **Node 20+** (developed on Node 22).

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| 3D | React Three Fiber + drei + postprocessing |
| Shaders | Custom GLSL (noise distortion, glow, travelling-pulse edges) |
| Scroll / motion | GSAP + ScrollTrigger, Lenis smooth-scroll, Framer Motion |
| Styling | Tailwind CSS v4 (design tokens in `globals.css`) |
| Fonts | Space Grotesk (display) + JetBrains Mono (mono) via `next/font` |

---

## Project structure

```
web/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx        # fonts, metadata, providers
│  │  ├─ page.tsx          # section composition (edit section order here)
│  │  ├─ globals.css       # ◀ DESIGN TOKENS (colours, fonts, utilities)
│  │  └─ icon.svg          # favicon
│  ├─ lib/
│  │  ├─ fonts.ts          # next/font config
│  │  ├─ gpu.ts            # detect-gpu → scene quality (high/low/static)
│  │  └─ motion.ts         # reduced-motion hook + easing tokens
│  ├─ data/                # ◀ ALL COPY / CONTENT lives here
│  │  ├─ site.ts           # name, links, appUrl, tagline, nav
│  │  ├─ pipeline.ts       # the 5 stages + 8 hunters
│  │  ├─ tools.ts          # integrated engine tools
│  │  ├─ comparison.ts     # comparison table + differentiators
│  │  ├─ pricing.ts        # plans
│  │  └─ terminal-log.ts   # demo scan stream (fictional)
│  └─ components/
│     ├─ providers/        # Lenis, Cursor, ScrollProgress, MotionConfig
│     ├─ three/            # ◀ 3D scenes + shaders
│     │  ├─ AttackGraph.tsx   # primary hero scene (node graph + core)
│     │  ├─ CoreFallback.tsx  # lighter scene for weak GPUs
│     │  ├─ Scene.tsx         # Canvas + postprocessing (bloom/CA)
│     │  ├─ HeroCanvas.tsx    # lazy loader + quality gating + poster
│     │  ├─ EchoCanvas.tsx    # final-CTA 3D echo (high-tier only)
│     │  └─ shaders/*.glsl.ts # GLSL source as template strings
│     ├─ sections/         # one file per page section
│     └─ ui/               # buttons, cards, badges, nav, forms
```

---

## Customising

### Colours & fonts

All design tokens live in **`src/app/globals.css`** under `@theme`:

```css
--color-accent:   #b6ff3c;  /* signature: toxic lime */
--color-accent-2: #18e0ff;  /* secondary: cyber cyan  */
--color-danger:   #ff2e4d;  /* semantic "rejected" only */
--color-bg-0:     #050507;  /* base black */
```

Change them here and they propagate everywhere (utilities like `bg-accent`,
`text-accent-2`, and the 3D scenes which read the same hexes).

> The 3D shaders hold their own copies of the accent hexes in
> `AttackGraph.tsx` / `CoreFallback.tsx` (`ACCENT`, `SECONDARY`). Update those
> two constants too if you re-brand.

Fonts are swapped in **`src/lib/fonts.ts`** (any `next/font/google` family).

### Copy / text

Edit the files in **`src/data/`** — nothing is hard-coded in components:

- Headlines & nav → `site.ts`
- Pipeline stages / hunters → `pipeline.ts`
- Tool list → `tools.ts`
- Comparison rows & differentiators → `comparison.ts`
- Pricing tiers → `pricing.ts`
- The streamed scan log → `terminal-log.ts` _(fictional / demo only)_

### The 3D hero

- **Swap the scene:** `src/components/three/Scene.tsx` chooses
  `AttackGraph` (high) vs `CoreFallback` (low).
- **Tune the look:** node count / radius in `AttackGraph.tsx`
  (`NODE_COUNT`, `CLOUD_RADIUS`); shader behaviour in
  `three/shaders/*.glsl.ts`.
- **Postprocessing:** bloom / chromatic-aberration strength in `Scene.tsx`.
- **Quality gating:** `src/lib/gpu.ts` decides `high | low | static` from
  `detect-gpu`, screen size, pointer type and `prefers-reduced-motion`.

---

## Linking the dashboard

The "Launch App" button (navbar + footer) points at
`process.env.NEXT_PUBLIC_APP_URL`, defined in **`src/data/site.ts`**.

Set it in `.env.local` (see `.env.example`):

```bash
NEXT_PUBLIC_APP_URL=https://app.kryx.io      # or http://localhost:5173, etc.
```

If/when the product dashboard lands in this repo (e.g. a `frontend/` app),
point this at its deployed URL or route. The landing never imports the
dashboard — it only links to it.

> The waitlist form (`ui/WaitlistForm.tsx`) is **front-end only** right now.
> Wire its `submit` handler to a real endpoint (`POST /api/waitlist`) when the
> backend is live — look for the `TODO`.

---

## Performance & accessibility

- **Lazy 3D** — the WebGL bundle is `dynamic(..., { ssr: false })`; first paint
  ships ~100 kB JS, three.js loads after.
- **Adaptive scenes** — desktop GPUs get the full attack graph; weak
  GPUs/mobile get the lighter crystalline core; reduced-motion / no-WebGL get a
  static CSS poster.
- **Reduced motion** — Lenis, the custom cursor, the terminal typing and all
  Framer Motion animations (`MotionConfig reducedMotion="user"`) stand down.
- **A11y** — semantic landmarks, skip-link, focus-visible rings, AA contrast,
  the marquee is `aria-hidden` with an accessible static grid beside it.

### Recommended Lighthouse check

```bash
npm run build && npm run start
# then run Lighthouse against http://localhost:3000
```

Targets: Performance ≥ 80 (with 3D), Accessibility ≥ 95.

---

## Content & safety note

The terminal "scan", findings and attack chains are **fictional
demonstration data**. The site contains **no working exploits or payloads** —
it markets the product, it does not perform attacks.
```
