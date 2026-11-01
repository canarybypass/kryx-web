"use client";

import { Canvas } from "@react-three/fiber";
import CoreFallback from "./CoreFallback";

/** Lightweight 3D "echo" of the hero graph for the final CTA backdrop. */
export default function EchoScene() {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 45 }}
    >
      <ambientLight intensity={0.5} />
      <CoreFallback />
    </Canvas>
  );
}
