"use client";

import { motion } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { useT } from "@/lib/i18n";

export default function Comparison() {
  const t = useT();
  const cols = [t.comparison.capability, ...t.comparison.cols];

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
      <SectionHeading
        eyebrow={t.comparison.eyebrow}
        title={
          <>
            {t.comparison.title}{" "}
            <span className="text-accent">{t.comparison.titleAccent}</span>
          </>
        }
        intro={t.comparison.intro}
        className="mb-12 sm:mb-14"
      />

      {/* ---------- desktop / tablet table ---------- */}
      <Reveal className="hidden sm:block">
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] bg-bg-1">
            {cols.map((c, i) => (
              <div
                key={c}
                className={`px-4 py-5 sm:px-6 ${i === 1 ? "relative bg-accent/[0.06]" : ""}`}
              >
                {i === 1 && (
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                )}
                <span
                  className={`font-display text-sm font-semibold tracking-tight sm:text-base ${
                    i === 1 ? "text-accent" : i === 0 ? "text-muted" : "text-text"
                  }`}
                >
                  {c}
                </span>
              </div>
            ))}
          </div>

          {t.comparison.rows.map((row, r) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: r * 0.05, duration: 0.5 }}
              className="grid grid-cols-[1.3fr_1fr_1fr_1fr] border-t border-line text-sm"
            >
              <div className="px-4 py-5 font-mono text-xs text-muted sm:px-6 sm:text-sm">
                {row.label}
              </div>
              <div className="relative bg-accent/[0.04] px-4 py-5 sm:px-6">
                <span className="flex items-start gap-2 font-medium text-text">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {row.kryx}
                </span>
              </div>
              <div className="px-4 py-5 text-muted sm:px-6">{row.manual}</div>
              <div className="px-4 py-5 text-muted sm:px-6">{row.scanner}</div>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* ---------- mobile stacked cards ---------- */}
      <div className="space-y-3 sm:hidden">
        {t.comparison.rows.map((row, r) => (
          <Reveal key={row.label} delay={r * 0.04}>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="border-b border-line bg-bg-1 px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                {row.label}
              </div>
              <div className="flex items-start gap-3 bg-accent/[0.05] px-4 py-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
                    {t.comparison.cols[0]}
                  </div>
                  <div className="text-sm font-medium text-text">{row.kryx}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-line border-t border-line">
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {t.comparison.cols[1]}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">{row.manual}</div>
                </div>
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {t.comparison.cols[2]}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">{row.scanner}</div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
