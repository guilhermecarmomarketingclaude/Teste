import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { Clip } from "../components/Media";
import { TL, vo, wordTime, wordsAt } from "../data/timeline";
import { Polaroid } from "./Polaroid";

// "Ou para quem, simplesmente, quer ficar mais tempo." → a month of real HD Properties days lands on
// the table as polaroids (one per shutter). On "O Algarve sabe melhor… sem pressa." the camera pushes
// into the last polaroid (day 28) until it becomes the moving sea, slowed right down.

const W = 340; // polaroid width (photo ≈ 302 × 318, matching the persona window's last shape)
const PICS = [
  { src: "longstay/v3/tex/primula_terrace.jpg", cap: "Dia 1", x: 540, y: 958, r: 0, from: [0, 0] },
  { src: "longstay/v3/tex/quarteira_beach_view.jpg", cap: "Dia 4", x: 286, y: 905, r: -12, from: [-900, 200] },
  { src: "longstay/v3/tex/villa_malvas_pool.jpg", cap: "Dia 9", x: 772, y: 870, r: 9, from: [900, -100] },
  { src: "longstay/v3/tex/gold_marina.jpg", cap: "Dia 13", x: 322, y: 1040, r: 7, from: [-800, 700] },
  { src: "longstay/v3/tex/villa_popa_golf.jpg", cap: "Dia 18", x: 732, y: 1010, r: -8, from: [800, 800] },
  { src: "longstay/v3/tex/skyview_bedroom.jpg", cap: "Dia 23", x: 548, y: 820, r: 4, from: [0, -1100] },
  { src: "longstay/v3/tex/waves_still.jpg", cap: "Dia 28", x: 548, y: 1000, r: -3, from: [200, 1300] },
];
const LAST = PICS.length - 1;

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
  // camera over the table
  const drift = clamp01((t - mem0) / (t1 - mem0));
  const zoom = 1 + ease.out(drift) * 0.06;
  const rot = mix(-1.2, 0.6, ease.out(drift));
  // push into day 28 → full-frame sea
  const push = ease.inOut(clamp01((t - (e01[0].a - 0.4)) / 0.8));
  const live = clamp01((t - (e01[0].a + 0.25)) / 0.3);
  const suck = ease.in(clamp01((t - (t1 - 0.62)) / 0.62));
  // the polaroid's photo (0.89w × 0.9345w) must cover 1080 × 1920 at the end of the push
  const fullS = (1.04 * 1920) / (W * 0.9345) / zoom;
  return (
    <AbsoluteFill>
      {/* warm table */}
      <AbsoluteFill style={{ opacity: warmIn, background: "radial-gradient(1200px 1500px at 540px 880px, #FBF6EE 0%, #F2E8DA 55%, #E4D5C1 100%)" }} />
      <AbsoluteFill style={{ opacity: warmIn * 0.5, background: "repeating-linear-gradient(90deg, rgba(160,130,95,0.05) 0 2px, rgba(0,0,0,0) 2px 9px)" }} />
      <AbsoluteFill
        style={{
          transform: `scale(${zoom * mix(1, 0.05, suck)}) rotate(${rot * (1 - push) + suck * 40}deg)`,
          transformOrigin: "540px 960px",
          filter: suck > 0.02 ? `blur(${suck * 16}px)` : "none",
        }}
      >
        {PICS.map((p, i) => {
          const land = lands[i];
          const q = i === 0 ? clamp01((t - (mem0 + 0.36)) / 0.08) : clamp01((t - (land - 0.32)) / 0.32);
          if (q <= 0) return null;
          const e = ease.out(q);
          const settle = i === 0 ? 0 : Math.sin(clamp01((t - land) / 0.25) * Math.PI) * (1 - clamp01((t - land) / 0.25));
          let x = p.x + p.from[0] * (1 - e);
          let y = p.y + p.from[1] * (1 - e);
          let sc = (i === 0 ? 1 : mix(1.35, 1, e)) * (1 - settle * 0.03);
          let r = p.r + (1 - e) * (i % 2 ? 50 : -50);
          let o = 1;
          let blur = q < 1 && i > 0 ? (1 - e) * 6 : 0;
          if (i === LAST) {
            // the camera pushes into day 28
            x = mix(x, 540, push);
            // element box is 1.1895w tall (top at y - 0.625w); scale pivots on its centre, the photo
            // centre sits 0.0725w above that pivot → solve for the photo centre at y = 960
            y = mix(y, 960 + 0.0302 * W + 0.0725 * W * mix(sc, fullS, push), push);
            sc = mix(sc, fullS, push);
            r = mix(r, 0, push);
          } else {
            // the rest of the month slides out of frame
            const away = ease.in(clamp01(push * 1.4));
            x += (x - 540) * away * 1.4;
            y += (y - 960) * away * 1.4;
            o = 1 - away;
            blur = Math.max(blur, away * 10);
          }
          if (o <= 0) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - W / 2,
                top: y - (W * 1.25) / 2,
                transform: `rotate(${r}deg) scale(${sc})`,
                filter: blur > 0.2 ? `blur(${blur}px)` : "none",
                opacity: o,
                zIndex: i === LAST ? 2 : 1,
              }}
            >
              <Polaroid src={p.src} w={W} caption={p.cap} />
            </div>
          );
        })}
        {/* day 28 comes alive: the sea, slowed down */}
        {live > 0 ? (
          <AbsoluteFill style={{ opacity: live, transform: `scale(${1 / zoom})`, zIndex: 3, filter: "saturate(1.22) brightness(1.07) contrast(1.06)" }}>
            <Clip src="longstay/v3/clips/s_waves.mp4" at={e01[0].a + 0.2} dur={t1 - e01[0].a} rate={0.75} />
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,30,44,0.45) 0%, rgba(12,30,44,0) 40%)" }} />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
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
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 40, textAlign: "center", opacity: 1 - suck }}>
        <SlowLine t={t} words={e01.slice(0, 4)} size={66} color={C.white} accent="Algarve" />
        <div style={{ height: 12 }} />
        <SlowLine t={t} words={e01.slice(4)} size={124} color={C.white} tracking from={sem} />
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
              color: isAcc ? C.blue : undefined,
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              textShadow: "0 6px 30px rgba(8,24,38,0.55)",
            }}
          >
            {wd.w}
          </span>
        );
      })}
    </div>
  );
};
