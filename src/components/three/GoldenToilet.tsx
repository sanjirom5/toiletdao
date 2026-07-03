"use client";

import { useMemo, type RefObject } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

const GOLD = "#f2d477";
const GOLD_DEEP = "#c79a35";

function goldProps(roughness = 0.14): THREE.MeshStandardMaterialParameters {
  return {
    color: GOLD,
    metalness: 1,
    roughness,
    envMapIntensity: 2.6,
  };
}

/** Rotational profile (radius, height) for the skirted one-piece body + bowl cavity. */
function useBodyGeometry() {
  return useMemo(() => {
    const p = (r: number, y: number) => new THREE.Vector2(r, y);
    const pts = [
      p(0.0, 0.0),
      p(0.66, 0.0),
      p(0.74, 0.05),
      p(0.75, 0.35),
      p(0.7, 0.72),
      p(0.63, 1.02),
      p(0.58, 1.22),
      p(0.6, 1.36),
      p(0.66, 1.5),
      p(0.72, 1.62),
      p(0.74, 1.72), // outer rim
      p(0.72, 1.78),
      p(0.56, 1.79), // rim top (flat ring)
      p(0.5, 1.72), // inner lip
      p(0.44, 1.55), // bowl wall
      p(0.34, 1.32),
      p(0.24, 1.12),
      p(0.18, 0.98),
      p(0.14, 0.9), // throat
      p(0.0, 0.92), // cavity floor
    ];
    const g = new THREE.LatheGeometry(pts, 96);
    g.computeVertexNormals();
    return g;
  }, []);
}

export default function GoldenToilet({
  lidGroupRef,
  lidOpen = 0,
}: {
  lidGroupRef?: RefObject<THREE.Group | null>;
  lidOpen?: number;
}) {
  const body = useBodyGeometry();
  // initial lid rotation; the scroll Rig drives it imperatively when a ref is passed
  const lidAngle = -lidOpen * 2.0;

  return (
    <group>
      {/* one-piece skirted body + bowl cavity, made slightly oval */}
      <mesh geometry={body} scale={[1, 1, 1.2]} castShadow receiveShadow>
        <meshStandardMaterial {...goldProps(0.12)} side={THREE.DoubleSide} />
      </mesh>

      {/* cistern / tank */}
      <RoundedBox
        args={[1.16, 1.2, 0.62]}
        radius={0.1}
        smoothness={6}
        position={[0, 1.5, -0.62]}
        scale={[1, 1, 1]}
      >
        <meshStandardMaterial {...goldProps(0.15)} />
      </RoundedBox>
      {/* tank lid */}
      <RoundedBox args={[1.24, 0.16, 0.72]} radius={0.06} smoothness={5} position={[0, 2.16, -0.62]}>
        <meshStandardMaterial {...goldProps(0.13)} />
      </RoundedBox>
      {/* flush button */}
      <mesh position={[0, 2.26, -0.62]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.05, 32]} />
        <meshStandardMaterial color={GOLD_DEEP} metalness={1} roughness={0.25} envMapIntensity={1.4} />
      </mesh>

      {/* seat ring at the rim (flat oval torus) */}
      <mesh position={[0, 1.78, 0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.2, 1]}>
        <torusGeometry args={[0.54, 0.06, 20, 90]} />
        <meshStandardMaterial {...goldProps(0.18)} />
      </mesh>

      {/* hinged lid — group pivots at the back rim, tips up as lidOpen → 1 */}
      <group ref={lidGroupRef} position={[0, 1.82, -0.5]} rotation={[lidAngle, 0, 0]}>
        {/* flattened dome ellipsoid reads as a toilet lid */}
        <mesh position={[0, 0.05, 0.6]} scale={[0.92, 0.17, 1.02]} castShadow>
          <sphereGeometry args={[0.62, 56, 36]} />
          <meshStandardMaterial {...goldProps(0.1)} />
        </mesh>
      </group>
    </group>
  );
}
