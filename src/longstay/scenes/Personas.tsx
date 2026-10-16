import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { ICalendar, ICap, IFlag, IPin, ISnow, ISun, IWifi } from "../components/Icons";
import { shadow } from "../components/UI";
import { ShapeSpec, bbox, lerpPts, shapePts, toPath } from "../components/Morph";
import { TL, vo, wordTime, wordsAt } from "../data/timeline";
import { Clip } from "../components/Media";

// Drop 1 → "Para quem…": one window that changes shape for each kind of guest, then folds
// into the first polaroid of the "memories" sequence. Steps are locked to the narration beats.

type Key = "cold" | "golf" | "work" | "home" | "study" | "polaroid";
const st = (id: string) => vo(id).start - 0.04;
const STEPS: { key: Key; at: number; dur: number; shape: ShapeSpec }[] = [
  { key: "cold", at: TL.music.drops[1], dur: 0.5, shape: { kind: "rect", cx: 540, cy: 745, w: 700, h: 640, r: 64 } },
  { key: "golf", at: st("L04"), dur: 0.42, shape: { kind: "circle", cx: 540, cy: 745, w: 660, h: 660 } },
  { key: "work", at: st("L05"), dur: 0.42, shape: { kind: "rect", cx: 540, cy: 720, w: 840, h: 520, r: 30 } },
  { key: "home", at: st("L06"), dur: 0.42, shape: { kind: "house", cx: 540, cy: 750, w: 700, h: 680 } },
  { key: "study", at: st("L07"), dur: 0.4, shape: { kind: "arch", cx: 540, cy: 748, w: 620, h: 680 } },
  { key: "polaroid", at: st("L08"), dur: 0.42, shape: { kind: "rect", cx: 540, cy: 958, w: 300, h: 316, r: 4 } },
];
export const PERSONA_END = STEPS[5].at + STEPS[5].dur;

const PTS = STEPS.map((s) => shapePts(s.shape));

const shapeNow = (t: number) => {
  for (let i = STEPS.length - 1; i >= 1; i--) {
    const s = STEPS[i];
    if (t >= s.at) {
      const p = ease.inOut(clamp01((t - s.at) / s.dur));
      return p >= 1 ? PTS[i] : lerpPts(PTS[i - 1], PTS[i], p);
    }
  }
  return PTS[0];
};

// visibility of a step's content (crossfade around the morph)
const vis = (t: number, i: number) => {
  const s = STEPS[i];
  const n = STEPS[i + 1];
  const a = i === 0 ? 1 : clamp01((t - (s.at + 0.08)) / 0.26);
  const b = n ? 1 - clamp01((t - n.at) / 0.26) : 1;
  return Math.min(a, b);
};

export const Personas: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0 }) => {
  const enter = ease.back(clamp01((t - t0) / 0.5));
  const pts = shapeNow(t);
  const d = toPath(pts);
  const bb = bbox(pts);
  const border = 1;
  const endFade = 1 - clamp01((t - (PERSONA_END + 0.02)) / 0.1);
  // gentle float of the whole window
  const fy = Math.sin(t * 1.6) * 6 * border;
  const s = mix(0.45, 1, enter);
  const winTransform = `translateY(${fy}px) scale(${s})`;
  const winOrigin = `${bb.x + bb.w / 2}px ${bb.y + bb.h / 2}px`;
  return (
    <AbsoluteFill>
      <Headline t={t} />
      {/* window shadow + plate */}
      <AbsoluteFill style={{ transform: winTransform, transformOrigin: winOrigin, opacity: clamp01(enter * 2) * endFade }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <filter id="winShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="34" stdDeviation="30" floodColor="#121C27" floodOpacity={0.28 * border} />
            </filter>
          </defs>
          <path d={d} fill="#fff" filter="url(#winShadow)" />
        </svg>
        <AbsoluteFill style={{ clipPath: `path('${d}')` }}>
          {vis(t, 0) > 0 ? <Cold t={t} o={vis(t, 0)} bb={bb} /> : null}
          {vis(t, 1) > 0 ? <Golf t={t} o={vis(t, 1)} bb={bb} /> : null}
          {vis(t, 2) > 0 ? <Work t={t} o={vis(t, 2)} bb={bb} /> : null}
          {vis(t, 3) > 0 ? <HomeV t={t} o={vis(t, 3)} bb={bb} /> : null}
          {vis(t, 4) > 0 ? <Study t={t} o={vis(t, 4)} bb={bb} /> : null}
          {t >= STEPS[5].at ? (
            <AbsoluteFill style={{ opacity: clamp01((t - (STEPS[5].at + 0.06)) / 0.22) }}>
              <Plate src="longstay/v3/tex/primula_terrace.jpg" bb={bb} />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={14 * border} strokeLinejoin="round" opacity={border} />
        </svg>
      </AbsoluteFill>
      {/* things that live in front of the window */}
      <ColdFront t={t} bb={bb} />
      <GolfFront t={t} bb={bb} />
      <WorkFront t={t} />
      <HomeFront t={t} />
      <StudyFront t={t} />
      <Phrases t={t} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ text */

const Headline: React.FC<{ t: number }> = ({ t }) => {
  const w = wordsAt("L03").slice(0, 2);
  const starts = ["L03", "L04", "L05", "L06", "L07"].map((id) => vo(id).start);
  let pulse = 0;
  for (const s of starts.slice(1)) {
    const x = (t - (s - 0.02)) / 0.32;
    if (x > 0 && x < 1) pulse = Math.max(pulse, Math.sin(x * Math.PI));
  }
  const out = STEPS[5].at - 0.05;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: SAFE.left,
        top: SAFE.top + 22,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${1 + pulse * 0.05})`,
      }}
    >
      <Kinetic t={t} words={w} fontSize={96} weight={800} exitAt={out} exitDur={0.3} lineHeight={1} />
    </div>
  );
};

const Phrases: React.FC<{ t: number }> = ({ t }) => {
  const lines = ["L03", "L04", "L05", "L06", "L07"];
  const acc: Record<string, string[]> = {
    L03: ["frio", "inverno."],
    L04: ["golfe"],
    L05: ["qualquer", "lado."],
    L06: ["entre", "casas."],
    L07: ["estudar."],
  };
  const brk: Record<string, string[]> = { L03: ["ao"], L04: ["golfe"], L05: ["de"], L06: [], L07: [] };
  return (
    <>
      {lines.map((id, i) => {
        const words = wordsAt(id).slice(2);
        const next = lines[i + 1] ? vo(lines[i + 1]).start - 0.12 : STEPS[5].at - 0.1;
        if (t < vo(id).start - 0.3 || t > next + 0.4) return null;
        return (
          <div key={id} style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: 1098, display: "flex", justifyContent: "center" }}>
            <Kinetic
              t={t}
              words={words}
              fontSize={68}
              weight={800}
              accent={acc[id]}
              breakAfter={brk[id]}
              exitAt={next}
              exitDur={0.28}
              lineHeight={1.08}
              mode="rise"
            />
          </div>
        );
      })}
    </>
  );
};

/* -------------------------------------------------------------- helpers */

type BB = { x: number; y: number; w: number; h: number };

// Real photo used as a soft, defocused plate behind crisp graphics.
const Plate: React.FC<{ src: string; bb: BB; blur?: number; zoom?: number; style?: React.CSSProperties; pos?: string }> = ({
  src,
  bb,
  blur = 0,
  zoom = 1,
  style,
  pos = "50% 50%",
}) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      left: bb.x - 40,
      top: bb.y - 40,
      width: bb.w + 80,
      height: bb.h + 80,
      objectFit: "cover",
      objectPosition: pos,
      transform: `scale(${zoom})`,
      filter: blur > 0 ? `blur(${blur}px) saturate(1.08)` : undefined,
      ...style,
    }}
  />
);

// Postcard: a sharp real photo of the place with its name.
const Postcard: React.FC<{ t: number; at: number; out: number; src: string; label: string; x: number; y: number; rot: number; w?: number }> = ({
  t,
  at,
  out,
  src,
  label,
  x,
  y,
  rot,
  w = 270,
}) => {
  const p = ease.back(clamp01((t - at) / 0.45));
  const q = ease.in(clamp01((t - out) / 0.3));
  if (p <= 0 || q >= 1) return null;
  const h = Math.round(w * 0.6);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w + 20,
        padding: 10,
        paddingBottom: 14,
        background: C.white,
        borderRadius: 22,
        boxShadow: shadow.card,
        transform: `perspective(900px) translateY(${(1 - p) * 70 - q * 60}px) rotate(${rot + (1 - p) * 10}deg) rotateX(${(1 - p) * 30}deg) scale(${mix(0.7, 1, p) * mix(1, 0.85, q)})`,
        opacity: clamp01(p * 2) * (1 - q),
        filter: q > 0.02 ? `blur(${q * 10}px)` : "none",
      }}
    >
      <div style={{ width: w, height: h, borderRadius: 14, overflow: "hidden" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + (t - at) * 0.02})` }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, marginLeft: 4, fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: C.ink }}>
        <IPin size={24} color={C.blue} stroke={2.4} />
        {label}
      </div>
    </div>
  );
};

const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; p: number }> = ({ children, style, p }) => {
  const e = ease.back(clamp01(p));
  if (e <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 24px 14px 18px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.94)",
        boxShadow: shadow.chip,
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 28,
        color: C.ink,
        transform: `scale(${mix(0.5, 1, e)})`,
        opacity: clamp01(p * 3),
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------ 1. cold */

const Cold: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const foge = wordTime("L03", "fugir").a;
  const warm = ease.inOut(clamp01((t - (foge + 0.05)) / 0.85));
  const R = mix(-160, 900, warm);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* winter: real footage, cooled down */}
      <div style={{ position: "absolute", left: bb.x - 40, top: bb.y - 40, width: bb.w + 80, height: bb.h + 80, filter: "saturate(0.75) brightness(1.04)" }}>
        <Clip src="longstay/v3/clips/s_cold.mp4" at={STEPS[0].at - 0.35} dur={3.9} />
      </div>
      <div style={{ position: "absolute", left: bb.x, top: bb.y, width: bb.w, height: bb.h, background: "rgba(120,160,200,0.16)", mixBlendMode: "multiply", opacity: 1 - warm }} />
      {/* frost around the edges */}
      <div
        style={{
          position: "absolute",
          left: bb.x,
          top: bb.y,
          width: bb.w,
          height: bb.h,
          background: "radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.6) 100%)",
          opacity: 1 - warm,
        }}
      />
      {/* the warm side: Quarteira, defocused, with sun */}
      {warm > 0 ? <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: `radial-gradient(circle at ${bb.x + bb.w * 0.5}px ${bb.y + bb.h * 0.55}px, #000 ${R}px, transparent ${R + 120}px)`,
          maskImage: `radial-gradient(circle at ${bb.x + bb.w * 0.5}px ${bb.y + bb.h * 0.55}px, #000 ${R}px, transparent ${R + 120}px)`,
        }}
      >
        <Plate src="longstay/v3/tex/quarteira_beach_view.jpg" bb={bb} blur={2} zoom={mix(1.18, 1.08, warm)} />
        <div
          style={{
            position: "absolute",
            left: bb.x,
            top: bb.y,
            width: bb.w,
            height: bb.h,
            background: `radial-gradient(420px 420px at ${bb.x + bb.w * 0.78}px ${bb.y + bb.h * 0.2}px, rgba(255,214,140,0.85), rgba(255,190,110,0) 70%)`,
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: bb.x + bb.w * 0.78 - 60,
            top: bb.y + bb.h * 0.2 - 60,
            width: 120,
            height: 120,
            borderRadius: 999,
            background: "radial-gradient(circle, #FFF6DD 0%, #FFD27A 55%, rgba(255,200,110,0) 72%)",
            transform: `scale(${mix(0.4, 1, warm)})`,
          }}
        />
      </div> : null}
    </AbsoluteFill>
  );
};

const ColdFront: React.FC<{ t: number; bb: BB }> = ({ t }) => {
  if (t < STEPS[0].at - 0.08 || t > STEPS[1].at + 0.5) return null;
  const foge = wordTime("L03", "fugir").a;
  const inv = wordTime("L03", "inverno.").a;
  const appear = clamp01((t - (STEPS[0].at + 0.27)) / 0.4);
  const out = ease.in(clamp01((t - STEPS[1].at) / 0.3));
  const flip = ease.inOut(clamp01((t - (foge + 0.35)) / 0.6));
  const temp = Math.round(mix(2, 17, flip));
  const warm = flip > 0.5;
  return (
    <>
      <Pill p={appear} style={{ left: 214, top: 452, opacity: (1 - out) * clamp01(appear * 3), filter: out > 0 ? `blur(${out * 8}px)` : "none" }}>
        <span style={{ display: "flex", color: warm ? C.sun : "#7FA3C4" }}>{warm ? <ISun size={46} stroke={2.4} /> : <ISnow size={46} stroke={2.4} />}</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 48, minWidth: 84 }}>{temp}°</span>
      </Pill>
      <Postcard t={t} at={inv - 0.05} out={STEPS[1].at - 0.05} src="longstay/v3/tex/maresia_balcony.jpg" label="Quarteira" x={636} y={850} rot={5} w={250} />
    </>
  );
};

/* ------------------------------------------------------------ 2. golf */

const Golf: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[1].at;
  const golfe = wordTime("L04", "golfe").a;
  // the swing's impact (1.7 s into the clip) lands on "golfe"
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${mix(1.12, 1, ease.out(clamp01(lt / 0.6)))})`, transformOrigin: "540px 745px" }}>
      <div style={{ position: "absolute", left: bb.x - 40, top: bb.y - 40, width: bb.w + 80, height: bb.h + 80 }}>
        <Clip src="longstay/v3/clips/s_golf.mp4" at={golfe + 0.05 - 1.7} dur={3.95} />
        {/* first, the client's own drone shot over the course */}
        <Clip src="longstay/v3/clips/c_golf_drone2.mp4" at={STEPS[1].at - 0.3} dur={golfe - 0.3 - (STEPS[1].at - 0.3)} startAt={0.4} />
      </div>
    </AbsoluteFill>
  );
};

const GolfFront: React.FC<{ t: number; bb: BB }> = ({ t }) => {
  if (t < STEPS[1].at || t > STEPS[2].at + 0.4) return null;
  const golfe = wordTime("L04", "golfe").a;
  const ano = wordTime("L04", "ano").a;
  const out = ease.in(clamp01((t - STEPS[2].at) / 0.3));
  const fade = 1 - out;
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const mp = clamp01((t - (ano - 0.15)) / 0.85);
  const stripIn = clamp01((t - (ano - 0.45)) / 0.35);
  return (
    <AbsoluteFill style={{ opacity: fade, filter: out > 0.02 ? `blur(${out * 10}px)` : "none" }}>
      {/* twelve months, all of them good */}
      {stripIn > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1028,
            transform: `translateX(-50%) scale(${mix(0.6, 1, ease.back(stripIn))})`,
            opacity: clamp01(stripIn * 3),
            display: "flex",
            gap: 8,
            padding: "12px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.96)",
            boxShadow: shadow.chip,
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          {months.map((m, i) => {
            const on = clamp01(mp * 12 - i);
            return (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: on > 0.5 ? C.blue : "#EEF4F9",
                  color: on > 0.5 ? C.white : C.muted,
                  transform: `scale(${1 + Math.sin(on * Math.PI) * 0.25})`,
                }}
              >
                {m}
              </div>
            );
          })}
        </div>
      ) : null}
      <FieldCard t={t} at={golfe - 0.05} out={STEPS[2].at - 0.05} x={64} y={404} label="Campo de golfe" value="Vilamoura" />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ 3. work */

const Work: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[2].at;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* someone working from a bright room, real footage */}
      <div style={{ position: "absolute", left: bb.x - 40, top: bb.y - 40, width: bb.w + 80, height: bb.h + 80, transform: `scale(${1.04 + lt * 0.015})` }}>
        <Clip src="longstay/v3/clips/s_work.mp4" at={STEPS[2].at - 0.3} dur={3.95} />
      </div>
      {/* window chrome */}
      <div style={{ position: "absolute", left: bb.x + 26, top: bb.y + 22, display: "flex", gap: 10 }}>
        {["#FF6B6B", "#FFD166", "#06D6A0"].map((c) => (
          <span key={c} style={{ width: 16, height: 16, borderRadius: 99, background: c, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: bb.x,
          top: bb.y,
          width: bb.w,
          height: bb.h,
          background: "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%)",
        }}
      />
    </AbsoluteFill>
  );
};

const WorkFront: React.FC<{ t: number }> = ({ t }) => {
  const at = STEPS[2].at;
  if (t < at || t > STEPS[3].at + 0.4) return null;
  const out = ease.in(clamp01((t - STEPS[3].at) / 0.3));
  const base = ease.out(clamp01((t - (at + 0.2)) / 0.45));
  const trab = wordTime("L05", "trabalha").a;
  const qual = wordTime("L05", "qualquer").a;
  const wifi = clamp01((t - (trab - 0.1)) / 0.35);
  const bars = clamp01((t - trab) / 0.6);
  const note = clamp01((t - (qual - 0.1)) / 0.4);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : "none" }}>
      {/* laptop deck */}
      <div
        style={{
          position: "absolute",
          left: 540 - 480,
          top: 980,
          width: 960,
          height: 36,
          transformOrigin: "50% 0%",
          transform: `perspective(600px) rotateX(${mix(70, 38, base)}deg) scaleY(${base})`,
          opacity: base,
          background: "linear-gradient(180deg, #F3F6F9 0%, #CED8E2 100%)",
          borderRadius: "6px 6px 26px 26px",
          boxShadow: "0 26px 40px -18px rgba(18,28,39,0.45)",
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: 0, width: 150, height: 10, marginLeft: -75, background: "#B8C4D0", borderRadius: "0 0 10px 10px" }} />
      </div>
      <Pill p={wifi} style={{ left: 150, top: 880 }}>
        <IWifi size={32} color={C.blue} stroke={2.4} />
        <span>Wi‑Fi</span>
        <span style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 24, marginLeft: 4 }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ width: 7, height: 8 + i * 5, borderRadius: 3, background: bars * 4 > i ? C.blue : "#D7E3EE" }} />
          ))}
        </span>
      </Pill>
      {note > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 600,
            top: 478,
            width: 300,
            padding: "16px 18px",
            borderRadius: 22,
            background: "rgba(255,255,255,0.95)",
            boxShadow: shadow.card,
            display: "flex",
            gap: 14,
            alignItems: "center",
            transform: `translateX(${(1 - ease.out(note)) * 80}px)`,
            opacity: clamp01(note * 2),
          }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ICalendar size={30} color={C.blue} stroke={2.4} />
          </div>
          <div style={{ fontFamily: FONT.body }}>
            <div style={{ fontWeight: 600, fontSize: 24, color: C.ink }}>Reunião</div>
            <div style={{ fontWeight: 500, fontSize: 20, color: C.muted }}>10:00 · online</div>
          </div>
        </div>
      ) : null}
      <Postcard t={t} at={qual + 0.1} out={STEPS[3].at - 0.05} src="longstay/v3/tex/studio_alcharb_desk.jpg" label="Vilamoura" x={96} y={404} rot={-5} w={230} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ 4. home */

const HomeV: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[3].at;
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${mix(1.12, 1, ease.out(clamp01(lt / 0.6)))})`, transformOrigin: "540px 750px" }}>
      <div style={{ position: "absolute", left: bb.x - 40, top: bb.y - 40, width: bb.w + 80, height: bb.h + 80, transform: `scale(${1.02 + lt * 0.02})` }}>
        <Clip src="longstay/v3/clips/s_pack.mp4" at={STEPS[3].at - 0.25} dur={3.95} />
      </div>
    </AbsoluteFill>
  );
};

const HomeFront: React.FC<{ t: number }> = ({ t }) => {
  const at = STEPS[3].at;
  if (t < at || t > STEPS[4].at + 0.4) return null;
  const out = ease.in(clamp01((t - STEPS[4].at) / 0.3));
  const casas = wordTime("L06", "casas.").a;
  const key = clamp01((t - (casas - 0.2)) / 1.2);
  const swing = Math.sin(key * 9) * 26 * (1 - key) * 1 + 0;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : "none" }}>
      {/* house key with an HD tag, swinging in */}
      {key > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 740,
            top: 470,
            transformOrigin: "50% 0%",
            transform: `translateY(${(1 - ease.out(clamp01(key * 3))) * -260}px) rotate(${swing}deg)`,
          }}
        >
          <svg width={150} height={300} viewBox="0 0 150 300" style={{ overflow: "visible", filter: "drop-shadow(0 16px 18px rgba(18,28,39,0.35))" }}>
            <line x1={75} y1={-60} x2={75} y2={40} stroke="#C9D3DD" strokeWidth={3} />
            <circle cx={75} cy={58} r={20} fill="none" stroke="#D9DEE4" strokeWidth={6} />
            {/* tag */}
            <rect x={28} y={78} width={94} height={120} rx={22} fill={C.white} />
            <circle cx={75} cy={96} r={7} fill="#E3E9EF" />
            <text x={75} y={160} textAnchor="middle" fontFamily={FONT.body} fontWeight={600} fontSize={40} fill={C.blue}>
              HD
            </text>
            {/* key */}
            <g transform="translate(75,58) rotate(28)">
              <rect x={-9} y={18} width={18} height={150} rx={6} fill="#E5B85C" />
              <rect x={-9} y={130} width={34} height={12} rx={4} fill="#E5B85C" />
              <rect x={-9} y={150} width={26} height={12} rx={4} fill="#E5B85C" />
            </g>
          </svg>
        </div>
      ) : null}
      <Postcard t={t} at={casas - 0.1} out={STEPS[4].at - 0.05} src="longstay/v3/tex/olhao_terrace.jpg" label="Olhão" x={680} y={860} rot={5} w={230} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ 5. study */

const Study: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[4].at;
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${mix(1.12, 1, ease.out(clamp01(lt / 0.6)))})`, transformOrigin: "540px 748px" }}>
      <div style={{ position: "absolute", left: bb.x - 40, top: bb.y - 40, width: bb.w + 80, height: bb.h + 80, transform: `scale(${1.02 + lt * 0.03})` }}>
        <Clip src="longstay/v3/clips/s_students.mp4" at={STEPS[4].at - 0.25} dur={3.95} />
      </div>
    </AbsoluteFill>
  );
};

const StudyFront: React.FC<{ t: number }> = ({ t }) => {
  const at = STEPS[4].at;
  if (t < at || t > STEPS[5].at + 0.4) return null;
  const out = ease.in(clamp01((t - STEPS[5].at) / 0.3));
  const est = wordTime("L07", "estudar.").a;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : "none" }}>
      <Postcard t={t} at={est - 0.05} out={STEPS[5].at - 0.05} src="longstay/v3/tex/faro_traditional.jpg" label="Faro" x={700} y={440} rot={6} w={220} />
      <UniChip t={t} at={est + 0.05} out={STEPS[5].at - 0.05} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ extras */

// Form-style field ("Campo de golfe: Vilamoura") that types itself in.
const FieldCard: React.FC<{ t: number; at: number; out: number; x: number; y: number; label: string; value: string }> = ({ t, at, out, x, y, label, value }) => {
  const p = ease.back(clamp01((t - at) / 0.4));
  const q = ease.in(clamp01((t - out) / 0.3));
  if (p <= 0 || q >= 1) return null;
  const typed = Math.floor(clamp01((t - at - 0.12) / 0.42) * value.length);
  const caret = Math.floor((t - at) * 3) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 470,
        padding: "20px 28px 22px",
        borderRadius: 26,
        background: "rgba(255,255,255,0.97)",
        boxShadow: shadow.card,
        border: `2px solid ${C.blue}`,
        transform: `translateY(${(1 - p) * 50 - q * 40}px) scale(${mix(0.7, 1, p)}) rotate(${-3 * (1 - p)}deg)`,
        opacity: clamp01(p * 2) * (1 - q),
        filter: q > 0.02 ? `blur(${q * 10}px)` : "none",
        fontFamily: FONT.body,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 24, letterSpacing: "0.12em", color: C.blueText, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
        <IPin size={38} color={C.blue} stroke={2.4} />
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 58, color: C.ink, letterSpacing: "-0.02em" }}>
          {value.slice(0, Math.max(1, typed))}
          <span style={{ opacity: caret && typed < value.length + 1 ? 1 : 0, color: C.blue, fontWeight: 400 }}>|</span>
        </span>
        <span style={{ marginLeft: "auto", display: "flex", color: C.blue }}>
          <IFlag size={40} stroke={2.2} />
        </span>
      </div>
    </div>
  );
};

const UniChip: React.FC<{ t: number; at: number; out: number }> = ({ t, at, out }) => {
  const p = ease.back(clamp01((t - at) / 0.4));
  const q = ease.in(clamp01((t - out) / 0.3));
  if (p <= 0 || q >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 64, top: 436, display: "flex", opacity: clamp01(p * 2) * (1 - q) }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 26px 14px 18px",
          borderRadius: 999,
          background: C.white,
          boxShadow: shadow.chip,
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 28,
          color: C.ink,
          transform: `scale(${mix(0.5, 1, p)}) rotate(-3deg)`,
          transformOrigin: "0% 50%",
        }}
      >
        <ICap size={34} color={C.blue} stroke={2.2} /> Universidade do Algarve
      </div>
    </div>
  );
};
