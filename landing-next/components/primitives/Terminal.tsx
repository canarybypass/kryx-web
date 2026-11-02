"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export type LineKind = "out" | "sys" | "hit" | "leak" | "ok" | "err" | "dim";

export interface TermLine {
  t?: LineKind;
  v: string;
}

const KIND_CLASS: Record<LineKind, string> = {
  out: "text-ink",
  sys: "text-ink-dim",
  hit: "text-accent",
  leak: "text-danger",
  ok: "text-good",
  err: "text-danger",
  dim: "text-ink-faint",
};

interface TerminalProps {
  lines: readonly TermLine[];
  title?: string;
  /** Type the lines out char-by-char when scrolled into view. */
  typing?: boolean;
  /** ms per character */
  speed?: number;
  className?: string;
  /** Show a steady blinking cursor on the last revealed line. */
  cursor?: boolean;
  status?: string;
}

/**
 * Terminal — the recurring premium surface for commands and live logs.
 * When `typing` is on and prefers-reduced-motion is off, lines stream in
 * character by character like a real session. Otherwise everything is shown
 * at once.
 */
export default function Terminal({
  lines,
  title = "kryx@operator",
  typing = false,
  speed = 14,
  className = "",
  cursor = true,
  status,
}: TerminalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const animate = typing;

  // typedLine = index of line currently being typed; typedChars = chars shown.
  const [line, setLine] = useState(animate ? 0 : lines.length);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!animate || !inView) return;
    if (line >= lines.length) return;

    const current = lines[line]?.v ?? "";
    if (chars < current.length) {
      const id = setTimeout(() => setChars((c) => c + 1), speed);
      return () => clearTimeout(id);
    }
    // line finished — small pause, then advance
    const id = setTimeout(() => {
      setLine((l) => l + 1);
      setChars(0);
    }, 240);
    return () => clearTimeout(id);
  }, [animate, inView, line, chars, lines, speed]);

  return (
    <div
      ref={ref}
      className={`panel overflow-hidden font-mono text-[12.5px] leading-relaxed sm:text-[13px] ${className}`}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-black/30 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full border border-line bg-ink-ghost/60" />
        <span className="h-2.5 w-2.5 rounded-full border border-line bg-ink-ghost/40" />
        <span className="h-2.5 w-2.5 rounded-full border border-line bg-ink-ghost/40" />
        <span className="ml-2 truncate text-[11px] text-ink-faint">{title}</span>
        {status && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            {status}
          </span>
        )}
      </div>

      {/* body */}
      <div className="px-4 py-3.5">
        {lines.map((l, i) => {
          if (animate && i > line) return null;
          const text = animate && i === line ? l.v.slice(0, chars) : l.v;
          const isLastShown = animate ? i === Math.min(line, lines.length - 1) : i === lines.length - 1;
          return (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words ${KIND_CLASS[l.t ?? "sys"]} ${l.v === "" ? "h-3" : ""}`}
            >
              {text}
              {cursor && isLastShown && (
                <span className="ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.16em] bg-accent align-baseline animate-blink" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
