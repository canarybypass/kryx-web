"use client";

import { motion } from "framer-motion";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import Reveal from "../primitives/Reveal";

const { proven } = OPERATION;

export default function PhaseProven() {
  const { t } = useI18n();
  const stats = [
    { label: t.proven.stats.duration, value: proven.duration },
    { label: t.proven.stats.requests, value: proven.requests },
    { label: t.proven.stats.hops, value: String(proven.chainHops) },
    { label: t.proven.stats.blast, value: proven.blastRadius },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* accent flash on entry */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.5, 0] }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 1.1, times: [0, 0.2, 1], ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(60% 50% at 50% 40%, rgba(70,229,255,0.18), transparent 70%)" }}
      />
      <div className="pointer-events-none absolute inset-0 scanfield opacity-40" />

      <PhaseShell id="proven" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* status flip */}
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.26em] text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {t.proven.tag}
            </div>
          </Reveal>

          <motion.h2
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="display accent-text accent-glow mt-7 text-[clamp(2.6rem,9vw,6rem)] leading-[0.92]"
          >
            {t.proven.status}
          </motion.h2>

          <Reveal delay={0.25}>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-dim sm:text-base">
              {t.proven.body}
            </p>
          </Reveal>
        </div>

        {/* strike summary */}
        <Reveal delay={0.1} y={28}>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-panel px-5 py-7 text-center">
                <div className="display text-2xl text-ink sm:text-3xl">{s.value}</div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </PhaseShell>
    </div>
  );
}
