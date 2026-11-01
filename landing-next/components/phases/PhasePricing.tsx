"use client";

import { Check } from "lucide-react";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import SectionHeading from "../primitives/SectionHeading";
import Reveal from "../primitives/Reveal";

export default function PhasePricing() {
  const { t } = useI18n();

  return (
    <PhaseShell id="license">
      <SectionHeading
        tag={t.license.tag}
        title={t.license.title}
        body={t.license.body}
        align="center"
        className="mx-auto"
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {OPERATION.pricing.map((tier, i) => {
          const copy = t.license.tiers[tier.id];
          const features = [tier.targets, tier.agents, tier.history, copy.rbac, ...copy.extras];
          return (
            <Reveal key={tier.id} delay={i * 0.08} y={28}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-6 sm:p-7 ${
                  tier.featured
                    ? "border-accent-line bg-gradient-to-b from-accent-soft to-panel shadow-[0_0_50px_-20px_rgba(70,229,255,0.5)]"
                    : "border-line bg-panel"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-accent-line bg-bg px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    {t.license.recommended}
                  </span>
                )}

                <h3 className="font-mono text-[13px] uppercase tracking-[0.2em] text-ink">{copy.name}</h3>
                <p className="mt-2 min-h-[40px] text-[13px] leading-relaxed text-ink-dim">{copy.tagline}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className={`display text-4xl ${tier.featured ? "accent-text" : "text-ink"}`}>
                    {tier.price}
                  </span>
                  <span className="font-mono text-[13px] text-ink-faint">{t.license.perMonth}</span>
                </div>

                <div className="my-6 hairline" />

                <ul className="flex-1 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink-dim">
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        className={`mt-0.5 shrink-0 ${tier.featured ? "text-accent" : "text-ink-faint"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#engage"
                  className={`mt-7 block rounded-lg px-4 py-3 text-center font-mono text-[13px] transition-all ${
                    tier.featured
                      ? "border border-accent-line bg-accent text-bg hover:bg-accent/90"
                      : "border border-line text-ink hover:border-line-strong hover:bg-panel-2"
                  }`}
                >
                  {t.license.cta}
                </a>
              </div>
            </Reveal>
          );
        })}
      </div>
    </PhaseShell>
  );
}
