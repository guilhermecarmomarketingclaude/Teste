import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// Real extruded 3D type (three.js) in screen-pixel units. Colour pipeline: sRGB hex in, sRGB out, no
// tone mapping, so unlit faces (MeshBasicMaterial) render the brand colours exactly.
//: the camera is placed so that the z = 0
// plane maps 1 world unit to 1 px, origin at the frame centre, y up.
THREE.ColorManagement.enabled = false;

export const W3 = 1080;
export const H3 = 1920;
export const FOV = 30;
export const CAM_D = H3 / 2 / Math.tan((FOV * Math.PI) / 360);
// screen px -> world (z = 0 plane)
export const wx = (px: number) => px - W3 / 2;
export const wy = (py: number) => H3 / 2 - py;

type FontJson = {
  glyphs: Record<string, { ha: number }>;
  kern: Record<string, number>;
  resolution: number;
};
type Loaded = { font: Font; json: FontJson };

const fontCache: Record<string, Loaded> = {};
const pending: Record<string, Promise<Loaded>> = {};

// Montserrat cap height is 0.972 of the TextGeometry size; letters are centred on mid-cap
export const CAP = 0.972;
export const FONT_900 = "longstay/v3/fonts/montserrat900.json";
export const FONT_800 = "longstay/v3/fonts/montserrat800.json";

const loadFont = (file: string) => {
  if (!pending[file]) {
    pending[file] = fetch(staticFile(file))
      .then((r) => r.json())
      .then((json: FontJson) => {
        const v = { font: new Font(json as never), json };
        fontCache[file] = v;
        return v;
      });
  }
  return pending[file];
};

export const useFont3D = (file = FONT_900) => {
  const [f, setF] = useState<Loaded | null>(fontCache[file] ?? null);
  const [handle] = useState(() => (fontCache[file] ? null : delayRender(`3D font ${file}`)));
  useEffect(() => {
    let alive = true;
    loadFont(file).then((v) => {
      if (alive) setF(v);
      if (handle !== null) continueRender(handle);
    });
    return () => {
      alive = false;
    };
  }, [file, handle]);
  return f;
};

const geoCache = new Map<string, THREE.BufferGeometry>();
const glyphGeo = (f: Loaded, file: string, ch: string, size: number, depth: number, bevel: number) => {
  const key = `${file}|${ch}|${size}|${depth}|${bevel}`;
  let g = geoCache.get(key);
  if (!g) {
    g = new TextGeometry(ch, {
      font: f.font,
      size,
      depth,
      curveSegments: 7,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel * 0.55,
      bevelOffset: 0,
      bevelSegments: 3,
    });
    geoCache.set(key, g);
  }
  return g;
};

// opaque materials when fully visible: no blending seams between triangles
const setOpacity = (m: THREE.Material, o: number) => {
  const tr = o < 0.999;
  if (m.transparent !== tr) {
    m.transparent = tr;
    m.depthWrite = !tr;
    m.needsUpdate = true;
  }
  m.opacity = o;
};

export const layout3D = (json: FontJson, text: string, size: number, tracking = 0) => {
  const k = size / json.resolution;
  const chars = [...text];
  const xs: number[] = [];
  const ws: number[] = [];
  let x = 0;
  chars.forEach((ch, i) => {
    xs.push(x);
    const adv = (json.glyphs[ch]?.ha ?? json.glyphs[" "]?.ha ?? 300) * k;
    ws.push(adv);
    x += adv + (i < chars.length - 1 ? tracking * size + (json.kern[ch + chars[i + 1]] ?? 0) * k : 0);
  });
  return { chars, xs, ws, width: x };
};

// width of a line in px (for fitting / safe-zone checks)
export const measure3D = (text: string, size: number, tracking = 0, file = FONT_900) => {
  const f = fontCache[file];
  if (!f) return text.length * size * 0.75;
  return layout3D(f.json, text, size, tracking).width;
};

export type LetterFx = (i: number, n: number, ch: string) => {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
  o?: number;
} | null;

type Text3DProps = {
  text: string;
  size: number;
  depth?: number;
  bevel?: number;
  tracking?: number;
  face?: string;
  side?: string;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  opacity?: number;
  align?: "center" | "left" | "right";
  fx?: LetterFx;
  file?: string;
  // shade the face slightly from top to bottom (subtle, keeps the brand colour exact mid-face)
  sideShine?: number;
};

export const Text3D: React.FC<Text3DProps> = ({
  text,
  size,
  depth = size * 0.22,
  bevel = size * 0.02,
  tracking = 0,
  face = "#FFFFFF",
  side = "#23A4EB",
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  scale = 1,
  opacity = 1,
  align = "center",
  fx,
  file = FONT_900,
  sideShine = 0.35,
}) => {
  const f = useFont3D(file);
  const n = [...text].length;
  const mats = useMemo(
    () =>
      Array.from({ length: n }).map(() => [
        new THREE.MeshBasicMaterial({ color: face, transparent: true, toneMapped: false }),
        new THREE.MeshStandardMaterial({ color: side, roughness: 0.45, metalness: sideShine * 0.4, transparent: true }),
      ]),
    [n, face, side, sideShine],
  );
  if (!f) return null;
  const L = layout3D(f.json, text, size, tracking);
  const x0 = align === "center" ? -L.width / 2 : align === "right" ? -L.width : 0;
  return (
    <group position={[x, y, z]} rotation={[rx, ry, rz]} scale={scale}>
      {L.chars.map((ch, i) => {
        if (ch === " ") return null;
        const e = fx ? fx(i, n, ch) : {};
        if (e === null) return null;
        const o = (e.o ?? 1) * opacity;
        if (o <= 0.003) return null;
        const geo = glyphGeo(f, file, ch, size, depth, bevel);
        const m = mats[i];
        setOpacity(m[0], o);
        setOpacity(m[1], o);
        const cw = L.ws[i];
        return (
          <group key={i} position={[x0 + L.xs[i] + cw / 2 + (e.x ?? 0), e.y ?? 0, e.z ?? 0]} rotation={[e.rx ?? 0, e.ry ?? 0, e.rz ?? 0]} scale={e.s ?? 1}>
            <mesh geometry={geo} material={m} position={[-cw / 2, -size * CAP * 0.5, -depth / 2]} />
          </group>
        );
      })}
    </group>
  );
};

export type Cam3 = { x?: number; y?: number; dolly?: number; pitch?: number; yaw?: number; roll?: number; fov?: number };

const PixelCamera: React.FC<Cam3> = ({ x = 0, y = 0, dolly = 0, pitch = 0, yaw = 0, roll = 0, fov = FOV }) => {
  const { camera } = useThree();
  const pc = camera as THREE.PerspectiveCamera;
  const d = H3 / 2 / Math.tan((fov * Math.PI) / 360);
  pc.fov = fov;
  pc.aspect = W3 / H3;
  pc.near = 10;
  pc.far = 20000;
  pc.position.set(x, y, d - dolly);
  pc.rotation.set(pitch, yaw, roll, "YXZ");
  pc.updateProjectionMatrix();
  return null;
};

export const Stage3D: React.FC<{ cam?: Cam3; children: React.ReactNode; style?: React.CSSProperties; light?: number }> = ({
  cam = {},
  children,
  style,
  light = 1,
}) => (
  <ThreeCanvas width={W3} height={H3} flat gl={{ antialias: true, alpha: true }} style={{ position: "absolute", inset: 0, ...style }}>
    <PixelCamera {...cam} />
    <ambientLight intensity={0.62 * light} />
    <directionalLight position={[-700, 1100, 1600]} intensity={1.15 * light} />
    <directionalLight position={[900, -500, 900]} intensity={0.42 * light} />
    {children}
  </ThreeCanvas>
);

// a thin bar (strike-through, underline) as a lit box
export const Bar3D: React.FC<{
  x: number;
  y: number;
  z?: number;
  w: number;
  h: number;
  d?: number;
  rz?: number;
  color?: string;
  side?: string;
  opacity?: number;
}> = ({ x, y, z = 0, w, h, d = 16, rz = 0, color = "#FFFFFF", side = "#23A4EB", opacity = 1 }) => {
  const mats = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: side, roughness: 0.45, transparent: true }),
      new THREE.MeshStandardMaterial({ color: side, roughness: 0.45, transparent: true }),
      new THREE.MeshStandardMaterial({ color: side, roughness: 0.45, transparent: true }),
      new THREE.MeshStandardMaterial({ color: side, roughness: 0.45, transparent: true }),
      new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false }),
    ],
    [color, side],
  );
  mats.forEach((m) => setOpacity(m, opacity));
  if (w <= 0.5 || opacity <= 0.003) return null;
  return (
    <mesh position={[x + w / 2, y, z]} rotation={[0, 0, rz]} material={mats}>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  );
};
