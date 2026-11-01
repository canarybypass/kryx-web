"use client";

import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import AttackGraph from "./AttackGraph";
import CoreFallback from "./CoreFallback";
import type { SceneQuality } from "@/lib/gpu";

export default function Scene({ quality }: { quality: SceneQuality }) {
  const isHigh = quality === "high";

  return (
    <Canvas
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={isHigh ? [1, 1.8] : [1, 1.4]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#050507"), 0);
      }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 6]} intensity={20} color="#18e0ff" />

      {isHigh ? <AttackGraph /> : <CoreFallback />}

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={isHigh ? 0.9 : 0.7}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.7}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0006, 0.0009)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
