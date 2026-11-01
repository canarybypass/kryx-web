"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { PHASES } from "@/lib/content";
import { useActivePhase } from "@/lib/hooks";

/**
 * TimelineRail — the vertical spine of the engagement. Fixed to the left edge
 * on desktop; a thin line that fills as you scroll, with a tick per phase and
 * a highlight on the active one. Hidden on small screens (the phases stack as
 * plain blocks there). Scroll-linked fill is user-driven, so it stays even
 * under prefers-reduced-motion.
 */
export default function TimelineRail() {
  const active = useActivePhase();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const headTop = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-7 top-1/2 z-30 hidden h-[62vh] -translate-y-1/2 lg:block"
    >
      {/* track */}
      <div className="relative h-full w-px bg-line">
        {/* fill */}
        <motion.div
          className="absolute left-0 top-0 w-px origin-top bg-gradient-to-b from-accent via-accent to-accent/30"
          style={{ scaleY: progress, height: "100%" }}
        />
        {/* moving head glow */}
        <motion.div
          className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(70,229,255,0.7)]"
          style={{ top: headTop }}
        />

        {/* ticks */}
        <div className="absolute inset-0">
          {PHASES.map((p, i) => {
            const top = `${(i / (PHASES.length - 1)) * 100}%`;
            const isActive = i === active;
            const isPast = i < active;
            return (
              <div
                key={p.id}
                className="absolute left-0 flex -translate-y-1/2 items-center gap-3"
                style={{ top }}
              >
                <span
                  className={`-ml-[3px] h-1.5 w-1.5 rounded-full border transition-all duration-500 ${
                    isActive
                      ? "scale-150 border-accent bg-accent shadow-[0_0_10px_2px_rgba(70,229,255,0.6)]"
                      : isPast
                        ? "border-accent/50 bg-accent/50"
                        : "border-ink-ghost bg-bg"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] tracking-[0.18em] transition-all duration-500 ${
                    isActive
                      ? "translate-x-0 text-accent opacity-100"
                      : "text-ink-faint opacity-0 -translate-x-1"
                  }`}
                >
                  {p.index} · {p.code}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
