"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { coreVertex, coreFragment } from "./shaders/core.glsl";
import { nodesVertex, nodesFragment } from "./shaders/nodes.glsl";

const ACCENT = new THREE.Color("#b6ff3c");
const SECONDARY = new THREE.Color("#18e0ff");
const COUNT = 90;

/** Lighter "crystalline core + particles" scene for weaker GPUs. */
export default function CoreFallback() {
  const group = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    const dirs = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 1.6 + Math.random() * 2.0;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(b) * Math.cos(a);
      const y = r * Math.sin(b) * Math.sin(a);
      const z = r * Math.cos(b) * 0.5;
      positions.set([x, y, z], i * 3);
      scales[i] = 0.6 + Math.random() * 1.4;
      seeds[i] = Math.random();
      const d = new THREE.Vector3(x, y, z).normalize();
      dirs.set([d.x, d.y, d.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aDir", new THREE.BufferAttribute(dirs, 3));
    return g;
  }, []);

  const coreMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coreVertex,
        fragmentShader: coreFragment,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uPulse: { value: 0 },
          uColorA: { value: ACCENT },
          uColorB: { value: SECONDARY },
        },
      }),
    [],
  );

  const nodesMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: nodesVertex,
        fragmentShader: nodesFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 20 },
          uDisperse: { value: 0 },
          uPointer: { value: new THREE.Vector3(999, 999, 999) },
          uPointerForce: { value: 0 },
          uColorA: { value: ACCENT },
          uColorB: { value: SECONDARY },
        },
      }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    coreMat.uniforms.uTime.value = t;
    coreMat.uniforms.uPulse.value = 0.5 + 0.5 * Math.sin(t * 1.4);
    nodesMat.uniforms.uTime.value = t;
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        state.pointer.y * 0.2,
        0.05,
      );
    }
  });

  return (
    <group ref={group}>
      <mesh material={coreMat}>
        <icosahedronGeometry args={[1.0, 8]} />
      </mesh>
      <points geometry={geo} material={nodesMat} />
    </group>
  );
}
