import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";

// Photos as real planes in the 3D scene (same pixel-unit world as Type3D): rounded white card,
// cover-cropped photo, soft contact shadow.

const texCache: Record<string, Promise<THREE.Texture>> = {};
const loadTex = (file: string) => {
  if (!texCache[file]) {
    texCache[file] = new Promise((res, rej) => {
      new THREE.TextureLoader().load(
        staticFile(file),
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          t.generateMipmaps = true;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          res(t);
        },
        undefined,
        rej,
      );
    });
  }
  return texCache[file];
};

export const useTextures = (files: string[]) => {
  const key = files.join("|");
  const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender(`textures ${files.length}`));
  useEffect(() => {
    let alive = true;
    Promise.all(files.map((f) => loadTex(f).then((t) => [f, t] as const))).then((pairs) => {
      if (alive) setTex(Object.fromEntries(pairs));
      continueRender(handle);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, handle]);
  return tex;
};

const roundRect = (g: CanvasRenderingContext2D, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(r, 0);
  g.arcTo(w, 0, w, h, r);
  g.arcTo(w, h, 0, h, r);
  g.arcTo(0, h, 0, 0, r);
  g.arcTo(0, 0, w, 0, r);
  g.closePath();
};

const alphaCache = new Map<string, THREE.Texture>();
const roundedAlpha = (w: number, h: number, r: number) => {
  const key = `${Math.round(w)}x${Math.round(h)}r${Math.round(r)}`;
  let t = alphaCache.get(key);
  if (!t) {
    const k = 768 / Math.max(w, h);
    const c = document.createElement("canvas");
    c.width = Math.max(4, Math.round(w * k));
    c.height = Math.max(4, Math.round(h * k));
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#fff";
    roundRect(g, c.width, c.height, r * k);
    g.fill();
    t = new THREE.CanvasTexture(c);
    alphaCache.set(key, t);
  }
  return t;
};

let shadowTex: THREE.Texture | null = null;
const softShadow = () => {
  if (!shadowTex) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(128, 128, 20, 128, 128, 128);
    grd.addColorStop(0, "rgba(10,25,40,0.55)");
    grd.addColorStop(0.55, "rgba(10,25,40,0.28)");
    grd.addColorStop(1, "rgba(10,25,40,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    shadowTex = new THREE.CanvasTexture(c);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
  }
  return shadowTex;
};

export type CardProps = {
  tex: THREE.Texture;
  w: number;
  h: number;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
  o?: number;
  border?: number;
  radius?: number;
  pan?: [number, number]; // -1..1 framing nudge inside the cover crop
  zoom?: number; // >1 crops tighter (slow push-in)
  shadow?: number;
  frame?: string;
};

export const PhotoCard3D: React.FC<CardProps> = ({
  tex,
  w,
  h,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  s = 1,
  o = 1,
  border = 14,
  radius = 34,
  pan = [0, 0],
  zoom = 1,
  shadow = 1,
  frame = "#FFFFFF",
}) => {
  const pw = w - border * 2;
  const ph = h - border * 2;
  const photo = useMemo(() => {
    const t = tex.clone();
    t.needsUpdate = true;
    return t;
  }, [tex]);
  const img = tex.image as { width: number; height: number };
  const ia = img.width / img.height;
  const pa = pw / ph;
  let rxp = 1;
  let ryp = 1;
  if (ia > pa) rxp = pa / ia;
  else ryp = ia / pa;
  rxp /= zoom;
  ryp /= zoom;
  photo.repeat.set(rxp, ryp);
  photo.offset.set(((1 - rxp) / 2) * (1 + pan[0]), ((1 - ryp) / 2) * (1 + pan[1]));
  const mats = useMemo(
    () => ({
      frame: new THREE.MeshBasicMaterial({ color: frame, alphaMap: roundedAlpha(w, h, radius), transparent: true, toneMapped: false }),
      photo: new THREE.MeshBasicMaterial({ map: photo, alphaMap: roundedAlpha(pw, ph, Math.max(2, radius - border)), transparent: true, toneMapped: false }),
      shadow: new THREE.MeshBasicMaterial({ map: softShadow(), transparent: true, depthWrite: false, toneMapped: false }),
    }),
    [photo, w, h, pw, ph, radius, border, frame],
  );
  mats.frame.opacity = o;
  mats.photo.opacity = o;
  mats.shadow.opacity = o * shadow;
  if (o <= 0.003) return null;
  return (
    <group position={[x, y, z]} rotation={[rx, ry, rz]} scale={s}>
      {shadow > 0 ? (
        <mesh position={[18, -34, -6]} material={mats.shadow}>
          <planeGeometry args={[w * 1.22, h * 1.16]} />
        </mesh>
      ) : null}
      <mesh material={mats.frame}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[0, 0, 0.6]} material={mats.photo}>
        <planeGeometry args={[pw, ph]} />
      </mesh>
    </group>
  );
};
