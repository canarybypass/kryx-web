"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { OPERATION, type ReconKind } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import SectionHeading from "../primitives/SectionHeading";
import Reveal from "../primitives/Reveal";
import Typewriter from "../primitives/Typewriter";

const KIND_DOT: Record<ReconKind, string> = {
  root: "bg-accent shadow-[0_0_10px_2px_rgba(70,229,255,0.6)]",
  subdomain: "bg-ink",
  port: "bg-good",
  tech: "bg-ink-dim",
};

const { recon } = OPERATION;
const nodeIndex = new Map(recon.nodes.map((n, i) => [n.id, i]));

function ReconMap({ revealed }: { revealed: number }) {
  return (
    <div className="panel relative aspect-[4/3] w-full overflow-hidden scanfield-fine sm:aspect-[16/10]">
      {/* sweep line */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-sweep" />
      </div>

      {/* links */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {recon.links.map(([from, to], i) => {
          const a = recon.nodes[nodeIndex.get(from)!];
          const b = recon.nodes[nodeIndex.get(to)!];
          const online = (nodeIndex.get(from)! < revealed) && (nodeIndex.get(to)! < revealed);
          return (
            <motion.line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(70,229,255,0.28)"
              strokeWidth={0.25}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={online ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          );
        })}
      </svg>

      {/* nodes */}
      {recon.nodes.map((n, i) => {
        const online = i < revealed;
        return (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={online ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2"
            >
              <span className={`relative h-2 w-2 shrink-0 rounded-full ${KIND_DOT[n.kind]}`}>
                {n.kind === "root" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
                )}
              </span>
              <span className="whitespace-nowrap rounded border border-line bg-bg/85 px-1.5 py-0.5 font-mono text-[9.5px] leading-none text-ink-dim backdrop-blur-sm sm:text-[11px]">
                {online && <Typewriter text={n.label} speed={18} startDelay={120} cursor={false} />}
              </span>
            </motion.div>
          </div>
        );
      })}

      {/* corner readout */}
      <div className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] text-ink-faint">
        ASSETS // <span className="text-accent">{revealed}</span>/{recon.nodes.length}
      </div>
    </div>
  );
}

export default function PhaseRecon() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.4"] });
  const count = useTransform(scrollYProgress, [0, 1], [0, recon.nodes.length]);
  const [revealed, setRevealed] = useState(reduce ? recon.nodes.length : 1);

  useMotionValueEvent(count, "change", (v) => {
    if (reduce) return;
    setRevealed(Math.max(1, Math.min(recon.nodes.length, Math.ceil(v))));
  });

  return (
    <PhaseShell id="recon">
      <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <SectionHeading tag={t.recon.tag} title={t.recon.title} body={t.recon.body} />
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-3">
              {t.recon.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink-dim">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap gap-2">
              {recon.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded border border-line bg-panel px-2.5 py-1 font-mono text-[11px] text-ink-dim"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Reveal>
          {/* legend */}
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {(Object.keys(t.recon.legend) as ReconKind[]).map((k) => (
              <span key={k} className="flex items-center gap-2 font-mono text-[11px] text-ink-faint">
                <span className={`h-2 w-2 rounded-full ${KIND_DOT[k]}`} />
                {t.recon.legend[k]}
              </span>
            ))}
          </div>
        </div>

        <Reveal delay={0.05} y={30}>
          <ReconMap revealed={revealed} />
        </Reveal>
      </div>
    </PhaseShell>
  );
}
