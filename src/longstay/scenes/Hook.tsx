import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { ICalendar } from "../components/Icons";
import { shadow } from "../components/UI";
import { wordTime, wordsAt } from "../data/timeline";

const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
// a week of real HD Properties days
const PHOTOS = [
  "longstay/v3/tex/quarteira_balcony_beach.jpg",
  "longstay/v3/tex/vilamoura_marina_terrace.jpg",
  "longstay/v3/tex/villa_malvas_pool.jpg",
  "longstay/v3/tex/faro_ria_view.jpg",
  "longstay/v3/tex/olhao_terrace.jpg",
  "longstay/v3/tex/villa_hd_pool.jpg",
  "longstay/v3/tex/sunset_wine.jpg",
];

// 0–3.2 s: seven day cards on a 3D carousel; on "passa a voar" they tear off and fly away.
export const Hook: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  // cards start 0.3 s before the cut, so the no-hook version opens on a moving frame
  const lt = t - (t0 - 0.3);
  const passa = wordTime("L01", "passa").a;
  const voar = wordTime("L01", "voar.");
  const words = wordsAt("L01");
  const line1 = words.slice(0, 4); // Uma semana no Algarve
  const line2 = words.slice(4); // passa a voar.
  const exit = t1 - 0.28;
  const camZ = mix(0, 260, ease.inOut(clamp01(lt / 2.4)));
  const camRot = mix(-10, 6, ease.inOut(clamp01(lt / 2.6)));
  return (
    <AbsoluteFill>
      {/* cards: a fanned hand of seven days */}
      <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "50% 45%" }}>
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1365,
            transformStyle: "preserve-3d",
            transform: `translateZ(${camZ * 0.6}px) rotateX(${mix(22, 12, ease.inOut(clamp01(lt / 2.4)))}deg) rotateY(${camRot * 0.6}deg) scale(1.28)`,
          }}
        >
          {DAYS.map((d, i) => {
            const k = i - 3;
            const open = ease.out(clamp01((lt - 0.05 - i * 0.045) / 0.6));
            const pin = ease.out(clamp01((lt - 0.0 - i * 0.03) / 0.45));
            const tOff = passa - 0.1 + (6 - i) * 0.12;
            const po = clamp01((t - tOff) / 0.7);
            const fly = ease.in(po);
            const theta = k * 10.5 * open;
            const R = 470;
            const rad = (theta * Math.PI) / 180;
            const cx = Math.sin(rad) * R;
            const cy = -Math.cos(rad) * R;
            const tx = cx + fly * (k * 140 + 60);
            const ty = cy + mix(300, 0, pin) - fly * 1700;
            const tz = i * 3 + fly * 900;
            const rz = theta + fly * (k % 2 === 0 ? 70 : -55);
            const rx = fly * 60;
            const op = clamp01(pin * 1.6) * (1 - clamp01((po - 0.7) / 0.3));
            if (op <= 0) return null;
            const blur = fly > 0.04 ? Math.min(16, fly * 22) : (1 - pin) * 10;
            return (
              <div
                key={d}
                style={{
                  position: "absolute",
                  width: 190,
                  height: 256,
                  marginLeft: -95,
                  marginTop: -128,
                  borderRadius: 28,
                  background: C.white,
                  boxShadow: shadow.card,
                  transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateZ(${rz}deg) rotateX(${rx}deg)`,
                  opacity: op,
                  filter: blur > 0.3 ? `blur(${blur}px)` : "none",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 58,
                    background: i === 6 ? C.blue : "#EEF4F9",
                    color: i === 6 ? C.white : C.inkSoft,
                    fontFamily: FONT.display,
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "0.2em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {d}
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 58, bottom: 0, overflow: "hidden" }}>
                  <Img src={staticFile(PHOTOS[i])} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 - Math.min(1, lt / 3) * 0.06})` }} />
                  <div
                    style={{
                      position: "absolute",
                      left: 12,
                      bottom: 10,
                      fontFamily: FONT.display,
                      fontWeight: 800,
                      fontSize: 44,
                      color: C.white,
                      letterSpacing: "-0.03em",
                      textShadow: "0 3px 12px rgba(10,25,40,0.55)",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* headline */}
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 30, display: "flex", justifyContent: "center" }}>
        <Kinetic
          t={t}
          words={line1}
          fontSize={112}
          accent={["Algarve"]}
          underline="Algarve"
          breakAfter={["semana"]}
          exitAt={exit}
          lineHeight={1.02}
        />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: 1060, display: "flex", justifyContent: "center" }}>
        <FlyingWords t={t} words={line2} flyAt={voar.b + 0.1} exit={exit} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1205,
          display: "flex",
          justifyContent: "center",
          opacity: ease.out(clamp01((lt - 0.3) / 0.4)) * (1 - clamp01((t - passa) / 0.3)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.body, fontWeight: 600, fontSize: 26, color: C.muted }}>
          <ICalendar size={30} color={C.blue} />
          <span>7 noites</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// "passa a voar." — letters lift off like birds once the word is spoken.
const FlyingWords: React.FC<{ t: number; words: { w: string; a: number; b: number }[]; flyAt: number; exit: number }> = ({
  t,
  words,
  flyAt,
}) => {
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 112, letterSpacing: "-0.02em", color: C.blueText, display: "flex", gap: 30 }}>
      {words.map((wd, wi) => {
        const p = ease.out(clamp01((t - (wd.a - 0.06)) / 0.26));
        return (
          <span key={wi} style={{ display: "inline-flex" }}>
            {wd.w.split("").map((ch, ci) => {
              const idx = wi * 6 + ci;
              const f = ease.in(clamp01((t - flyAt - idx * 0.025) / 0.55));
              const dx = f * (Math.sin(idx * 1.7) * 160 + 60);
              const dy = -f * (700 + (idx % 3) * 160);
              const rot = f * (idx % 2 ? 50 : -40);
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    opacity: p * (1 - clamp01((f - 0.6) / 0.4)),
                    transform: `translate(${dx}px, ${dy + (1 - p) * 60}px) rotate(${rot}deg) scale(${1 - f * 0.4})`,
                    filter: f > 0.02 ? `blur(${f * 10}px)` : p < 1 ? `blur(${(1 - p) * 10}px)` : "none",
                    color: wi === 2 ? C.blueText : C.ink,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};
