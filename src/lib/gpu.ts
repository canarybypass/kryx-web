"use client";

import { useEffect, useState } from "react";
import { getGPUTier } from "detect-gpu";

export type SceneQuality = "high" | "low" | "static";

/**
 * Decides which version of the hero scene to render.
 *  - "high"   : full attack-graph (capable desktop GPU)
 *  - "low"    : crystalline-core fallback (weak GPU / small screen)
 *  - "static" : poster image only (reduced-motion or no WebGL)
 */
export function useSceneQuality(): SceneQuality | null {
  // null = "still deciding" → render the poster meanwhile
  const [quality, setQuality] = useState<SceneQuality | null>(null);

  useEffect(() => {
    let cancelled = false;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setQuality("static");
      return;
    }

    // mobile / very small viewports never get the heavy scene
    const isSmall = window.matchMedia("(max-width: 768px)").matches;
    const noTouch = window.matchMedia("(pointer: fine)").matches;

    (async () => {
      try {
        const gpu = await getGPUTier();
        if (cancelled) return;

        const weak = gpu.tier < 2 || gpu.isMobile === true;
        if (isSmall || !noTouch || weak) {
          setQuality("low");
        } else {
          setQuality("high");
        }
      } catch {
        if (!cancelled) setQuality("low");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return quality;
}
