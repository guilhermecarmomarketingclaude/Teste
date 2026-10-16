import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, H, W } from "../brand";

// Brand backdrop: pale sky gradient, dot grid and a slow drifting glow.
export const Backdrop: React.FC<{ t: number; glow?: number; dots?: number; tint?: string }> = ({
  t,
  glow = 1,
  dots = 1,
  tint,
}) => {
  const gx = 540 + Math.sin(t * 0.35) * 160;
  const gy = 620 + Math.cos(t * 0.27) * 120;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bgTop} 0%, #EEF3F8 45%, ${C.bgBottom} 100%)` }}>
      <AbsoluteFill
        style={{
          opacity: 0.9 * glow,
          background: `radial-gradient(900px 900px at ${gx}px ${gy}px, rgba(35,164,235,0.13), rgba(35,164,235,0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.55 * glow,
          background: `radial-gradient(1100px 700px at 540px 1900px, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)`,
        }}
      />
      {dots > 0 ? <DotGrid opacity={0.5 * dots} offsetY={(t * 6) % 36} /> : null}
      {tint ? <AbsoluteFill style={{ background: tint }} /> : null}
    </AbsoluteFill>
  );
};

export const DotGrid: React.FC<{ opacity?: number; offsetY?: number; color?: string; gap?: number }> = ({
  opacity = 0.5,
  offsetY = 0,
  color = "#9DB4C8",
  gap = 36,
}) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
    <defs>
      <pattern id="dotgrid" width={gap} height={gap} patternUnits="userSpaceOnUse" y={offsetY}>
        <circle cx={gap / 2} cy={gap / 2} r={1.6} fill={color} />
      </pattern>
      <radialGradient id="dotfade" cx="50%" cy="45%" r="70%">
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
      </radialGradient>
      <mask id="dotmask">
        <rect width={W} height={H} fill="url(#dotfade)" />
      </mask>
    </defs>
    <rect width={W} height={H} fill="url(#dotgrid)" mask="url(#dotmask)" />
  </svg>
);

// Fine film grain: eight pre-baked noise plates cycled per frame (much cheaper than an SVG
// feTurbulence at 1080x1920 in the software renderer, same look).
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(random(`grain-${frame}`) * 8);
  return (
    <Img
      src={staticFile(`longstay/grain/g${k}.jpg`)}
      style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: opacity * 1.6, mixBlendMode: "overlay", pointerEvents: "none" }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.35 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(18,28,39,${strength}) 100%)`,
    }}
  />
);

// Warm light leak that sweeps across during big transitions.
export const LightLeak: React.FC<{ p: number; hue?: "warm" | "blue" }> = ({ p, hue = "warm" }) => {
  if (p <= 0 || p >= 1) return null;
  const a = Math.sin(p * Math.PI);
  const x = -400 + p * 1900;
  const c1 = hue === "warm" ? "255,190,120" : "120,200,255";
  const c2 = hue === "warm" ? "255,236,200" : "220,240,255";
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: a }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(700px 1400px at ${x}px 700px, rgba(${c1},0.55), rgba(${c1},0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(400px 900px at ${x + 160}px 900px, rgba(${c2},0.6), rgba(${c2},0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Full-frame white flash used on drops.
export const Flash: React.FC<{ p: number; color?: string; max?: number }> = ({ p, color = "#fff", max = 0.85 }) => {
  if (p <= 0 || p >= 1) return null;
  const a = (1 - p) * (1 - p) * max;
  return <AbsoluteFill style={{ background: color, opacity: a, pointerEvents: "none" }} />;
};
