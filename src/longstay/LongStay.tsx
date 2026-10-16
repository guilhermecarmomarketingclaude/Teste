import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFonts } from "./fonts";
import { Backdrop, Flash, Grain, Vignette } from "./components/Atmosphere";
import { SafeZoneOverlay } from "./components/SafeZone";
import { Hook3 } from "./scenes/Hook3";
import { Hook } from "./scenes/Hook";
import { Question } from "./scenes/Question";
import { Personas, PERSONA_END } from "./scenes/Personas";
import { Memories } from "./scenes/Memories";
import { Brand } from "./scenes/Brand";
import { Typologies } from "./scenes/Typologies";
import { Homes } from "./scenes/Homes";
import { Offer } from "./scenes/Offer";
import { Cta3 } from "./scenes/Cta3";
import { TL, scene } from "./data/timeline";

loadFonts();

export type LongStayProps = { showSafeZone?: boolean; mix?: string };

const inWin = (t: number, a: number, b: number, pad = 0) => t >= a - pad && t < b + pad;

export const LongStay: React.FC<LongStayProps> = ({ showSafeZone = false, mix = "longstay/mix/mix3.wav" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [k0, k1] = scene("hook3");
  const [h0, h1] = scene("hook");
  const [q0, q1] = scene("question");
  const [p0, p1] = scene("personas");
  const [r0, r1] = scene("memories");
  const [b0, b1] = scene("brand");
  const [y0, y1] = scene("typo");
  const [m0, m1] = scene("homes");
  const [o0, o1] = scene("offer");
  const [c0, c1] = scene("cta");
  const drops = TL.music.drops;
  return (
    <AbsoluteFill style={{ background: "#EEF3F8" }}>
      <Backdrop t={t} />
      {/* L01 starts a little before the cut so the no-hook version opens on a moving frame */}
      {inWin(t, h0 - 0.35, h1, 0.05) ? <Hook t={t} t0={h0} t1={h1} /> : null}
      {inWin(t, q0, q1) ? <Question t={t} t0={q0} t1={q1} /> : null}
      {inWin(t, r0, r1) ? <Memories t={t} t0={r0} t1={r1} /> : null}
      {t >= p0 && t < PERSONA_END + 0.15 ? <Personas t={t} t0={p0} t1={p1} /> : null}
      {inWin(t, b0, b1) ? <Brand t={t} t0={b0} t1={b1} /> : null}
      {inWin(t, y0, y1) ? <Typologies t={t} t0={y0} t1={y1} /> : null}
      {inWin(t, m0, m1) ? <Homes t={t} t0={m0} t1={m1} /> : null}
      {inWin(t, o0, o1) ? <Offer t={t} t0={o0} t1={o1} /> : null}
      {inWin(t, c0, c1 + 1) ? <Cta3 t={t} t0={c0} t1={c1} /> : null}
      {inWin(t, k0, k1) ? <Hook3 t={t} t0={k0} t1={k1} /> : null}
      <Flash p={(t - drops[1]) / 0.4} max={0.7} />
      <Flash p={(t - drops[2]) / 0.45} max={0.85} />
      <Vignette strength={0.12} />
      <Grain opacity={0.05} />
      {showSafeZone ? <SafeZoneOverlay /> : null}
      {mix ? (
        <Sequence from={0} durationInFrames={Math.round(TL.duration * fps)}>
          <Audio src={staticFile(mix)} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
