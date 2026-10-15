import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { Logo } from "../components/Logo";
import { Cam, MapTerrain, lonLatToWorld, projector } from "../components/MapTerrain";
import { shadow } from "../components/UI";
import { TL, wordTime, wordsAt } from "../data/timeline";

// 24.96–29.8 s: logo on the drop, then the camera drops onto a 3D relief of the coast
// and the route from Vilamoura to Olhão draws itself, town by town.

type Place = { name: string; lon: number; lat: number; img?: string; big?: boolean };
const PLACES: Place[] = [
  { name: "Vilamoura", lon: -8.118, lat: 37.0765, img: "longstay/img/loc_vilamoura.jpg", big: true },
  { name: "Quarteira", lon: -8.1007, lat: 37.0697 },
  { name: "Vale do Lobo", lon: -8.064, lat: 37.051 },
  { name: "Faro", lon: -7.9304, lat: 37.0194 },
  { name: "Olhão", lon: -7.841, lat: 37.026, img: "longstay/img/loc_olhao.jpg", big: true },
];
// coastal path (slightly inland so the line rides on the land slab)
const PATH: [number, number][] = [
  [-8.118, 37.0765],
  [-8.1007, 37.0697],
  [-8.083, 37.061],
  [-8.064, 37.051],
  [-8.03, 37.046],
  [-7.99, 37.043],
  [-7.955, 37.032],
  [-7.9304, 37.0194],
  [-7.9, 37.03],
  [-7.87, 37.031],
  [-7.841, 37.026],
];
const PIN_Y = 2.4;

type Key = { t: number; pos: [number, number, number]; target: [number, number, number]; fov: number };
// Camera sits west of Vilamoura looking east, so the coast runs bottom (Vilamoura) to top (Olhão),
// land on the left, sea on the right. Keys are tied to the narration.
const keysFor = (): Key[] => {
  const temos = wordTime("L09", "temos").a;
  const vil = wordTime("L09", "Vilamoura").a;
  const end = TL.scenes.brand[1];
  return [
    { t: temos - 0.25, pos: [-150, 820, 6], target: [-40, 0, 6], fov: 40 },
    { t: vil - 0.15, pos: [-500, 430, 8], target: [-62, 0, 6], fov: 40 },
    { t: end, pos: [-450, 392, 10], target: [-38, 0, 6], fov: 40 },
  ];
};

const lerp3 = (a: number[], b: number[], p: number) => a.map((v, i) => v + (b[i] - v) * p) as [number, number, number];

export const camAt = (t: number): Cam => {
  const KEYS = keysFor();
  if (t <= KEYS[0].t) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t <= b.t) {
      const p = i === 0 ? ease.inOut(clamp01((t - a.t) / (b.t - a.t))) : clamp01((t - a.t) / (b.t - a.t));
      return { pos: lerp3(a.pos, b.pos, p), target: lerp3(a.target, b.target, p), fov: mix(a.fov, b.fov, p) };
    }
  }
  return KEYS[KEYS.length - 1];
};

export const Brand: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const words = wordsAt("L09");
  const head1 = words.slice(4, 8); // casas prontas a viver,
  const head2 = words.slice(8); // de Vilamoura a Olhão.
  const temos = wordTime("L09", "temos").a;
  const shrink = ease.inOut(clamp01((t - (temos - 0.35)) / 0.55));
  const mapIn = ease.out(clamp01((t - (temos - 0.25)) / 1.0));
  const cam = camAt(t);
  const exit = ease.in(clamp01((t - (t1 - 0.3)) / 0.3));
  // logo build on the drop
  const lb = (d: number, len = 0.32) => clamp01((t - (t0 + d)) / len);
  const logoW = mix(600, 200, shrink);
  const logoH = (logoW * 474) / 528;
  const logoCY = mix(780, 330, shrink);
  const logoFade = 1 - clamp01((t - (temos - 0.05)) / 0.28);
  const pop = ease.back(clamp01((t - t0) / 0.5));
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + exit * 0.25})`, filter: exit > 0.02 ? `blur(${exit * 14}px)` : "none" }}>
      {t >= temos - 0.35 ? (
        <AbsoluteFill style={{ opacity: mapIn, transform: `translateY(${(1 - mapIn) * 420}px)` }}>
          <MapTerrain cam={cam} />
          {/* blend the map's horizon into the brand backdrop */}
          <AbsoluteFill style={{ background: "linear-gradient(180deg, #F3F7FB 0%, #F0F5FA 19%, rgba(240,245,250,0) 30%)" }} />
          <Overlay t={t} cam={cam} />
        </AbsoluteFill>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 540 - logoW / 2,
          top: logoCY - logoH / 2,
          transform: `scale(${mix(1.25, 1, pop)})`,
          opacity: logoFade,
          filter: t < t0 + 0.12 ? `blur(${(1 - clamp01((t - t0) / 0.12)) * 10}px)` : logoFade < 1 ? `blur(${(1 - logoFade) * 10}px)` : "none",
        }}
      >
        <Logo
          width={logoW}
          blue={lb(0.0)}
          dark={lb(0.07)}
          light={lb(0.15)}
          hd={lb(0.3, 0.35)}
          props={lb(0.42, 0.4)}
          holiday={lb(0.55, 0.4)}
          glint={mix(-0.6, 1.6, clamp01((t - (t0 + 0.75)) / 0.6))}
          id="brandlogo"
        />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 26, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={head1} fontSize={70} weight={800} accent={["prontas", "viver,"]} exitAt={head2[0].a - 0.12} exitDur={0.25} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 26, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={head2} fontSize={70} weight={800} accent={["Vilamoura", "Olhão."]} hideBefore={head2[0].a - 0.2} />
      </div>
    </AbsoluteFill>
  );
};

const Overlay: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const proj = projector(cam);
  const vil = wordTime("L09", "Vilamoura").a;
  const olh = wordTime("L09", "Olhão.").a;
  const at = [vil - 0.05, mix(vil, olh, 0.25), mix(vil, olh, 0.5), mix(vil, olh, 0.75), olh - 0.05];
  // route
  const routeP = ease.inOut(clamp01((t - (vil - 0.05)) / (olh - vil + 0.15)));
  const pts = PATH.map(([lon, lat]) => {
    const [x, z] = lonLatToWorld(lon, lat);
    return proj(x, PIN_Y - 0.4, z);
  });
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {routeP > 0 ? (
          <>
            <path d={d} fill="none" stroke={C.blue} strokeOpacity={0.45} strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeP} filter="url(#routeGlow)" strokeLinecap="round" />
            <path d={d} fill="none" stroke={C.blue} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeP} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
      </svg>
      {PLACES.map((pl, i) => {
        const [x, z] = lonLatToWorld(pl.lon, pl.lat);
        const s = proj(x, PIN_Y, z);
        if (s.behind) return null;
        return <Pin key={pl.name} t={t} at={at[i]} x={s.x} y={s.y} place={pl} side={i === 0 ? -1 : 1} />;
      })}
    </AbsoluteFill>
  );
};

const Pin: React.FC<{ t: number; at: number; x: number; y: number; place: Place; side: number }> = ({ t, at, x, y, place, side }) => {
  const p = clamp01((t - at) / 0.45);
  if (p <= 0) return null;
  const drop = ease.back(p);
  const ring = clamp01((t - at - 0.15) / 0.7);
  const big = !!place.big;
  const card = ease.back(clamp01((t - at - 0.08) / 0.45));
  return (
    <>
      {/* ground ring */}
      {ring > 0 && ring < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x - 60,
            top: y - 60,
            width: 120,
            height: 120,
            borderRadius: 999,
            border: `${mix(5, 1, ring)}px solid ${C.blue}`,
            transform: `scaleY(0.42) scale(${mix(0.2, 1.3, ease.out(ring))})`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      {/* marker */}
      <svg
        width={big ? 54 : 40}
        height={big ? 70 : 52}
        viewBox="0 0 54 70"
        style={{
          position: "absolute",
          left: x - (big ? 27 : 20),
          top: y - (big ? 68 : 50),
          transform: `translateY(${(1 - drop) * -90}px) scale(${mix(0.4, 1, drop)})`,
          transformOrigin: "50% 100%",
          opacity: clamp01(p * 3),
          filter: "drop-shadow(0 8px 8px rgba(18,28,39,0.35))",
          overflow: "visible",
        }}
      >
        <path d="M27,68 C27,68 4,42 4,26 A23,23 0 1 1 50,26 C50,42 27,68 27,68 Z" fill={C.blue} stroke="#fff" strokeWidth={3} />
        <circle cx={27} cy={26} r={8.5} fill="#fff" />
      </svg>
      {big && place.img ? (
        <div
          style={{
            position: "absolute",
            left: side < 0 ? x - 300 : x + 46,
            top: side < 0 ? y - 250 : y - 120,
            width: 240,
            padding: 9,
            paddingBottom: 12,
            borderRadius: 22,
            background: C.white,
            boxShadow: shadow.card,
            transform: `translateY(${(1 - card) * 40}px) scale(${mix(0.6, 1, card)})`,
            transformOrigin: side < 0 ? "100% 100%" : "0% 50%",
            opacity: clamp01(card * 2),
          }}
        >
          <div style={{ width: 222, height: 132, borderRadius: 14, overflow: "hidden" }}>
            <Img src={staticFile(place.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ marginTop: 8, marginLeft: 4, fontFamily: FONT.body, fontWeight: 700, fontSize: 28, color: C.ink }}>{place.name}</div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: x + 26,
            top: y - 62,
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.95)",
            boxShadow: shadow.chip,
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 22,
            color: C.ink,
            whiteSpace: "nowrap",
            transform: `scale(${mix(0.5, 1, card)})`,
            transformOrigin: "0% 50%",
            opacity: clamp01(card * 2),
          }}
        >
          {place.name}
        </div>
      )}
    </>
  );
};
