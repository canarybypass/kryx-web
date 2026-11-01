"use client";

import { useEffect, useState } from "react";
import { PHASES } from "./content";

/**
 * Tracks which phase section is currently centered in the viewport.
 * Drives the navbar phase indicator and the timeline rail highlight.
 * Returns the active phase index (0-based) into PHASES.
 */
export function useActivePhase(): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = PHASES.map((p) => document.getElementById(p.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }
        // Pick the most-visible phase as the active one.
        let bestId = PHASES[0].id;
        let bestRatio = -1;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        const idx = PHASES.findIndex((p) => p.id === bestId);
        if (idx >= 0) setActive(idx);
      },
      { threshold: [0.1, 0.25, 0.5, 0.75], rootMargin: "-12% 0px -12% 0px" },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}

/** True only after first client mount — gate animations/portals that need the DOM. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
