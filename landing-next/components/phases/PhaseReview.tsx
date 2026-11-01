"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import SectionHeading from "../primitives/SectionHeading";
import Reveal from "../primitives/Reveal";
import CountUp from "../primitives/CountUp";

const { review } = OPERATION;

export default function PhaseReview() {
  const { t } = useI18n();

  return (
    <PhaseShell id="review">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-28">
          <SectionHeading tag={t.review.tag} title={t.review.title} body={t.review.body} />
          <Reveal delay={0.12}>
            <div className="mt-9 panel-2 px-6 py-7">
              <div className="display text-5xl text-danger sm:text-6xl">
                <CountUp to={review.falsePositivesScreened} />
              </div>
              <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink-dim">
                {t.review.screened}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05} y={30}>
          <div className="panel overflow-hidden">
            {/* column headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line bg-black/20 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              <span>{t.review.claimLabel}</span>
              <span />
              <span className="text-right">{t.review.counterLabel}</span>
            </div>

            {review.rounds.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="border-b border-line px-5 py-4"
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <span className="text-[13px] text-ink">{r.claim}</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-line text-ink-faint">
                    <ArrowRight size={12} />
                  </span>
                  <span className="flex items-center justify-end gap-2 text-right text-[13px] text-ink-dim">
                    <X size={13} className="text-danger" />
                    {r.counter}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-good">
                  <span className="h-1 w-1 rounded-full bg-good" />
                  {t.review.resultLabel}: {r.result}
                </div>
              </motion.div>
            ))}

            {/* verdict stamp */}
            <div className="relative grid place-items-center px-5 py-8">
              <motion.div
                initial={{ opacity: 0, scale: 1.4, rotate: -8 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -4 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.5 }}
                className="flex items-center gap-2.5 rounded-md border-2 border-accent/70 bg-accent-soft px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-accent accent-glow"
              >
                <ShieldCheck size={18} strokeWidth={2.4} />
                {review.verdict}
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </PhaseShell>
  );
}
