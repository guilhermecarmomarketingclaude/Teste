import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFonts } from "./fonts";
import { Backdrop, Flash, Grain, Vignette } from "./components/Atmosphere";
import { SafeZoneOverlay } from "./components/SafeZone";
import { Hook } from "./scenes/Hook";
import { Question } from "./scenes/Question";
import { Personas } from "./scenes/Personas";
import { Slow } from "./scenes/Slow";
import { Brand } from "./scenes/Brand";
import { Homes } from "./scenes/Homes";
import { Offer } from "./scenes/Offer";
import { Cta } from "./scenes/Cta";
import { End } from "./scenes/End";
import { TL, scene } from "./data/timeline";

loadFonts();

export type LongStayProps = { showSafeZone?: boolean; mix?: string };

const inWin = (t: number, a: number, b: number, pad = 0) => t >= a - pad && t < b + pad;

export const LongStay: React.FC<LongStayProps> = ({ showSafeZone = false, mix = "longstay/mix/mix.wav" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [h0, h1] = scene("hook");
  const [q0, q1] = scene("question");
  const [p0, p1] = scene("personas");
  const [s0, s1] = scene("slow");
  const [b0, b1] = scene("brand");
  const [m0, m1] = scene("homes");
  const [o0, o1] = scene("offer");
  const [c0, c1] = scene("cta");
  const [e0, e1] = scene("end");
  return (
    <AbsoluteFill style={{ background: "#EEF3F8" }}>
      <Backdrop t={t} />
      {inWin(t, h0, h1, 0.05) ? <Hook t={t} /> : null}
      {inWin(t, q0, q1) ? <Question t={t} t0={q0} t1={q1} /> : null}
      {inWin(t, p0, p1) ? <Personas t={t} t0={p0} t1={p1} /> : null}
      {inWin(t, s0, s1) ? <Slow t={t} t0={s0} t1={s1} /> : null}
      {inWin(t, b0, b1) ? <Brand t={t} t0={b0} t1={b1} /> : null}
      {inWin(t, m0, m1) ? <Homes t={t} t0={m0} t1={m1} /> : null}
      {inWin(t, o0, o1) ? <Offer t={t} t0={o0} t1={o1} /> : null}
      {inWin(t, c0, c1) ? <Cta t={t} t0={c0} t1={c1} /> : null}
      {inWin(t, e0, e1 + 1) ? <End t={t} t0={e0} t1={e1} /> : null}
      <Flash p={(t - TL.music.drops[0]) / 0.4} max={0.7} />
      <Flash p={(t - TL.music.drops[1]) / 0.45} max={0.85} />
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
