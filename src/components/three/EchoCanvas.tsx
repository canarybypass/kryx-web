"use client";

import dynamic from "next/dynamic";
import { useSceneQuality } from "@/lib/gpu";

const EchoScene = dynamic(() => import("./EchoScene"), { ssr: false });

/** Only mounts the 3D echo on capable desktops; CSS glow elsewhere. */
export default function EchoCanvas() {
  const quality = useSceneQuality();

  if (quality !== "high") {
    return (
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 30%, transparent), transparent 70%)",
          }}
        />
      </div>
    );
  }

  return <EchoScene />;
}
