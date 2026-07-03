"use client";

import { useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import GoldenToilet from "./GoldenToilet";

const lerp = THREE.MathUtils.lerp;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function Rig({
  progressRef,
  spinRef,
  lidRef,
}: {
  progressRef: RefObject<number>;
  spinRef: RefObject<THREE.Group | null>;
  lidRef: RefObject<THREE.Group | null>;
}) {
  const look = useRef(new THREE.Vector3(0, 0.95, 0));
  const target = useRef(new THREE.Vector3(0.9, 1.5, 6.2));

  useFrame((state) => {
    const p = progressRef.current ?? 0;

    // --- rotation: full spin across the first ~60% ---
    if (spinRef.current) {
      const spin = p * Math.PI * 2.4;
      spinRef.current.rotation.y = lerp(spinRef.current.rotation.y, spin, 0.15);
    }

    // --- lid opens between 0.5 and 0.8 ---
    if (lidRef.current) {
      const lo = clamp01((p - 0.5) / 0.3);
      const eased = lo * lo * (3 - 2 * lo);
      // cap short of vertical so the open lid clears the set-back cistern
      lidRef.current.rotation.x = lerp(lidRef.current.rotation.x, -eased * 1.38, 0.16);
    }

    // --- camera: orbit → approach → dive into the bowl ---
    let cx: number, cy: number, cz: number, lx: number, ly: number, lz: number;
    if (p < 0.5) {
      const a = p / 0.5;
      cx = Math.sin(a * 0.9) * 1.1;
      cy = 1.5 + a * 0.15;
      cz = 6.2 - a * 1.2;
      lx = 0;
      ly = 1.1 - a * 0.05;
      lz = 0;
    } else if (p < 0.82) {
      const a = (p - 0.5) / 0.32;
      cx = lerp(Math.sin(0.9) * 1.1, 0, a);
      cy = lerp(1.55, 2.3, a);
      cz = lerp(4.8, 1.9, a);
      lx = 0;
      ly = lerp(1.0, 0.85, a); // keep the bowl framed, not the tank
      lz = 0.2;
    } else {
      const a = clamp01((p - 0.82) / 0.18);
      const e = a * a;
      cx = 0;
      cy = lerp(2.3, 0.42, e); // descend down into the bowl
      cz = lerp(1.9, 0.05, e);
      lx = 0;
      ly = lerp(0.85, -0.35, e); // look down into the gold cavity
      lz = lerp(0.2, 0, e);
    }

    target.current.set(cx, cy, cz);
    look.current.set(lx, ly, lz);
    state.camera.position.lerp(target.current, 0.18);
    state.camera.lookAt(look.current);
  });

  return null;
}

export default function ToiletScene({ progressRef }: { progressRef: RefObject<number> }) {
  const spinRef = useRef<THREE.Group | null>(null);
  const lidRef = useRef<THREE.Group | null>(null);

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0.9, 1.5, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#0b0c0e"]} />
      <fog attach="fog" args={["#0b0c0e", 9, 18]} />

      <ambientLight intensity={0.7} />
      <spotLight position={[5, 9, 5]} angle={0.6} penumbra={0.8} intensity={3.4} color="#fff3d6" />
      <pointLight position={[0, 3, 6]} intensity={2.2} color="#ffe9bd" />
      <pointLight position={[-5, 2, 3]} intensity={1.2} color="#e8c25a" />

      <group ref={spinRef} position={[0, -0.82, 0]} scale={0.9}>
        <GoldenToilet lidGroupRef={lidRef} />
      </group>

      {/* gold reflections without any external HDRI — bright top/side panels, subtle oxblood accent */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={7} color="#fff3d2" position={[0, 6, 3]} scale={[10, 4, 1]} rotation={[-Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={4.5} color="#ffe8b0" position={[5, 2.5, 3]} scale={[4, 7, 1]} rotation={[0, -Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={4} color="#f2d477" position={[-6, 1.5, 3]} scale={[4, 7, 1]} rotation={[0, Math.PI / 3, 0]} />
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 3, -5]} scale={5} />
        <Lightformer form="rect" intensity={2.4} color="#fff0cf" position={[0, 1, 6]} scale={[6, 5, 1]} />
        <Lightformer form="rect" intensity={0.3} color="#8a2a38" position={[-3, -2, 3]} scale={[4, 2, 1]} rotation={[Math.PI / 2, 0, 0]} />
      </Environment>

      <Rig progressRef={progressRef} spinRef={spinRef} lidRef={lidRef} />
    </Canvas>
  );
}
