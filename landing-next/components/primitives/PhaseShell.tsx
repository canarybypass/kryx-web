"use client";

import type { ReactNode } from "react";
import { PHASES } from "@/lib/content";

interface PhaseShellProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Remove the default vertical padding (used by full-bleed phases). */
  flush?: boolean;
}

/**
 * Wrapper for every phase. Provides the section anchor (used by the timeline
 * rail + navbar), consistent rhythm, and clearance for the fixed rail on the
 * left at desktop widths.
 */
export default function PhaseShell({ id, children, className = "", flush = false }: PhaseShellProps) {
  const meta = PHASES.find((p) => p.id === id);

  return (
    <section
      id={id}
      data-phase={id}
      className={`relative w-full ${flush ? "" : "py-24 sm:py-32 lg:py-40"} ${className}`}
    >
      <div className="mx-auto w-full max-w-stage px-5 sm:px-8 lg:pl-28 lg:pr-12">
        {meta && (
          <div className="mb-7 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.34em] text-ink-faint">
            <span className="text-accent">{meta.index}</span>
            <span className="h-px w-8 bg-line-strong" />
            <span>{meta.code}</span>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
