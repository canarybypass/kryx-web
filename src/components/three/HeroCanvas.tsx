"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSceneQuality } from "@/lib/gpu";

// 3D bundle is lazy-loaded — never blocks first paint / non-WebGL users.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <ScenePoster pulse />,
});

/** Static CSS poster — shown while deciding, loading, or for reduced-motion. */
function ScenePoster({ pulse = false }: { pulse?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div
        className={`h-64 w-64 rounded-full blur-2xl ${pulse ? "animate-pulse" : ""}`}
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 35%, transparent) 0%, color-mix(in srgb, var(--color-accent-2) 18%, transparent) 40%, transparent 70%)",
        }}
      />
    </div>
  );
}

export default function HeroCanvas() {
  const quality = useSceneQuality();

  // still deciding, or reduced-motion → static poster
  if (quality === null || quality === "static") {
    return <ScenePoster />;
  }

  return (
    <Suspense fallback={<ScenePoster pulse />}>
      <Scene quality={quality} />
    </Suspense>
  );
}
