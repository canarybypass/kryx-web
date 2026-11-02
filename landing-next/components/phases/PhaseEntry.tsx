"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import Typewriter from "../primitives/Typewriter";

export default function PhaseEntry() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Hero drifts up and dims slightly as the operation begins.
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="entry"
      ref={ref}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      {/* layered background */}
      <div className="absolute inset-0 scanfield radial-fade opacity-70" />
      <div className="absolute inset-0 scanfield-fine radial-fade opacity-40" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -inset-x-10 h-24 bg-gradient-to-b from-transparent via-accent/[0.06] to-transparent blur-xl animate-sweep" />
      </div>
      <div className="grain pointer-events-none absolute inset-0" />
      {/* center spotlight */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vh] w-[120vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(70,229,255,0.07) 0%, transparent 55%)" }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto w-full max-w-stage px-5 sm:px-8 lg:pl-28 lg:pr-12"
      >
        {/* status line */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.34em] text-ink-faint"
        >
          <span className="flex items-center gap-2 text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            00 · ENTRY
          </span>
          <span className="h-px w-8 bg-line-strong" />
          <span>autonomous engagement</span>
        </motion.div>

        {/* slogan */}
        <h1 className="display max-w-4xl text-balance text-[clamp(2.6rem,8vw,5.5rem)] text-ink">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            {t.entry.sloganA}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="block text-ink-dim"
          >
            {t.entry.sloganB}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-7 max-w-xl text-[15px] leading-relaxed text-ink-dim sm:text-base"
        >
          {t.entry.sub}
        </motion.p>

        {/* command line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.66, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 inline-flex max-w-full items-center gap-3 rounded-lg border border-line bg-panel/80 px-4 py-3 font-mono text-[13px] backdrop-blur-sm sm:text-sm"
        >
          <span className="text-accent">$</span>
          <span className="overflow-x-auto text-ink">
            <Typewriter text={t.entry.boot} startDelay={1100} />
          </span>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            {t.entry.hint}
          </span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-accent"
          >
            ↓
          </motion.span>
        </motion.div>

      {/* target whisper, bottom-right */}
      <div className="absolute bottom-8 right-8 z-10 hidden font-mono text-[10px] tracking-[0.2em] text-ink-faint lg:block">
        TARGET // {OPERATION.target}
      </div>
    </section>
  );
}
