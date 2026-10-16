import React, { useMemo } from "react";
import * as THREE from "three";
import { LOGO_BOX, LOGO_COLORS, ROOF } from "./Logo";
import { wx, wy } from "./Type3D";

// The HD Properties roof mark as real extruded 3D geometry, built from the same vector paths as the
// 2D logo so it lands exactly on top of it.

const parsePath = (d: string) => {
  const shape = new THREE.Shape();
  const tok = d.match(/[MLQZ]|-?\d+(\.\d+)?/g) ?? [];
  let i = 0;
  let cmd = "";
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    const tk = tok[i];
    if (/[MLQZ]/.test(tk)) {
      cmd = tk;
      i++;
      if (cmd === "Z") {
        shape.closePath();
        continue;
      }
    }
    if (cmd === "M") shape.moveTo(num(), -num());
    else if (cmd === "L") shape.lineTo(num(), -num());
    else if (cmd === "Q") {
      const cx = num();
      const cy = -num();
      shape.quadraticCurveTo(cx, cy, num(), -num());
    }
  }
  return shape;
};

const SIDE = { blue: "#1786C4", dark: "#4B4A52", light: "#74737A" };

export type RoofPart = "blue" | "dark" | "light";
export type PartFx = { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; s?: number; o?: number };

// Logo placed on screen like the 2D <Logo width={width}> at (left, top).
export const Roof3D: React.FC<{
  left: number;
  top: number;
  width: number;
  depth?: number;
  fx?: (part: RoofPart) => PartFx | null;
}> = ({ left, top, width, depth = 34, fx }) => {
  const k = width / LOGO_BOX.w;
  const parts = useMemo(() => {
    return (["dark", "light", "blue"] as RoofPart[]).map((p) => {
      const geo = new THREE.ExtrudeGeometry(parsePath(ROOF[p]), {
        depth: depth / k,
        bevelEnabled: true,
        bevelThickness: 2.2 / k,
        bevelSize: 1.4 / k,
        bevelSegments: 3,
        curveSegments: 10,
      });
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const cx = (bb.min.x + bb.max.x) / 2;
      const cy = (bb.min.y + bb.max.y) / 2;
      geo.translate(-cx, -cy, -depth / k / 2);
      const mats = [
        new THREE.MeshBasicMaterial({ color: LOGO_COLORS[p], toneMapped: false, transparent: true }),
        new THREE.MeshStandardMaterial({ color: SIDE[p], roughness: 0.4, metalness: 0.1, transparent: true }),
      ];
      return { p, geo, mats, cx, cy };
    });
  }, [depth, k]);
  return (
    <group>
      {parts.map(({ p, geo, mats, cx, cy }) => {
        const e = fx ? fx(p) : {};
        if (e === null) return null;
        const o = e.o ?? 1;
        mats.forEach((m) => {
          const tr = o < 0.999;
          if (m.transparent !== tr) {
            m.transparent = tr;
            m.needsUpdate = true;
          }
          m.opacity = o;
        });
        // centre of this part on screen
        const sx = left + (cx - LOGO_BOX.x) * k;
        const sy = top + (-cy - LOGO_BOX.y) * k;
        return (
          <group key={p} position={[wx(sx) + (e.x ?? 0), wy(sy) + (e.y ?? 0), e.z ?? 0]} rotation={[e.rx ?? 0, e.ry ?? 0, e.rz ?? 0]} scale={(e.s ?? 1) * k}>
            <mesh geometry={geo} material={mats} />
          </group>
        );
      })}
    </group>
  );
};
