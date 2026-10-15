import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { wordsAt } from "../data/timeline";
import { VillaPlate } from "./Personas";

// 21.12–24.96 s: the villa, full frame, slow push-in. "O Algarve sabe melhor… sem pressa."
// Type is set slowly here on purpose: letters drift in and settle, no snap.
export const Slow: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t1 }) => {
  const words = wordsAt("E01");
  const l1 = words.slice(0, 4); // O Algarve sabe melhor…
  const l2 = words.slice(4); // sem pressa.
  // exit into the brand drop: quick push + blur + white
  const whip = ease.in(clamp01((t - (t1 - 0.36)) / 0.36));
  const warm = 0.5 + 0.5 * Math.sin(clamp01((t - 21.1) / 3.6) * Math.PI);
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + whip * 0.5})`, filter: whip > 0.02 ? `blur(${whip * 18}px)` : "none" }}>
      <VillaPlate t={t} />
      {/* golden light sweeping slowly across the facade */}
      <AbsoluteFill
        style={{
          mixBlendMode: "soft-light",
          opacity: 0.55 * warm,
          background: `radial-gradient(900px 1200px at ${mix(200, 900, clamp01((t - 21.1) / 3.8))}px 520px, rgba(255,196,120,0.9), rgba(255,196,120,0) 70%)`,
        }}
      />
      {/* soft top fade so the type always reads on the sky */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(246,236,222,0.55) 0%, rgba(246,236,222,0) 34%)" }} />
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 28, textAlign: "center" }}>
        <SlowLine t={t} words={l1} size={68} weight={800} color={C.ink} accent="Algarve" />
        <div style={{ height: 14 }} />
        <SlowLine t={t} words={l2} size={124} weight={800} color={C.blueText} tracking />
      </div>
    </AbsoluteFill>
  );
};

const SlowLine: React.FC<{
  t: number;
  words: { w: string; a: number; b: number }[];
  size: number;
  weight: number;
  color: string;
  accent?: string;
  tracking?: boolean;
}> = ({ t, words, size, weight, color, accent, tracking }) => {
  const first = words[0].a;
  const tr = tracking ? mix(0.32, -0.02, ease.out(clamp01((t - (first - 0.15)) / 1.6))) : -0.02;
  return (
    <div
      style={{
        fontFamily: FONT.display,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: `${tr}em`,
        color,
        textShadow: "0 4px 26px rgba(255,244,230,0.75)",
        whiteSpace: "nowrap",
      }}
    >
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
            }}
          >
            {wd.w}
          </span>
        );
      })}
    </div>
  );
};
