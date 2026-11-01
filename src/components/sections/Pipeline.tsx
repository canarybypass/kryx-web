"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { STAGES, HUNTERS } from "@/data/pipeline";
import { EASE } from "@/lib/motion";
import { useT } from "@/lib/i18n";

const accentClass = {
  lime: "text-accent",
  cyan: "text-accent-2",
  danger: "text-danger",
} as const;

const accentDot = {
  lime: "bg-accent",
  cyan: "bg-accent-2",
  danger: "bg-danger",
} as const;

export default function Pipeline() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const t = useT();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const railFill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));
    setActive(i);
  });

  return (
    <section
      id="pipeline"
      ref={ref}
      className="relative"
      style={{ height: `${STAGES.length * 62}vh` }}
      aria-label={t.pipeline.eyebrow}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-5 sm:px-6 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-10">
          {/* ---------- rail (desktop) ---------- */}
          <div className="hidden flex-col lg:flex">
            <span className="eyebrow mb-8 flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" />
              {t.pipeline.eyebrow}
            </span>
            <div className="relative flex flex-1 flex-col justify-center">
              <div className="absolute left-[11px] top-0 h-full w-px bg-line" />
              <motion.div
                style={{ top: railFill }}
                className="absolute left-[6px] z-10 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_16px_4px_var(--color-accent)]"
              />
              <ul className="relative flex flex-col gap-9">
                {STAGES.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-4">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] font-mono transition-all duration-500 ${
                        i <= active
                          ? "border-accent/70 bg-accent/10 text-accent"
                          : "border-line text-muted"
                      }`}
                    >
                      {s.index}
                    </span>
                    <span
                      className={`font-display text-sm tracking-tight transition-colors duration-500 ${
                        i === active ? "text-text" : "text-muted"
                      }`}
                    >
                      {t.pipeline.stages[i].name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* mobile eyebrow + step counter */}
          <div className="flex items-center justify-between lg:hidden">
            <span className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" />
              {t.pipeline.eyebrow}
            </span>
            <span className="font-mono text-xs text-muted">
              {STAGES[active].index} / {STAGES.length.toString().padStart(2, "0")}
            </span>
          </div>

          {/* ---------- stage panel ---------- */}
          <div className="relative flex min-h-[58svh] items-start lg:items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={STAGES[active].id}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease: EASE.outExpo }}
                className="w-full"
              >
                <StagePanel index={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* mobile progress dots */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 lg:hidden">
          {STAGES.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-accent" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StagePanel({ index }: { index: number }) {
  const t = useT();
  const meta = STAGES[index];
  const stage = t.pipeline.stages[index];

  return (
    <div>
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-muted">{meta.index}</span>
        <span className={`eyebrow ${accentClass[meta.accent]}`}>
          {stage.tagline}
        </span>
      </div>

      <h3 className="mt-3 font-display text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-none tracking-tight">
        {stage.name}
      </h3>

      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:mt-6 sm:text-lg">
        {stage.body}
      </p>

      <div className="mt-7 sm:mt-8">
        {meta.id === "hunt" ? (
          <HuntVisual />
        ) : meta.id === "validate" ? (
          <ValidateVisual />
        ) : (
          <DetailChips items={stage.detail} dot={accentDot[meta.accent]} />
        )}
      </div>
    </div>
  );
}

function DetailChips({ items, dot }: { items: string[]; dot: string }) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map((d, i) => (
        <motion.li
          key={d}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.06, ease: EASE.outExpo }}
          className="flex items-center gap-2 rounded-full border border-line bg-bg-1/50 px-3.5 py-1.5 font-mono text-xs text-muted"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {d}
        </motion.li>
      ))}
    </ul>
  );
}

function HuntVisual() {
  const t = useT();
  return (
    <div className="grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
      {HUNTERS.map((h, i) => (
        <motion.div
          key={h}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.05, ease: EASE.outExpo }}
          className="group relative rounded-lg border border-line bg-bg-1/60 px-3 py-3"
        >
          <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">
            {t.pipeline.agent}
          </span>
          <span className="font-mono text-xs text-text">{h}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ValidateVisual() {
  const t = useT();
  return (
    <ul className="max-w-md space-y-2 font-mono text-xs sm:text-sm">
      {t.pipeline.validateRows.map((r, i) => (
        <motion.li
          key={r.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 + i * 0.08, ease: EASE.outExpo }}
          className="flex items-center gap-3"
        >
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded ${
              r.ok ? "bg-accent/15 text-accent" : "bg-danger/15 text-danger"
            }`}
          >
            {r.ok ? "✓" : "✕"}
          </span>
          <span
            className={
              r.ok ? "text-text" : "text-muted line-through decoration-danger/70"
            }
          >
            {r.name}
          </span>
          <span
            className={`ml-auto shrink-0 text-[9px] uppercase tracking-wider sm:text-[10px] ${
              r.ok ? "text-accent" : "text-danger"
            }`}
          >
            {r.ok ? t.pipeline.confirmed : t.pipeline.rejected}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
