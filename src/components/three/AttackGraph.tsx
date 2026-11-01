"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { coreVertex, coreFragment } from "./shaders/core.glsl";
import { nodesVertex, nodesFragment } from "./shaders/nodes.glsl";
import { edgesVertex, edgesFragment } from "./shaders/edges.glsl";

const ACCENT = new THREE.Color("#b6ff3c");
const SECONDARY = new THREE.Color("#18e0ff");

const NODE_COUNT = 150;
const CLOUD_RADIUS = 3.4;

type GraphData = {
  nodesGeo: THREE.BufferGeometry;
  edgesGeo: THREE.BufferGeometry;
};

function buildGraph(): GraphData {
  const positions = new Float32Array(NODE_COUNT * 3);
  const scales = new Float32Array(NODE_COUNT);
  const seeds = new Float32Array(NODE_COUNT);
  const dirs = new Float32Array(NODE_COUNT * 3);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    // fibonacci-ish sphere, flattened in z for a disc-of-nodes look
    const t = Math.acos(1 - 2 * ((i + 0.5) / NODE_COUNT));
    const phi = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = CLOUD_RADIUS * (0.55 + Math.random() * 0.45);
    const x = r * Math.sin(t) * Math.cos(phi);
    const y = r * Math.sin(t) * Math.sin(phi);
    const z = r * Math.cos(t) * 0.45;

    const v = new THREE.Vector3(x, y, z);
    points.push(v);
    positions.set([x, y, z], i * 3);
    scales[i] = 0.6 + Math.random() * 1.8;
    seeds[i] = Math.random();
    const d = v.clone().normalize();
    dirs.set([d.x, d.y, d.z], i * 3);
  }

  const nodesGeo = new THREE.BufferGeometry();
  nodesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  nodesGeo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  nodesGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  nodesGeo.setAttribute("aDir", new THREE.BufferAttribute(dirs, 3));

  // ---- edges: core→node "routes" + a few node→neighbour links ----
  const ep: number[] = [];
  const eprog: number[] = [];
  const espeed: number[] = [];
  const edir: number[] = [];
  const core = new THREE.Vector3(0, 0, 0);

  const pushEdge = (a: THREE.Vector3, b: THREE.Vector3) => {
    const speed = 0.15 + Math.random() * 0.5;
    const dir = b.clone().normalize();
    ep.push(a.x, a.y, a.z, b.x, b.y, b.z);
    eprog.push(0, 1);
    espeed.push(speed, speed);
    edir.push(dir.x, dir.y, dir.z, dir.x, dir.y, dir.z);
  };

  points.forEach((p, i) => {
    if (i % 3 === 0) pushEdge(core, p); // ~1/3 wired to the core
    // link to a pseudo-neighbour
    if (i % 2 === 0) {
      const j = (i + 7) % NODE_COUNT;
      if (p.distanceTo(points[j]) < CLOUD_RADIUS * 1.1) pushEdge(p, points[j]);
    }
  });

  const edgesGeo = new THREE.BufferGeometry();
  edgesGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(ep, 3),
  );
  edgesGeo.setAttribute("aProgress", new THREE.Float32BufferAttribute(eprog, 1));
  edgesGeo.setAttribute("aSpeed", new THREE.Float32BufferAttribute(espeed, 1));
  edgesGeo.setAttribute("aDir", new THREE.Float32BufferAttribute(edir, 3));

  return { nodesGeo, edgesGeo };
}

export default function AttackGraph() {
  const group = useRef<THREE.Group>(null);
  const { nodesGeo, edgesGeo } = useMemo(buildGraph, []);

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
          uSize: { value: 22 },
          uDisperse: { value: 0 },
          uPointer: { value: new THREE.Vector3() },
          uPointerForce: { value: 0 },
          uColorA: { value: ACCENT },
          uColorB: { value: SECONDARY },
        },
      }),
    [],
  );

  const edgesMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: edgesVertex,
        fragmentShader: edgesFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uDisperse: { value: 0 },
          uColorA: { value: ACCENT },
          uColorB: { value: SECONDARY },
        },
      }),
    [],
  );

  const pointerTarget = useRef(new THREE.Vector3());
  const disperse = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // scroll-driven dispersion (hero → pipeline transition)
    const sy = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1;
    const targetDisperse = Math.min(Math.max(sy / (vh * 0.85), 0), 1);
    disperse.current += (targetDisperse - disperse.current) * 0.1;

    // pointer → world target on the core plane
    pointerTarget.current.lerp(
      new THREE.Vector3(
        state.pointer.x * CLOUD_RADIUS,
        state.pointer.y * CLOUD_RADIUS * 0.7,
        0.6,
      ),
      0.08,
    );

    // parallax tilt of the whole graph
    if (group.current) {
      group.current.rotation.y += delta * 0.06;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        state.pointer.y * 0.25,
        0.05,
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        -state.pointer.x * 0.12,
        0.05,
      );
      const s = 1 - disperse.current * 0.15;
      group.current.scale.setScalar(s);
    }

    coreMat.uniforms.uTime.value = t;
    coreMat.uniforms.uPulse.value = 0.5 + 0.5 * Math.sin(t * 1.6);

    nodesMat.uniforms.uTime.value = t;
    nodesMat.uniforms.uDisperse.value = disperse.current;
    nodesMat.uniforms.uPointer.value.copy(pointerTarget.current);
    nodesMat.uniforms.uPointerForce.value = 1 - disperse.current;

    edgesMat.uniforms.uTime.value = t;
    edgesMat.uniforms.uDisperse.value = disperse.current;
  });

  return (
    <group ref={group}>
      {/* pulsing AI core */}
      <mesh material={coreMat}>
        <icosahedronGeometry args={[0.85, 12]} />
      </mesh>
      {/* faint inner halo */}
      <mesh scale={1.0}>
        <icosahedronGeometry args={[0.92, 3]} />
        <meshBasicMaterial
          color={SECONDARY}
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* connection routes */}
      <lineSegments geometry={edgesGeo} material={edgesMat} />

      {/* node cloud */}
      <points geometry={nodesGeo} material={nodesMat} />
    </group>
  );
}
