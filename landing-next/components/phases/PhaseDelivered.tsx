"use client";

import { motion } from "framer-motion";
import { Check, FileText } from "lucide-react";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import SectionHeading from "../primitives/SectionHeading";
import Reveal from "../primitives/Reveal";

const { report } = OPERATION;

const SEV_CLASS: Record<string, string> = {
  CRIT: "border-danger/40 bg-danger/10 text-danger",
  HIGH: "border-danger/25 bg-danger/[0.06] text-danger/80",
  MED: "border-line-strong bg-panel-2 text-ink-dim",
  LOW: "border-line bg-panel text-ink-faint",
};

export default function PhaseDelivered() {
  const { t } = useI18n();

  return (
    <PhaseShell id="delivered">
      <SectionHeading tag={t.delivered.tag} title={t.delivered.title} body={t.delivered.body} className="max-w-3xl" />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* report preview */}
        <Reveal y={30}>
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-black/20 px-5 py-3.5">
              <div className="flex items-center gap-2.5 text-ink">
                <FileText size={15} className="text-accent" />
                <span className="font-mono text-[12px]">{t.delivered.reportTitle}</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-good">signed</span>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              <span>{t.delivered.severityCol}</span>
              <span>{t.delivered.findingCol}</span>
              <span>ref</span>
            </div>

            {report.findings.map((f, i) => (
              <motion.div
                key={f.ref}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-t border-line px-5 py-3.5"
              >
                <span
                  className={`rounded border px-2 py-0.5 text-center font-mono text-[10px] font-medium ${SEV_CLASS[f.sev]}`}
                >
                  {f.sev}
                </span>
                <span className="text-[13.5px] text-ink">{f.title}</span>
                <span className="font-mono text-[11px] text-ink-faint">{f.ref}</span>
              </motion.div>
            ))}

            <div className="border-t border-line px-5 py-3 font-mono text-[11px] text-ink-faint">
              evidence · remediation · re-run command attached to every finding
            </div>
          </div>
        </Reveal>

        {/* trust config + compliance */}
        <div className="space-y-6">
          <Reveal delay={0.1}>
            <div className="panel-2 overflow-hidden font-mono text-[12.5px]">
              <div className="border-b border-line bg-black/20 px-4 py-2.5 text-[11px] text-ink-faint">
                engagement.toml
              </div>
              <div className="space-y-2.5 px-4 py-4">
                {t.delivered.trust.map((line) => (
                  <div key={line} className="flex items-center gap-2.5">
                    <Check size={13} className="shrink-0 text-good" strokeWidth={2.5} />
                    <span className="text-ink-dim">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="panel-2 px-4 py-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                {t.delivered.complianceLabel}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.compliance.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-line bg-panel px-3 py-1.5 font-mono text-[12px] text-ink-dim"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </PhaseShell>
  );
}
