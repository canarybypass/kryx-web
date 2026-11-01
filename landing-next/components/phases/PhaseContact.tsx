"use client";

import { motion } from "framer-motion";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import SectionHeading from "../primitives/SectionHeading";
import Reveal from "../primitives/Reveal";
import TabbedFinding from "../TabbedFinding";

const { swarm } = OPERATION;

/** The eight vectors, with the injection hunter igniting into contact. */
function ContactPulse() {
  return (
    <div className="panel-2 p-5">
      <div className="flex items-center justify-between font-mono text-[11px] text-ink-faint">
        <span>VECTORS</span>
        <span className="flex items-center gap-1.5 text-danger">
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse-dot" />
          CONTACT
        </span>
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        {swarm.agents.map((a, i) => {
          const hit = a.id === "injection";
          return (
            <motion.span
              key={a.id}
              initial={{ height: 8, opacity: 0.4 }}
              whileInView={{ height: hit ? 44 : [10, 22, 14][i % 3], opacity: hit ? 1 : 0.4 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className={`flex-1 rounded-sm ${
                hit ? "bg-accent shadow-[0_0_12px_2px_rgba(70,229,255,0.6)]" : "bg-ink-ghost"
              }`}
            />
          );
        })}
      </div>
      <div className="mt-4 border-t border-line pt-3 font-mono text-[11px]">
        <span className="text-accent">a01 · sqlmap</span>
        <span className="text-ink-faint"> → positive hit</span>
      </div>
    </div>
  );
}

export default function PhaseContact() {
  const { t } = useI18n();
  return (
    <PhaseShell id="contact">
      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="lg:sticky lg:top-28">
          <SectionHeading tag={t.contact.tag} title={t.contact.title} body={t.contact.body} />
          <Reveal delay={0.12} className="mt-8">
            <ContactPulse />
          </Reveal>
        </div>

        <Reveal delay={0.05} y={30}>
          <TabbedFinding />
        </Reveal>
      </div>
    </PhaseShell>
  );
}
