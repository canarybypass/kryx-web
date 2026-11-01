"use client";

import { motion, useReducedMotion } from "framer-motion";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import SectionHeading from "../primitives/SectionHeading";
import Reveal from "../primitives/Reveal";

const { swarm } = OPERATION;
const CORE = { x: 5, y: 50 };

// Precompute a fan of beams from the core to eight evenly spread endpoints.
const beams = swarm.agents.map((agent, i) => {
  const ey = 8 + i * (84 / (swarm.agents.length - 1)); // 8..92
  const ex = 66;
  const cpx = 34;
  const cpy = CORE.y + (ey - CORE.y) * 0.25;
  return {
    ...agent,
    ex,
    ey,
    d: `M ${CORE.x} ${CORE.y} Q ${cpx} ${cpy} ${ex} ${ey}`,
  };
});

function BeamField() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <div className="panel relative hidden h-[460px] w-full overflow-hidden scanfield-fine lg:block">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(70,229,255,0.7)" />
            <stop offset="100%" stopColor="rgba(70,229,255,0.12)" />
          </linearGradient>
        </defs>
        {beams.map((b, i) => (
          <g key={b.id}>
            {/* base beam draws out from the core, near-simultaneous */}
            <motion.path
              d={b.d}
              fill="none"
              stroke="url(#beam)"
              strokeWidth={0.4}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* flowing pulse along the beam */}
            {!reduce && (
              <motion.path
                d={b.d}
                fill="none"
                stroke="rgba(70,229,255,0.95)"
                strokeWidth={0.6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="0.12 0.88"
                initial={{ strokeDashoffset: 1, opacity: 0 }}
                whileInView={{ strokeDashoffset: [1, 0], opacity: [0, 1, 1, 0.6] }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 2.4, delay: 0.9 + i * 0.05, repeat: Infinity, ease: "linear" }}
              />
            )}
          </g>
        ))}
      </svg>

      {/* core */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${CORE.x}%`, top: `${CORE.y}%` }}>
        <div className="relative grid h-12 w-12 place-items-center">
          {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />}
          <span className="absolute inset-2 rounded-full border border-accent-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_3px_rgba(70,229,255,0.7)]" />
        </div>
      </div>

      {/* endpoints + labels */}
      {beams.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.7 + i * 0.05 }}
          className="absolute flex -translate-y-1/2 items-center gap-2.5"
          style={{ left: `${b.ex}%`, top: `${b.ey}%` }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_1px_rgba(70,229,255,0.6)]" />
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-[12px] leading-tight text-ink">{t.swarm.agents[b.id]}</span>
            <span className="font-mono text-[10px] text-ink-faint">a{String(i + 1).padStart(2, "0")} · {b.tool}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function AgentGrid() {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:hidden">
      {swarm.agents.map((a, i) => (
        <Reveal key={a.id} delay={i * 0.04}>
          <div className="panel-2 flex items-center gap-3 px-3.5 py-3">
            <span className="font-mono text-[11px] text-accent">a{String(i + 1).padStart(2, "0")}</span>
            <span className="h-8 w-px bg-line" />
            <span className="min-w-0">
              <span className="block text-[13px] text-ink">{t.swarm.agents[a.id]}</span>
              <span className="font-mono text-[10px] text-ink-faint">{a.tool}</span>
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function PhaseSwarm() {
  const { t } = useI18n();
  return (
    <PhaseShell id="swarm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading tag={t.swarm.tag} title={t.swarm.title} body={t.swarm.body} className="max-w-3xl" />
        <Reveal delay={0.1}>
          <div className="flex items-center gap-2 rounded-full border border-accent-line bg-accent-soft px-3.5 py-1.5 font-mono text-[11px] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            {t.swarm.parallel}
          </div>
        </Reveal>
      </div>

      <div className="mt-10">
        <Reveal y={30}>
          <BeamField />
        </Reveal>
        <AgentGrid />
      </div>

      {/* tool ticker */}
      <div className="relative mt-6 overflow-hidden rounded-lg border border-line bg-panel/60 py-2.5 gradient-edge-x">
        <Marquee />
      </div>
    </PhaseShell>
  );
}

function Marquee() {
  const reduce = useReducedMotion();
  const items = [...swarm.ticker, ...swarm.ticker];
  if (reduce) {
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 font-mono text-[11px] text-ink-faint">
        {swarm.ticker.map((tool) => (
          <span key={tool}>
            <span className="text-accent/70">$</span> {tool}
          </span>
        ))}
      </div>
    );
  }
  return (
    <motion.div
      className="flex w-max gap-10 whitespace-nowrap font-mono text-[11px] text-ink-faint"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
    >
      {items.map((tool, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-accent/70">▸</span>
          {tool}
        </span>
      ))}
    </motion.div>
  );
}
