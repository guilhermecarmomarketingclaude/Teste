import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { IMoon } from "../components/Icons";
import { shadow } from "../components/UI";
import { wordTime, wordsAt } from "../data/timeline";

const HEAD = ["S", "T", "Q", "Q", "S", "S", "D"];
const CELL = 94;
const GAP = 10;

// 3.2–7.68 s: the week becomes a month (date-range selection), then "pay less per night?".
export const Question: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const words = wordsAt("L02");
  const l1 = words.slice(0, 5); // E se ficasse um mês…
  const l2 = words.slice(5); // e pagasse menos por noite?
  const mes = wordTime("L02", "mês…");
  const pag = wordTime("L02", "pagasse");
  const enter = ease.out(clamp01((t - t0) / 0.5));
  // push-in during the gap bar, then whip out at the drop
  const push = ease.in(clamp01((t - (t1 - 1.88)) / 1.88));
  const whip = ease.in(clamp01((t - (t1 - 0.32)) / 0.32));
  const gridW = 7 * CELL + 6 * GAP;
  const rangeP = ease.inOut(clamp01((t - (mes.a - 0.1)) / 1.0));
  const rows = 5;
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + push * 0.12 + whip * 1.6})`, filter: whip > 0.02 ? `blur(${whip * 22}px)` : "none", opacity: 1 - whip * 0.6 }}>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 24, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={l1} fontSize={104} accent={["um", "mês…"]} underline="mês…" breakAfter={["ficasse"]} lineHeight={1.04} />
      </div>
      <AbsoluteFill style={{ perspective: 1600, perspectiveOrigin: "50% 40%" }}>
        <div
          style={{
            position: "absolute",
            left: 540 - gridW / 2,
            top: 575,
            width: gridW,
            transformStyle: "preserve-3d",
            transform: `rotateX(${mix(48, 26, enter) - push * 8}deg) rotateZ(${mix(-6, -2, enter) + push * 2}deg) translateZ(${push * 120}px)`,
            transformOrigin: "50% 30%",
          }}
        >
          <div style={{ display: "flex", gap: GAP, marginBottom: 14 }}>
            {HEAD.map((h, i) => (
              <div
                key={i}
                style={{
                  width: CELL,
                  textAlign: "center",
                  fontFamily: FONT.display,
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "0.15em",
                  color: i >= 5 ? C.blue : C.muted,
                  opacity: ease.out(clamp01((t - t0 - i * 0.03) / 0.3)),
                }}
              >
                {h}
              </div>
            ))}
          </div>
          <div style={{ position: "relative", height: rows * CELL + (rows - 1) * GAP }}>
            {Array.from({ length: rows * 7 }).map((_, idx) => {
              const r = Math.floor(idx / 7);
              const c = idx % 7;
              const day = idx + 1;
              const isDay = day <= 30;
              const d0 = t0 - 0.05 + (r + c) * 0.035;
              const p = ease.back(clamp01((t - d0) / 0.42));
              if (p <= 0) return null;
              // date-range selection sweeping from day 1 to day 30
              const sel = clamp01(rangeP * 31 - idx);
              const isEdge = day === 1 || day === 30;
              const fill = isDay ? sel : 0;
              const bg = isEdge && fill > 0.5 ? C.blue : `rgba(220,239,251,${fill})`;
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: c * (CELL + GAP),
                    top: r * (CELL + GAP),
                    width: CELL,
                    height: CELL,
                    borderRadius: 22,
                    background: isDay ? (fill > 0 ? bg : C.white) : "rgba(255,255,255,0.45)",
                    boxShadow: isDay ? shadow.soft : "none",
                    transform: `translateZ(${(1 - p) * 220}px) translateY(${(1 - p) * -80}px) scale(${mix(0.6, 1, p)})`,
                    opacity: clamp01(p * 2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT.display,
                    fontWeight: 700,
                    fontSize: 34,
                    color: isEdge && fill > 0.5 ? C.white : fill > 0.5 ? C.blueDeep : C.ink,
                  }}
                >
                  {isDay ? day : ""}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      {/* price per night card */}
      <PriceCard t={t} at={pag.a - 0.25} />
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: 1150, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={l2} fontSize={62} weight={800} accent={["menos"]} karaoke lineHeight={1.1} />
      </div>
    </AbsoluteFill>
  );
};

const PriceCard: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = ease.back(clamp01((t - at) / 0.45));
  if (p <= 0) return null;
  const draw = ease.inOut(clamp01((t - at - 0.2) / 1.0));
  const pts = [
    [0, 18],
    [40, 22],
    [80, 30],
    [120, 46],
    [160, 58],
    [200, 76],
    [240, 88],
  ];
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 676,
        top: 640,
        width: 300,
        padding: "22px 26px",
        borderRadius: 28,
        background: "rgba(255,255,255,0.96)",
        boxShadow: shadow.card,
        transform: `translateY(${(1 - p) * 40}px) scale(${mix(0.7, 1, p)}) rotate(${mix(6, 2, p)}deg)`,
        opacity: clamp01(p * 2),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: C.inkSoft }}>
        <IMoon size={26} color={C.blue} />
        <span>Preço por noite</span>
      </div>
      <svg width={240} height={92} viewBox="-6 0 252 100" style={{ marginTop: 10 }}>
        <path d={d} fill="none" stroke={C.blue} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <circle cx={pts[6][0]} cy={pts[6][1]} r={8 * draw} fill={C.blue} />
      </svg>
    </div>
  );
};
