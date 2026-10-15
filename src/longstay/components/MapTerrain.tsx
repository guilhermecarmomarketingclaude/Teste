import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import detailMeta from "../../../public/longstay/map/detail_meta.json";
import meta from "../../../public/longstay/map/wide_meta.json";

// Clay-style 3D relief of the Vilamoura–Olhão coast (Copernicus DEM + ESA WorldCover),
// baked in scratchpad/scripts/build_map.py. Land is a raised slab; the sea is the floor.

// keep hex colours as authored (the canvas runs in linear/flat mode)
THREE.ColorManagement.enabled = false;

// World scale is anchored on the detail plate (420 units ≈ 40.9 km); the wide plate (whole
// Algarve) is drawn at that scale so the camera never sees past its edge.
const M_TO_U = 420 / detailMeta.width_m;
const LON_C = (detailMeta.lon0 + detailMeta.lon1) / 2;
const LAT_C = (detailMeta.lat0 + detailMeta.lat1) / 2;
const M_PER_DEG_LAT = 111320;
const M_PER_DEG_LON = 111320 * Math.cos((LAT_C * Math.PI) / 180);
export const WORLD_W = meta.width_m * M_TO_U;
export const WORLD_H = meta.height_m * M_TO_U;
const PLATE_CX = (((meta.lon0 + meta.lon1) / 2 - LON_C) * M_PER_DEG_LON) * M_TO_U;
const PLATE_CZ = -(((meta.lat0 + meta.lat1) / 2 - LAT_C) * M_PER_DEG_LAT) * M_TO_U;
const VSCALE = 1.7; // extra vertical drama on top of the baked 3x relief
const STEP = 1; // the wide mesh is already coarse (1024x512)

export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };

export const lonLatToWorld = (lon: number, lat: number) => {
  const x = (lon - LON_C) * M_PER_DEG_LON * M_TO_U;
  const z = -(lat - LAT_C) * M_PER_DEG_LAT * M_TO_U;
  return [x, z] as const;
};

let heightsCache: Uint16Array | null = null;

export const heightAt = (x: number, z: number) => {
  if (!heightsCache) return 0;
  const W = meta.meshW;
  const Hh = meta.meshH;
  const c = Math.round(((x - PLATE_CX + WORLD_W / 2) / WORLD_W) * (W - 1));
  const r = Math.round(((z - PLATE_CZ + WORLD_H / 2) / WORLD_H) * (Hh - 1));
  const cc = Math.max(0, Math.min(W - 1, c));
  const rr = Math.max(0, Math.min(Hh - 1, r));
  return surfaceY(metersAt(heightsCache[rr * W + cc]));
};

// Same camera, as plain math, so HTML overlays can be pinned to map points.
export const projector = (cam: Cam) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 1, 6000);
  c.position.set(...cam.pos);
  c.lookAt(new THREE.Vector3(...cam.target));
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(c);
    return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920, behind: v.z > 1 };
  };
};

const useMapAssets = () => {
  const [assets, setAssets] = useState<{ tex: THREE.Texture; heights: Uint16Array } | null>(null);
  const [handle] = useState(() => delayRender("map assets"));
  useEffect(() => {
    let alive = true;
    const texP = new Promise<THREE.Texture>((res, rej) => {
      new THREE.TextureLoader().load(staticFile("longstay/map/wide_tex.jpg"), res, undefined, rej);
    });
    const hP = fetch(staticFile("longstay/map/wide_height.u16"))
      .then((r) => r.arrayBuffer())
      .then((b) => new Uint16Array(b));
    Promise.all([texP, hP]).then(([tex, heights]) => {
      if (!alive) return;
      tex.anisotropy = 8;
      heightsCache = heights;
      setAssets({ tex, heights });
      continueRender(handle);
    });
    return () => {
      alive = false;
    };
  }, [handle]);
  return assets;
};

const PLATE_M = 420; // slab baked into the heightmap
const NEW_PLATE_M = 70; // thinner slab reads cleaner at this scale

const metersAt = (raw: number) => {
  const m = (raw / 65535) * meta.hmax_m;
  return m <= PLATE_M ? m * (NEW_PLATE_M / PLATE_M) : m - PLATE_M + NEW_PLATE_M;
};

export const surfaceY = (m: number) => m * M_TO_U * VSCALE;

const Terrain: React.FC<{ tex: THREE.Texture; heights: Uint16Array }> = ({ tex, heights }) => {
  const geo = useMemo(() => {
    const W = meta.meshW;
    const Hh = meta.meshH;
    const cols = Math.floor((W - 1) / STEP) + 1;
    const rows = Math.floor((Hh - 1) / STEP) + 1;
    // decimate, remap the slab, then a light 3x3 blur to soften the coastline walls
    const hm = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) hm[r * cols + c] = metersAt(heights[r * STEP * W + c * STEP]);
    const sm = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let acc = 0;
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
            acc += hm[rr * cols + cc];
            n++;
          }
        }
        sm[r * cols + c] = acc / n;
      }
    }
    const g = new THREE.PlaneGeometry(WORLD_W, WORLD_H, cols - 1, rows - 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cols * rows; i++) pos.setZ(i, surfaceY(sm[i]));
    g.rotateX(-Math.PI / 2);
    g.computeVertexNormals();
    const nrm = g.attributes.normal as THREE.BufferAttribute;
    const colors = new Float32Array(nrm.count * 3);
    for (let i = 0; i < nrm.count; i++) {
      const ny = nrm.getY(i);
      const k = 0.7 + 0.3 * Math.pow(Math.max(0, ny), 2.0);
      colors[i * 3] = k;
      colors[i * 3 + 1] = k * 1.02;
      colors[i * 3 + 2] = Math.min(1, k * 1.06);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [heights]);
  return (
    <mesh geometry={geo} position={[PLATE_CX, 0, PLATE_CZ]}>
      <meshBasicMaterial map={tex} vertexColors toneMapped={false} />
    </mesh>
  );
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = cam.fov;
  pc.near = 1;
  pc.far = 6000;
  pc.position.set(...cam.pos);
  pc.lookAt(new THREE.Vector3(...cam.target));
  pc.updateProjectionMatrix();
  return null;
};

export const MapTerrain: React.FC<{ cam: Cam; fogNear?: number; fogFar?: number; bg?: string }> = ({
  cam,
  fogNear = 650,
  fogFar = 1500,
  bg = "#DCEAF5",
}) => {
  const assets = useMapAssets();
  return (
    <ThreeCanvas width={1080} height={1920} linear flat style={{ position: "absolute", inset: 0 }}>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, fogNear, fogFar]} />
      <CameraRig cam={cam} />
      {/* sea floor beyond the plate, so the plate edge never shows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <planeGeometry args={[6000, 6000]} />
        <meshBasicMaterial color="#D6E8F5" toneMapped={false} />
      </mesh>
      {assets ? <Terrain tex={assets.tex} heights={assets.heights} /> : null}
    </ThreeCanvas>
  );
};
