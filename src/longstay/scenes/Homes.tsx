import React from "react";
import { AbsoluteFill } from "remotion";
import { Clip } from "../components/Media";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { ICheck, IHome, ISofa, IWifi } from "../components/Icons";
import { Chip, shadow } from "../components/UI";
import { TL, wordTime, wordsAt } from "../data/timeline";

// "Totalmente equipadas" over the client's own rooms (cut on the beat), then local support 24/7.
const BEAT = TL.music.beat;
const CUTS = [38.88, 39.36, 39.84]; // beats of bar 20 after the typologies (38.4 + n·0.48)
const SHOTS = [
  { src: "longstay/v3/clips/c_living.mp4", rate: 0.7, from: 0 },
  { src: "longstay/v3/clips/c_kitchen.mp4", rate: 0.8, from: 0.6 },
  { src: "longstay/v3/clips/c_bed1.mp4", rate: 0.8, from: 0.3 },
  { src: "longstay/v3/clips/c_pool.mp4", rate: 0.8, from: 0.2 },
];
export const Homes: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const words = wordsAt("L10");
  const h1 = words.slice(0, 2); // Totalmente equipadas,
  const h2 = words.slice(2, 5); // com apoio local
  const h3 = words.slice(5); // 24 horas por dia.
  const com = wordTime("L10", "com").a;
  const inP = ease.out(clamp01((t - t0) / 0.45));
  const lt = t - t0;
  const dof = ease.inOut(clamp01((t - (com - 0.15)) / 0.5));
  const exit = ease.in(clamp01((t - (t1 - 0.3)) / 0.3));
  const sinceCut = Math.min(...CUTS.map((c) => (t >= c ? t - c : 9)), t - t0);
  const punch = Math.max(0, 1 - sinceCut / (BEAT * 0.6));
  const chips = [
    { label: "Mobilada", icon: <ISofa size={34} stroke={2.2} />, at: t0 + 0.1 },
    { label: "Cozinha equipada", icon: <IHome size={34} stroke={2.2} />, at: CUTS[0] + 0.04 },
    { label: "Wi‑Fi", icon: <IWifi size={34} stroke={2.2} />, at: CUTS[1] - 0.1 },
  ];
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.06})` }}>
      <AbsoluteFill style={{ transform: `scale(${mix(1.3, 1, inP)})`, filter: inP < 1 ? `blur(${(1 - inP) * 16}px)` : "none" }}>
        <div
          style={{
            position: "absolute",
            left: -40,
            top: 0,
            width: 1160,
            height: 2062,
            transform: `translateX(${-lt * 14}px) scale(${(1.02 + lt * 0.012) * (1 + punch * 0.05)})`,
            filter: dof > 0 ? `blur(${dof * 14}px) brightness(${1 - dof * 0.06})` : undefined,
          }}
        >
          {/* the client's own footage, cut on the beat: living room → kitchen → bedroom → pool */}
          {SHOTS.map((sh, i) => {
            const a = i === 0 ? t0 - 0.1 : CUTS[i - 1];
            const b = i < SHOTS.length - 1 ? CUTS[i] : t1 + 0.1;
            return <Clip key={sh.src} src={sh.src} at={a} dur={b - a} rate={sh.rate} startAt={sh.from} />;
          })}
        </div>
        {/* keep the ceiling bright enough for dark type */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(246,249,252,0.7) 0%, rgba(246,249,252,0) 30%)" }} />
        <AbsoluteFill style={{ background: `rgba(238,243,248,${dof * 0.35})` }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 24, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={h1} fontSize={96} weight={800} accent={["equipadas,"]} breakAfter={["Totalmente"]} exitAt={com - 0.12} exitDur={0.26} lineHeight={1.02} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 20, textAlign: "center" }}>
        <Kinetic t={t} words={h2} fontSize={64} weight={800} accent={["local"]} hideBefore={com - 0.2} exitAt={t1 - 0.25} />
        <div style={{ height: 6 }} />
        <Kinetic t={t} words={h3} fontSize={92} weight={800} accent={["24", "horas"]} hideBefore={com} exitAt={t1 - 0.25} lineHeight={1.0} />
      </div>
      {/* amenity chips */}
      <div style={{ position: "absolute", left: SAFE.left + 6, top: 860, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
        {chips.map((c, i) => {
          const a = clamp01((t - c.at) / 0.4);
          const chk = clamp01((t - (c.at + 0.3)) / 0.35);
          const o = ease.in(clamp01((t - (com - 0.05 + i * 0.05)) / 0.3));
          return (
            <div key={c.label} style={{ transform: `translateX(${-o * 200}px)`, opacity: 1 - o, filter: o > 0.02 ? `blur(${o * 10}px)` : "none" }}>
              <Chip label={c.label} icon={c.icon} appear={a} checked={chk} size={36} />
            </div>
          );
        })}
      </div>
      <SupportCard t={t} />
    </AbsoluteFill>
  );
};

const SupportCard: React.FC<{ t: number }> = ({ t }) => {
  const com = wordTime("L10", "com").a;
  const h24 = wordTime("L10", "24").a;
  const p = ease.back(clamp01((t - (com - 0.05)) / 0.55));
  if (p <= 0) return null;
  const msg1 = clamp01((t - (com + 0.3)) / 0.35);
  const typing = t > com + 0.65 && t < h24 + 0.3;
  const msg2 = ease.back(clamp01((t - (h24 + 0.3)) / 0.4));
  const ring = ease.inOut(clamp01((t - (h24 - 0.15)) / 0.9));
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 610,
        width: 800,
        transform: `translateY(${(1 - p) * 520}px) rotateX(${(1 - p) * 18}deg)`,
        transformOrigin: "50% 100%",
        opacity: clamp01(p * 2),
      }}
    >
      <div style={{ borderRadius: 40, background: "rgba(255,255,255,0.97)", boxShadow: shadow.card, padding: "30px 34px 34px", fontFamily: FONT.body }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 22, borderBottom: `2px solid ${C.line}` }}>
          <div style={{ width: 74, height: 74, borderRadius: 999, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 600, fontSize: 30 }}>HD</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 32, color: C.ink }}>HD Properties · Apoio local</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 24, color: C.muted }}>
              <span style={{ width: 12, height: 12, borderRadius: 99, background: "#34C759" }} /> online
            </div>
          </div>
        </div>
        {/* guest */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
          <div
            style={{
              maxWidth: 600,
              padding: "20px 26px",
              borderRadius: "28px 28px 8px 28px",
              background: C.blue,
              color: C.white,
              fontSize: 30,
              lineHeight: 1.3,
              transform: `translateY(${(1 - ease.out(msg1)) * 30}px) scale(${mix(0.9, 1, ease.back(msg1))})`,
              transformOrigin: "100% 100%",
              opacity: msg1,
            }}
          >
            Olá! Chegámos tarde. Como fazemos o check‑in?
            <div style={{ fontSize: 20, opacity: 0.8, textAlign: "right", marginTop: 6 }}>02:14</div>
          </div>
        </div>
        {/* reply */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 20, minHeight: 112 }}>
          {typing ? (
            <div style={{ padding: "22px 26px", borderRadius: "28px 28px 28px 8px", background: "#EEF3F8", display: "flex", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 14, height: 14, borderRadius: 99, background: C.muted, transform: `translateY(${Math.sin(t * 14 - i * 0.9) * 5}px)` }} />
              ))}
            </div>
          ) : msg2 > 0 ? (
            <div
              style={{
                maxWidth: 640,
                padding: "20px 26px",
                borderRadius: "28px 28px 28px 8px",
                background: "#EEF3F8",
                color: C.ink,
                fontSize: 30,
                lineHeight: 1.3,
                transform: `scale(${mix(0.85, 1, msg2)})`,
                transformOrigin: "0% 100%",
                opacity: clamp01(msg2 * 2),
              }}
            >
              Sem problema! Estamos disponíveis 24 horas. Já lhe enviámos tudo.
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, fontSize: 20, color: C.muted, marginTop: 6 }}>
                02:15 <ICheck size={20} color={C.blue} stroke={3} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* 24h dial */}
      {ring > 0 ? (
        <div
          style={{
            position: "absolute",
            right: -14,
            top: -86,
            width: 168,
            height: 168,
            borderRadius: 999,
            background: C.white,
            boxShadow: shadow.card,
            transform: `scale(${mix(0.4, 1, ease.back(clamp01(ring * 2.5)))})`,
          }}
        >
          <svg width={168} height={168} viewBox="0 0 168 168" style={{ position: "absolute", inset: 0 }}>
            <circle cx={84} cy={84} r={66} fill="none" stroke={C.blueSoft} strokeWidth={12} />
            <circle
              cx={84}
              cy={84}
              r={66}
              fill="none"
              stroke={C.blue}
              strokeWidth={12}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ring}
              transform="rotate(-90 84 84)"
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 52, color: C.ink, letterSpacing: "-0.03em" }}>
            {Math.round(ring * 24)}h
          </div>
        </div>
      ) : null}
    </div>
  );
};
