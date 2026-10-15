import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { TL, vo, wordTime, wordsAt } from "../data/timeline";
import { Polaroid } from "./ColdOpen";

// "Ou para quem, simplesmente, quer ficar mais tempo." → a month of days lands on the table as
// polaroids (one per shutter), then "O Algarve sabe melhor… sem pressa." with the camera
// almost still. The pile is sucked into the centre on the build into drop 2.

const W = 340; // polaroid width (photo ≈ 302 × 318, matching the persona window's last shape)
const PICS = [
  { src: "longstay/img/loc_quarteira.jpg", cap: "Dia 1", x: 540, y: 958, r: 0, from: [0, 0] },
  { src: "longstay/img/th_beach.jpg", cap: "Dia 4", x: 286, y: 905, r: -12, from: [-900, 200] },
  { src: "longstay/img/th_villa_pool.jpg", cap: "Dia 9", x: 806, y: 880, r: 9, from: [900, -100] },
  { src: "longstay/img/loc_vilamoura.jpg", cap: "Dia 13", x: 318, y: 1190, r: 7, from: [-800, 700] },
  { src: "longstay/img/th_golf_sea.jpg", cap: "Dia 18", x: 790, y: 1172, r: -8, from: [800, 800] },
  { src: "longstay/img/th_bedroom_view.jpg", cap: "Dia 23", x: 548, y: 820, r: 4, from: [0, -1100] },
  { src: "longstay/img/th_pool_palms.jpg", cap: "Dia 28", x: 556, y: 1110, r: -3, from: [200, 1300] },
];

export const Memories: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t1 }) => {
  const mem0 = vo("L08").start - 0.04;
  const beat = TL.music.beat;
  const lands = PICS.map((_, i) => (i === 0 ? mem0 + 0.42 : mem0 + 0.48 + (i - 1) * beat * 0.75));
  const l8 = wordsAt("L08");
  const top1 = l8.slice(0, 4); // Ou para quem, simplesmente,
  const top2 = l8.slice(4); // quer ficar mais tempo.
  const e01 = wordsAt("E01");
  const sem = wordTime("E01", "sem").a;
  const warmIn = clamp01((t - mem0) / 0.45);
  // camera: slow drift that nearly stops for "sem pressa"
  const drift = clamp01((t - mem0) / (t1 - mem0));
  const zoom = 1 + ease.out(drift) * 0.09;
  const rot = mix(-1.2, 0.8, ease.out(drift));
  const suck = ease.in(clamp01((t - (t1 - 0.62)) / 0.62));
  const leak = clamp01((t - 24.9) / 2.6);
  return (
    <AbsoluteFill>
      {/* warm table */}
      <AbsoluteFill
        style={{
          opacity: warmIn,
          background: "radial-gradient(1200px 1500px at 540px 880px, #FBF6EE 0%, #F2E8DA 55%, #E4D5C1 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: warmIn * 0.5,
          background: "repeating-linear-gradient(90deg, rgba(160,130,95,0.05) 0 2px, rgba(0,0,0,0) 2px 9px)",
        }}
      />
      <AbsoluteFill
        style={{
          transform: `scale(${zoom * mix(1, 0.05, suck)}) rotate(${rot + suck * 40}deg)`,
          transformOrigin: "540px 1020px",
          filter: suck > 0.02 ? `blur(${suck * 16}px)` : "none",
        }}
      >
        {PICS.map((p, i) => {
          const land = lands[i];
          const q = i === 0 ? clamp01((t - (mem0 + 0.36)) / 0.08) : clamp01((t - (land - 0.32)) / 0.32);
          if (q <= 0) return null;
          const e = ease.out(q);
          const settle = i === 0 ? 0 : Math.sin(clamp01((t - land) / 0.25) * Math.PI) * (1 - clamp01((t - land) / 0.25));
          const x = p.x + p.from[0] * (1 - e);
          const y = p.y + p.from[1] * (1 - e);
          const sc = (i === 0 ? 1 : mix(1.35, 1, e)) * (1 - settle * 0.03);
          const r = p.r + (1 - e) * (i % 2 ? 50 : -50);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - W / 2,
                top: y - (W * 1.25) / 2,
                transform: `rotate(${r}deg) scale(${sc})`,
                filter: q < 1 && i > 0 ? `blur(${(1 - e) * 6}px)` : "none",
              }}
            >
              <Polaroid src={p.src} w={W} caption={p.cap} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* low golden light drifting over the table */}
      <AbsoluteFill
        style={{
          mixBlendMode: "soft-light",
          opacity: 0.75 * Math.sin(leak * Math.PI),
          background: `radial-gradient(900px 1300px at ${mix(100, 1000, leak)}px 700px, rgba(255,190,110,0.95), rgba(255,190,110,0) 70%)`,
        }}
      />
      {/* type */}
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 30, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={top1} fontSize={64} weight={800} accent={["simplesmente,"]} exitAt={top2[0].a - 0.1} exitDur={0.26} lineHeight={1.05} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 22, display: "flex", justifyContent: "center" }}>
        <Kinetic
          t={t}
          words={top2}
          fontSize={112}
          weight={800}
          accent={["mais", "tempo."]}
          underline="tempo."
          breakAfter={["ficar"]}
          hideBefore={top2[0].a - 0.2}
          exitAt={e01[0].a - 0.35}
          exitDur={0.4}
          exitMode="blur"
          lineHeight={1.0}
        />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 30, textAlign: "center", opacity: 1 - suck }}>
        <SlowLine t={t} words={e01.slice(0, 4)} size={66} color={C.ink} accent="Algarve" />
        <div style={{ height: 12 }} />
        <SlowLine t={t} words={e01.slice(4)} size={124} color={C.blueText} tracking from={sem} />
      </div>
    </AbsoluteFill>
  );
};

// Slow, settling type for "sem pressa": letters drift in and the tracking closes up.
const SlowLine: React.FC<{
  t: number;
  words: { w: string; a: number; b: number }[];
  size: number;
  color: string;
  accent?: string;
  tracking?: boolean;
  from?: number;
}> = ({ t, words, size, color, accent, tracking, from }) => {
  const first = from ?? words[0].a;
  const tr = tracking ? mix(0.34, -0.02, ease.out(clamp01((t - (first - 0.15)) / 1.6))) : -0.02;
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: `${tr}em`, color, whiteSpace: "nowrap" }}>
      {words.map((wd, i) => {
        const p = ease.out(clamp01((t - (wd.a - 0.18)) / 0.9));
        const isAcc = accent && wd.w.startsWith(accent);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 26}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 12}px)` : "none",
              color: isAcc ? C.blueText : undefined,
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              textShadow: "0 4px 24px rgba(251,246,238,0.9)",
            }}
          >
            {wd.w}
          </span>
        );
      })}
    </div>
  );
};
