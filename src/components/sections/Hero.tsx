"use client";

import { motion } from "motion/react";
import HeroCanvas from "@/components/three/HeroCanvas";
import MagneticButton from "@/components/ui/MagneticButton";
import Badge from "@/components/ui/Badge";
import { SITE } from "@/data/site";
import { useT } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

const line = {
  hidden: { opacity: 0, y: 36 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE, delay: 0.35 + i * 0.12 },
  }),
};

export default function Hero() {
  const t = useT();

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden">
      {/* 3D background */}
      <div className="absolute inset-0 z-0">
        <HeroCanvas />
      </div>

      {/* atmospheric overlays */}
      <div className="grid-lines pointer-events-none absolute inset-0 z-[1] opacity-40" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,transparent_30%,var(--color-bg-0)_92%)]" />

      {/* content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pt-24 text-center sm:px-6">
        <motion.div custom={0} variants={line} initial="hidden" animate="show">
          <Badge pulse>
            {SITE.domain} — {t.comingSoon}
          </Badge>
        </motion.div>

        <h1 className="mt-7 font-display text-[clamp(2.1rem,8vw,6rem)] font-semibold leading-[0.98] tracking-tight sm:mt-8">
          <motion.span
            className="block"
            custom={1}
            variants={line}
            initial="hidden"
            animate="show"
          >
            {t.hero.title1}
          </motion.span>
          <motion.span
            className="glow-accent block text-accent"
            custom={2}
            variants={line}
            initial="hidden"
            animate="show"
          >
            {t.hero.title2}
          </motion.span>
        </h1>

        <motion.p
          custom={3}
          variants={line}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-xl text-balance text-sm leading-relaxed text-muted sm:mt-7 sm:text-lg"
        >
          {t.hero.sub}
        </motion.p>

        <motion.div
          custom={4}
          variants={line}
          initial="hidden"
          animate="show"
          className="mt-9 flex w-full flex-col items-center gap-3.5 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4"
        >
          <MagneticButton href="#waitlist" variant="primary" className="w-full sm:w-auto">
            {t.hero.cta1}
            <span aria-hidden>→</span>
          </MagneticButton>
          <MagneticButton href="#terminal" variant="ghost" className="w-full sm:w-auto">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent-2" />
            {t.hero.cta2}
          </MagneticButton>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="eyebrow text-[0.6rem]">{t.hero.scroll}</span>
        <span className="relative flex h-9 w-5 justify-center rounded-full border border-line">
          <motion.span
            animate={{ y: [3, 14, 3], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="mt-1.5 h-1.5 w-1 rounded-full bg-accent"
          />
        </span>
      </motion.div>
    </section>
  );
}
