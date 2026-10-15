import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { Logo } from "../components/Logo";
import { shadow } from "../components/UI";
import { wordTime, wordsAt } from "../data/timeline";

// 42.5–48.0 s: end card. "HD Properties. Fique o tempo que quiser."
export const End: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0 }) => {
  const words = wordsAt("L14");
  const tag = words.slice(2); // Fique o tempo que quiser.
  const hd = wordTime("L14", "HD").a;
  const lb = (d: number, len = 0.34) => clamp01((t - (hd - 0.12 + d)) / len);
  const zoom = 1 + clamp01((t - t0) / 5.5) * 0.04;
  const pills = ease.back(clamp01((t - 45.2) / 0.45));
  const pills2 = ease.back(clamp01((t - 45.45) / 0.45));
  const hit = 46.08;
  const glint = mix(-0.6, 1.6, clamp01((t - (hit - 0.05)) / 0.7));
  const enter = ease.out(clamp01((t - t0) / 0.35));
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, opacity: enter }}>
      <div style={{ position: "absolute", left: 540 - 270, top: 380 }}>
        <Logo width={540} blue={lb(0)} dark={lb(0.07)} light={lb(0.15)} hd={lb(0.3)} props={lb(0.42, 0.4)} holiday={lb(0.55, 0.4)} glint={glint} id="endlogo" />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: 920, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={tag} fontSize={80} weight={800} accent={["quiser."]} underline="quiser." breakAfter={["tempo"]} lineHeight={1.06} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1128, display: "flex", justifyContent: "center", gap: 16 }}>
        {pills > 0 ? (
          <div
            style={{
              padding: "16px 28px",
              borderRadius: 999,
              background: C.blue,
              color: C.white,
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 30,
              boxShadow: "0 16px 30px -14px rgba(31,166,235,0.8)",
              transform: `scale(${mix(0.5, 1, pills)})`,
              opacity: clamp01(pills * 2),
              whiteSpace: "nowrap",
            }}
          >
            −30% · estadias +28 dias
          </div>
        ) : null}
        {pills2 > 0 ? (
          <div
            style={{
              padding: "16px 28px",
              borderRadius: 999,
              background: C.white,
              color: C.ink,
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 30,
              boxShadow: shadow.chip,
              transform: `scale(${mix(0.5, 1, pills2)})`,
              opacity: clamp01(pills2 * 2),
              whiteSpace: "nowrap",
            }}
          >
            hdproperties.pt
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
