import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { IChat } from "../components/Icons";
import { Logo } from "../components/Logo";
import { shadow } from "../components/UI";
import { TL, wordTime, wordsAt } from "../data/timeline";

// End card: "HD Properties. Fale connosco." — the call to action is the last thing said and seen.
export const End: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0 }) => {
  const words = wordsAt("L14");
  const cta = words.slice(2); // Fale connosco.
  const hd = wordTime("L14", "HD").a;
  const fale = wordTime("L14", "Fale").a;
  const lb = (d: number, len = 0.34) => clamp01((t - (hd - 0.14 + d)) / len);
  const zoom = 1 + clamp01((t - t0) / 6) * 0.035;
  const btn = ease.back(clamp01((t - (fale + 0.25)) / 0.45));
  const pills = ease.back(clamp01((t - (fale + 0.55)) / 0.45));
  const pills2 = ease.back(clamp01((t - (fale + 0.75)) / 0.45));
  const hit = TL.music.stop;
  const glint = mix(-0.6, 1.6, clamp01((t - (hit - 0.05)) / 0.7));
  const pulse = Math.sin(clamp01((t - hit) / 0.35) * Math.PI) * (t > hit ? 1 : 0);
  const enter = ease.out(clamp01((t - t0) / 0.3));
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom * (1 + pulse * 0.025)})`, opacity: enter }}>
      <div style={{ position: "absolute", left: 540 - 250, top: SAFE.top + 70 }}>
        <Logo width={500} blue={lb(0)} dark={lb(0.07)} light={lb(0.15)} hd={lb(0.3)} props={lb(0.42, 0.4)} holiday={lb(0.55, 0.4)} glint={glint} id="endlogo" />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: 805, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={cta} fontSize={104} weight={800} accent={["connosco."]} underline="connosco." lineHeight={1.0} mode="pop" />
      </div>
      {btn > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "26px 46px",
              borderRadius: 999,
              background: `linear-gradient(180deg, #37B3F0 0%, ${C.blue} 100%)`,
              color: C.white,
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 38,
              boxShadow: "0 22px 40px -14px rgba(31,166,235,0.7)",
              transform: `scale(${mix(0.5, 1, btn) * (1 + pulse * 0.05)})`,
              opacity: clamp01(btn * 2),
            }}
          >
            <IChat size={40} color={C.white} stroke={2.4} />
            Pedir informações
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center", gap: 16 }}>
        {pills > 0 ? (
          <div
            style={{
              padding: "14px 26px",
              borderRadius: 999,
              background: C.white,
              color: C.blueDeep,
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 28,
              boxShadow: shadow.chip,
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
              padding: "14px 26px",
              borderRadius: 999,
              background: C.white,
              color: C.ink,
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 28,
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
