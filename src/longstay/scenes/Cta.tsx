import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { IArrow, ICalendar, IPin } from "../components/Icons";
import { Ripple, shadow } from "../components/UI";
import { lerpPts, shapePts, toPath } from "../components/Morph";
import { wordTime, wordsAt } from "../data/timeline";

// 40.2–42.5 s: the blue of the offer folds down into the booking button. "Reserve já a sua estadia."
const BTN = { x: 170, y: 1088, w: 740, h: 124 };
const FULL = shapePts({ kind: "rect", cx: 540, cy: 960, w: 1180, h: 2060, r: 0 });
const PILL = shapePts({ kind: "rect", cx: BTN.x + BTN.w / 2, cy: BTN.y + BTN.h / 2, w: BTN.w, h: BTN.h, r: BTN.h / 2 });

export const Cta: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const words = wordsAt("L13");
  const fold = ease.inOut(clamp01((t - t0) / 0.55));
  const d = toPath(lerpPts(FULL, PILL, fold));
  const card = ease.back(clamp01((t - (t0 + 0.22)) / 0.55));
  const label = ease.out(clamp01((t - (t0 + 0.5)) / 0.3));
  const estadia = wordTime("L13", "estadia.").a;
  const tap = estadia + 0.12;
  const tapP = clamp01((t - tap) / 0.3);
  const press = Math.sin(tapP * Math.PI);
  const finger = ease.out(clamp01((t - (tap - 0.55)) / 0.5));
  const fingerOut = ease.in(clamp01((t - (tap + 0.25)) / 0.35));
  const exit = ease.in(clamp01((t - (t1 - 0.28)) / 0.3));
  const bx = BTN.x + BTN.w / 2;
  const by = BTN.y + BTN.h / 2;
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.08})`, filter: exit > 0.02 ? `blur(${exit * 12}px)` : "none" }}>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 24, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={words} fontSize={96} weight={800} accent={["estadia."]} underline="estadia." breakAfter={["já"]} lineHeight={1.02} />
      </div>
      {/* booking card */}
      {card > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 520,
            width: 860,
            borderRadius: 44,
            background: C.white,
            boxShadow: shadow.card,
            overflow: "hidden",
            transform: `perspective(1400px) translateY(${(1 - card) * 160}px) rotateX(${(1 - card) * 24}deg) scale(${mix(0.86, 1, card)})`,
            transformOrigin: "50% 100%",
            opacity: clamp01(card * 2),
          }}
        >
          <div style={{ height: 330, overflow: "hidden", position: "relative" }}>
            <Img src={staticFile("longstay/img/listing.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 - (t - t0) * 0.02})` }} />
            <div
              style={{
                position: "absolute",
                right: 22,
                top: 22,
                padding: "10px 20px",
                borderRadius: 999,
                background: C.blue,
                color: C.white,
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 30,
                boxShadow: "0 10px 20px -10px rgba(5,40,70,0.6)",
              }}
            >
              −30%
            </div>
          </div>
          <div style={{ padding: "26px 34px 120px", fontFamily: FONT.body }}>
            <div style={{ fontWeight: 600, fontSize: 38, color: C.ink }}>Estadia longa no Algarve</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 26, color: C.muted, marginTop: 6 }}>
              <IPin size={26} color={C.blue} stroke={2.4} /> Vilamoura · Faro · Olhão
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 999, background: C.blueSoft, color: C.blueDeep, fontWeight: 600, fontSize: 26 }}>
                <ICalendar size={28} color={C.blueDeep} stroke={2.4} /> 28+ noites
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 999, background: "#EEF3F8", color: C.inkSoft, fontWeight: 600, fontSize: 26 }}>
                Totalmente equipada
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {/* the offer's blue, folding into the button */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="ctaBtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#37B3F0" />
            <stop offset="1" stopColor={C.blue} />
          </linearGradient>
          <radialGradient id="ctaOffer" gradientUnits="userSpaceOnUse" cx={540} cy={760} r={1400}>
            <stop offset="0" stopColor="#3BB8F2" />
            <stop offset="0.45" stopColor={C.blue} />
            <stop offset="1" stopColor={C.blueDeep} />
          </radialGradient>
          <filter id="ctaShadow" x="-20%" y="-50%" width="140%" height="220%">
            <feDropShadow dx="0" dy={mix(0, 22 - press * 12, fold)} stdDeviation={mix(0, 22, fold)} floodColor="#1FA6EB" floodOpacity={0.55 * fold} />
          </filter>
        </defs>
        <g transform={`translate(${bx},${by}) scale(${1 - press * 0.05}) translate(${-bx},${-by})`}>
          <path d={d} fill="url(#ctaOffer)" filter="url(#ctaShadow)" opacity={1 - fold * fold} />
          <path d={d} fill="url(#ctaBtn)" opacity={fold * fold} />
        </g>
      </svg>
      {label > 0 ? (
        <div
          style={{
            position: "absolute",
            left: BTN.x,
            top: BTN.y,
            width: BTN.w,
            height: BTN.h,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            color: C.white,
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 42,
            opacity: label,
            transform: `translateY(${(1 - label) * 16}px) scale(${1 - press * 0.05})`,
          }}
        >
          Reservar estadia
          <span style={{ display: "flex", transform: `translateX(${press * 10}px)` }}>
            <IArrow size={40} color={C.white} stroke={2.8} />
          </span>
        </div>
      ) : null}
      {/* tap */}
      <div style={{ position: "absolute", left: bx + 150, top: by + 10 }}>
        <Ripple p={clamp01((t - tap) / 0.6)} size={220} color="#FFFFFF" />
      </div>
      {finger > 0 && fingerOut < 1 ? (
        <div
          style={{
            position: "absolute",
            left: bx + 150 - 36,
            top: by + 10 - 36,
            width: 72,
            height: 72,
            borderRadius: 999,
            background: "rgba(255,255,255,0.55)",
            border: "3px solid rgba(255,255,255,0.95)",
            boxShadow: "0 10px 26px -8px rgba(18,28,39,0.5)",
            transform: `translate(${(1 - finger) * 160}px, ${(1 - finger) * 220}px) scale(${1 - press * 0.25})`,
            opacity: (1 - fingerOut) * finger,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
