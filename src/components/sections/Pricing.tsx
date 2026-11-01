"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { useT } from "@/lib/i18n";

export default function Pricing() {
  const t = useT();
  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-10 lg:py-28"
    >
      <SectionHeading
        eyebrow={t.pricing.eyebrow}
        title={
          <>
            {t.pricing.title}{" "}
            <span className="text-accent">{t.pricing.titleAccent}</span>
          </>
        }
        intro={t.pricing.intro}
        align="center"
        className="mb-12 sm:mb-16"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
        {t.pricing.plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08} className="h-full">
            <GlassCard
              glow
              className={`group flex h-full flex-col p-7 sm:p-8 ${
                p.featured ? "border border-accent/40" : ""
              }`}
            >
              {p.featured && (
                <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-bg-0">
                  {t.pricing.popular}
                </span>
              )}

              <div className="font-mono text-xs uppercase tracking-widest text-muted">
                {p.name}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold tracking-tight text-text">
                  {p.price}
                </span>
                {p.period && (
                  <span className="font-mono text-sm text-muted">{p.period}</span>
                )}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted">{p.blurb}</p>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-text"
                  >
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-[10px] text-accent">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <MagneticButton
                  href="#waitlist"
                  variant={p.featured ? "primary" : "ghost"}
                  className="w-full"
                >
                  {t.pricing.cta}
                </MagneticButton>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
