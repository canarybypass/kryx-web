"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Bug, Crosshair, KeyRound, Share2, SquareTerminal } from "lucide-react";
import { OPERATION, type ChainKind } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

const { chain } = OPERATION;
const nodeIndex = new Map(chain.nodes.map((n, i) => [n.id, i]));

const ICONS: Record<ChainKind, typeof Bug> = {
  recon: Crosshair,
  vuln: Bug,
  creds: KeyRound,
  lateral: Share2,
  rce: SquareTerminal,
};

function edgePath(from: string, to: string) {
  const a = chain.nodes[nodeIndex.get(from)!];
  const b = chain.nodes[nodeIndex.get(to)!];
  const mx = (a.x + b.x) / 2;
  // gentle S-curve through a midpoint
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

function Edge({
  d,
  index,
  total,
  progress,
}: {
  d: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const length = useTransform(progress, [index / total, (index + 1) / total], [0, 1], { clamp: true });
  return (
    <>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.35} />
      <motion.path
        d={d}
        fill="none"
        stroke="url(#chainGrad)"
        strokeWidth={0.55}
        strokeLinecap="round"
        style={{ pathLength: length }}
      />
    </>
  );
}

export default function KillChainGraph() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });

  const [lit, setLit] = useState(1);
  const [selected, setSelected] = useState<string>(chain.nodes[0].id);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setLit(Math.max(1, Math.min(chain.nodes.length, Math.floor(v * chain.nodes.length) + 1)));
  });

  const detail = t.chaining.nodes[selected];

  return (
    <div ref={ref}>
      <div className="panel relative aspect-[16/9] w-full overflow-hidden scanfield-fine sm:aspect-[2/1]">
        <svg viewBox="0 0 100 66" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="chainGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(70,229,255,0.9)" />
              <stop offset="100%" stopColor="rgba(70,229,255,0.5)" />
            </linearGradient>
          </defs>
          {chain.edges.map(([from, to], i) => (
            <Edge
              key={i}
              d={edgePath(from, to)}
              index={i}
              total={chain.edges.length}
              progress={scrollYProgress}
            />
          ))}
        </svg>

        {/* nodes */}
        {chain.nodes.map((n, i) => {
          const Icon = ICONS[n.kind];
          const active = i < lit;
          const isSelected = n.id === selected;
          return (
            <button
              key={n.id}
              onClick={() => setSelected(n.id)}
              aria-label={t.chaining.nodes[n.id].label}
              className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:z-10"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <motion.span
                initial={false}
                animate={{
                  scale: active ? 1 : 0.7,
                  opacity: active ? 1 : 0.35,
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className={`relative grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300 sm:h-12 sm:w-12 ${
                    isSelected
                      ? "border-accent bg-accent text-bg shadow-[0_0_18px_3px_rgba(70,229,255,0.5)]"
                      : active
                        ? "border-accent-line bg-panel text-accent"
                        : "border-line bg-panel text-ink-faint"
                  }`}
                >
                  {active && !isSelected && (
                    <span className="absolute inset-0 animate-ping rounded-full border border-accent/30" />
                  )}
                  <Icon size={17} strokeWidth={2} />
                </span>
                <span
                  className={`whitespace-nowrap font-mono text-[10px] tracking-wide transition-colors sm:text-[11px] ${
                    active ? "text-ink" : "text-ink-faint"
                  }`}
                >
                  {t.chaining.nodes[n.id].label}
                </span>
              </motion.span>
            </button>
          );
        })}

        <div className="absolute right-3 top-3 font-mono text-[10px] tracking-[0.18em] text-ink-faint">
          {t.chaining.hint} ↗
        </div>
      </div>

      {/* selected step detail */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="panel-2 mt-4 flex items-start gap-4 px-5 py-4"
      >
        <span className="mt-0.5 font-mono text-[12px] text-accent">
          {String(nodeIndex.get(selected)! + 1).padStart(2, "0")}
        </span>
        <div>
          <h4 className="font-mono text-[13px] font-medium text-ink">{detail.label}</h4>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-dim">{detail.detail}</p>
        </div>
      </motion.div>
    </div>
  );
}
