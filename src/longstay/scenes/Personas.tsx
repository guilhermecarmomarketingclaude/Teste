import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { IBox, ICalendar, ICap, IFlag, ILaptop, IPin, ISnow, ISun, IWifi } from "../components/Icons";
import { shadow } from "../components/UI";
import { ShapeSpec, bbox, lerpPts, shapePts, toPath } from "../components/Morph";
import { vo, wordTime, wordsAt } from "../data/timeline";

// 7.68–21.12 s: "Para quem…" — one window that changes shape for each kind of guest,
// then opens onto the villa for "quer ficar mais tempo".

type Key = "cold" | "golf" | "work" | "home" | "study" | "stay" | "full";
const STEPS: { key: Key; at: number; dur: number; shape: ShapeSpec }[] = [
  { key: "cold", at: 7.68, dur: 0.5, shape: { kind: "rect", cx: 540, cy: 745, w: 700, h: 640, r: 64 } },
  { key: "golf", at: 9.7, dur: 0.5, shape: { kind: "circle", cx: 540, cy: 745, w: 660, h: 660 } },
  { key: "work", at: 11.95, dur: 0.5, shape: { kind: "rect", cx: 540, cy: 720, w: 840, h: 520, r: 30 } },
  { key: "home", at: 13.96, dur: 0.5, shape: { kind: "house", cx: 540, cy: 750, w: 700, h: 680 } },
  { key: "study", at: 15.86, dur: 0.45, shape: { kind: "arch", cx: 540, cy: 748, w: 620, h: 680 } },
  { key: "stay", at: 17.3, dur: 0.55, shape: { kind: "rect", cx: 540, cy: 812, w: 860, h: 800, r: 56 } },
  { key: "full", at: 19.18, dur: 0.75, shape: { kind: "rect", cx: 540, cy: 960, w: 1180, h: 2060, r: 0 } },
];

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
  const full = clamp01((t - STEPS[6].at) / STEPS[6].dur);
  const border = 1 - ease.inOut(full);
  // gentle float of the whole window
  const fy = Math.sin(t * 1.6) * 6 * border;
  const s = mix(0.45, 1, enter);
  const winTransform = `translateY(${fy}px) scale(${s})`;
  const winOrigin = `${bb.x + bb.w / 2}px ${bb.y + bb.h / 2}px`;
  return (
    <AbsoluteFill>
      <Headline t={t} />
      {/* window shadow + plate */}
      <AbsoluteFill style={{ transform: winTransform, transformOrigin: winOrigin, opacity: clamp01(enter * 2) }}>
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
          {t >= STEPS[5].at ? <Villa t={t} o={clamp01((t - (STEPS[5].at + 0.06)) / 0.3)} /> : null}
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
      <StayFront t={t} />
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

const FLAKES = Array.from({ length: 90 }).map((_, i) => ({
  x: random(`fx${i}`) * 900 - 100,
  y: random(`fy${i}`) * 900,
  s: 3 + random(`fs${i}`) * 9,
  v: 90 + random(`fv${i}`) * 170,
  ph: random(`fp${i}`) * 6.28,
}));

const Cold: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const foge = wordTime("L03", "foge").a;
  const warm = ease.inOut(clamp01((t - (foge + 0.05)) / 0.85));
  const R = mix(-160, 900, warm);
  const lt = t - 7.4;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* winter */}
      <div
        style={{
          position: "absolute",
          left: bb.x - 40,
          top: bb.y - 40,
          width: bb.w + 80,
          height: bb.h + 80,
          background: "linear-gradient(180deg, #7F93A8 0%, #A9B9C9 55%, #DCE4EC 100%)",
        }}
      />
      {/* distant snowy hills */}
      <svg style={{ position: "absolute", left: bb.x - 40, top: bb.y + bb.h * 0.55, width: bb.w + 80, height: bb.h * 0.5 }} viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M0,22 C18,10 30,18 46,12 C62,6 78,16 100,10 L100,50 L0,50 Z" fill="#E9EFF5" />
        <path d="M0,32 C20,24 40,30 60,24 C76,19 88,26 100,22 L100,50 L0,50 Z" fill="#F7FAFC" />
      </svg>
      {FLAKES.map((f, i) => {
        const y = ((f.y + lt * f.v) % 900) - 60;
        const x = f.x + Math.sin(lt * 1.3 + f.ph) * 18 + lt * 20;
        const near = f.s > 9;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bb.x + (x % (bb.w + 60)) - 30,
              top: bb.y + y,
              width: f.s,
              height: f.s,
              borderRadius: 99,
              background: "#fff",
              opacity: 0.9 * (1 - warm),
              filter: near ? "blur(2px)" : f.s < 5 ? "blur(0.6px)" : "none",
            }}
          />
        );
      })}
      {/* frost around the edges */}
      <div
        style={{
          position: "absolute",
          left: bb.x,
          top: bb.y,
          width: bb.w,
          height: bb.h,
          background: "radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.75) 100%)",
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
        <Plate src="longstay/img/loc_quarteira.jpg" bb={bb} blur={7} zoom={mix(1.18, 1.08, warm)} />
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
  if (t < 7.6 || t > STEPS[1].at + 0.5) return null;
  const foge = wordTime("L03", "foge").a;
  const inv = wordTime("L03", "inverno.").a;
  const appear = clamp01((t - 7.95) / 0.4);
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
      <Postcard t={t} at={inv - 0.05} out={STEPS[1].at - 0.05} src="longstay/img/loc_quarteira.jpg" label="Quarteira" x={636} y={850} rot={5} w={250} />
    </>
  );
};

/* ------------------------------------------------------------ 2. golf */

const Golf: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[1].at;
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${mix(1.12, 1, ease.out(clamp01(lt / 0.6)))})`, transformOrigin: "540px 745px" }}>
      <Plate src="longstay/img/loc_valedolobo.jpg" bb={bb} blur={6} zoom={1.1 + lt * 0.03} pos="40% 60%" />
      {/* putting green */}
      <div
        style={{
          position: "absolute",
          left: 540 - 300,
          top: 745 - 40,
          width: 600,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(60% 60% at 50% 45%, #9BD38A 0%, #6DB466 60%, rgba(80,160,80,0) 100%)",
          opacity: 0.92,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 300,
          top: 745 - 40,
          width: 600,
          height: 300,
          borderRadius: "50%",
          background: "repeating-linear-gradient(100deg, rgba(255,255,255,0.08) 0 38px, rgba(255,255,255,0) 38px 76px)",
          WebkitMaskImage: "radial-gradient(closest-side, #000 70%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const GolfFront: React.FC<{ t: number; bb: BB }> = ({ t }) => {
  if (t < STEPS[1].at || t > STEPS[2].at + 0.4) return null;
  const golfe = wordTime("L04", "golfe").a;
  const ano = wordTime("L04", "ano").a;
  const out = ease.in(clamp01((t - STEPS[2].at) / 0.3));
  const fade = 1 - out;
  // hole and flag
  const hx = 640;
  const hy = 850;
  const flagIn = ease.back(clamp01((t - (STEPS[1].at + 0.25)) / 0.45));
  // ball flight
  const t0 = golfe - 0.55;
  const fl = clamp01((t - t0) / 0.75);
  const sx = 300;
  const sy = 1000;
  const bx = mix(sx, hx - 50, fl);
  const by = mix(sy, hy + 6, fl) - Math.sin(fl * Math.PI) * 330;
  const roll = clamp01((t - (t0 + 0.75)) / 0.35);
  const ballX = fl < 1 ? bx : mix(hx - 50, hx, ease.out(roll));
  const ballY = fl < 1 ? by : hy + 6 - Math.sin(roll * Math.PI) * 6;
  const inHole = roll >= 1;
  const sink = clamp01((t - (t0 + 1.1)) / 0.15);
  const ballS = fl < 1 ? mix(1.25, 0.8, fl) : 0.8;
  const trail = Array.from({ length: 22 }).map((_, i) => {
    const f = (i / 21) * fl;
    return [mix(sx, hx - 50, f), mix(sy, hy + 6, f) - Math.sin(f * Math.PI) * 330];
  });
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const mp = clamp01((t - (ano - 0.15)) / 0.85);
  const stripIn = clamp01((t - (ano - 0.45)) / 0.35);
  return (
    <AbsoluteFill style={{ opacity: fade, filter: out > 0.02 ? `blur(${out * 10}px)` : "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* hole */}
        <ellipse cx={hx} cy={hy + 14} rx={24 * flagIn} ry={9 * flagIn} fill="#1C3320" opacity={0.85} />
        {/* dotted trajectory */}
        {fl > 0 ? (
          <polyline
            points={trail.map((q) => q.join(",")).join(" ")}
            fill="none"
            stroke="#fff"
            strokeWidth={5}
            strokeDasharray="2 16"
            strokeLinecap="round"
            opacity={0.95 * (1 - clamp01((t - (t0 + 1.2)) / 0.4))}
          />
        ) : null}
        {/* flag */}
        <g transform={`translate(${hx},${hy + 12}) scale(1,${flagIn})`}>
          <line x1={0} y1={0} x2={0} y2={-230} stroke="#F7F7F7" strokeWidth={6} strokeLinecap="round" />
          <path
            d={`M3,-228 Q${46 + Math.sin(t * 7) * 6},${-214 + Math.sin(t * 5) * 3} ${92 + Math.sin(t * 6) * 5},-200 Q${48 + Math.sin(t * 7 + 1) * 5},${-186 + Math.sin(t * 5) * 3} 3,-172 Z`}
            fill={C.blue}
          />
        </g>
      </svg>
      {/* ball */}
      {fl > 0 && sink < 1 ? (
        <div
          style={{
            position: "absolute",
            left: ballX - 22,
            top: ballY - 22,
            width: 44,
            height: 44,
            borderRadius: 99,
            background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F1F3F5 45%, #C9CFD6 100%)",
            boxShadow: "0 10px 16px -6px rgba(0,0,0,0.45)",
            transform: `scale(${ballS * (1 - sink)})`,
          }}
        />
      ) : null}
      {inHole ? (
        <div
          style={{
            position: "absolute",
            left: hx - 70,
            top: hy + 14 - 70,
            width: 140,
            height: 140,
            borderRadius: 999,
            border: `4px solid rgba(255,255,255,${1 - clamp01((t - (t0 + 1.1)) / 0.5)})`,
            transform: `scaleY(0.4) scale(${mix(0.2, 1.4, ease.out(clamp01((t - (t0 + 1.1)) / 0.5)))})`,
          }}
        />
      ) : null}
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
      <Postcard t={t} at={golfe + 0.05} out={STEPS[2].at - 0.05} src="longstay/img/loc_valedolobo.jpg" label="Vale do Lobo" x={70} y={418} rot={-6} w={250} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ 3. work */

const Work: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[2].at;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img
        src={staticFile("longstay/img/listing.jpg")}
        style={{
          position: "absolute",
          left: 540 - 520,
          top: 720 - 290,
          width: 1040,
          height: 580,
          objectFit: "cover",
          transform: `scale(${1.1 - lt * 0.025}) translateX(${lt * -8}px)`,
        }}
      />
      {/* screen glass sheen */}
      <div
        style={{
          position: "absolute",
          left: bb.x,
          top: bb.y,
          width: bb.w,
          height: bb.h,
          background: "linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 35%)",
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
      <Postcard t={t} at={qual + 0.2} out={STEPS[3].at - 0.05} src="longstay/img/loc_vilamoura.jpg" label="Vilamoura" x={64} y={404} rot={-5} w={230} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ 4. home */

const HomeV: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[3].at;
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${mix(1.12, 1, ease.out(clamp01(lt / 0.6)))})`, transformOrigin: "540px 750px" }}>
      <Plate src="longstay/img/loc_faro.jpg" bb={bb} blur={5} zoom={1.08 + lt * 0.03} pos="50% 40%" />
      <div style={{ position: "absolute", left: bb.x, top: bb.y, width: bb.w, height: bb.h, background: "linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};

const Cube: React.FC<{ w: number; h: number; d: number; tape?: boolean; label?: boolean }> = ({ w, h, d, tape = true, label }) => (
  <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d" }}>
    {/* front */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#DDB88E,#C99D6E)", borderRadius: 6, transform: `translateZ(${d / 2}px)` }}>
      {tape ? <div style={{ position: "absolute", left: "44%", width: "12%", top: 0, height: "38%", background: "rgba(245,228,200,0.85)" }} /> : null}
      {label ? (
        <div style={{ position: "absolute", left: "12%", bottom: "16%", width: "40%", height: "22%", background: "rgba(255,255,255,0.85)", borderRadius: 4 }} />
      ) : null}
    </div>
    {/* top */}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: d,
        background: "linear-gradient(180deg,#EED2AE,#E3C29A)",
        transformOrigin: "50% 0%",
        transform: `translateZ(${d / 2}px) rotateX(90deg)`,
        borderRadius: 6,
      }}
    >
      {tape ? <div style={{ position: "absolute", left: "44%", width: "12%", top: 0, height: "100%", background: "rgba(245,228,200,0.9)" }} /> : null}
    </div>
    {/* side */}
    <div
      style={{
        position: "absolute",
        left: w,
        top: 0,
        width: d,
        height: h,
        background: "linear-gradient(180deg,#C4966A,#AD8156)",
        transformOrigin: "0% 50%",
        transform: `translateZ(${d / 2}px) rotateY(90deg)`,
        borderRadius: 6,
      }}
    />
  </div>
);

const HomeFront: React.FC<{ t: number }> = ({ t }) => {
  const at = STEPS[3].at;
  if (t < at || t > STEPS[4].at + 0.4) return null;
  const out = ease.in(clamp01((t - STEPS[4].at) / 0.3));
  const entre = wordTime("L06", "entre").a;
  const casas = wordTime("L06", "casas.").a;
  const drops = [
    { at: at + 0.35, x: 170, y: 1004, w: 190, h: 140, d: 120, r: -4, label: true },
    { at: at + 0.6, x: 330, y: 1018, w: 160, h: 120, d: 110, r: 3 },
    { at: entre - 0.05, x: 215, y: 874, w: 150, h: 120, d: 100, r: 6 },
  ];
  const key = clamp01((t - (casas - 0.2)) / 1.2);
  const swing = Math.sin(key * 9) * 26 * (1 - key) * 1 + 0;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : "none" }}>
      {drops.map((b, i) => {
        const p = clamp01((t - b.at) / 0.42);
        if (p <= 0) return null;
        // fall + small bounce
        const fall = p < 0.7 ? ease.in(p / 0.7) : 1;
        const bounce = p >= 0.7 ? Math.sin(((p - 0.7) / 0.3) * Math.PI) * 0.06 : 0;
        const y = mix(-900, 0, fall) - bounce * 200;
        const sq = p >= 0.7 ? 1 - Math.sin(((p - 0.7) / 0.3) * Math.PI) * 0.06 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y - b.h,
              perspective: 900,
              transform: `translateY(${y}px) rotate(${b.r * (1 - fall * 0.4)}deg) scaleY(${sq})`,
              transformOrigin: "50% 100%",
            }}
          >
            <div style={{ transformStyle: "preserve-3d", transform: "rotateX(-18deg) rotateY(-24deg)" }}>
              <Cube w={b.w} h={b.h} d={b.d} label={b.label} />
            </div>
          </div>
        );
      })}
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
      <Postcard t={t} at={casas - 0.1} out={STEPS[4].at - 0.05} src="longstay/img/loc_faro.jpg" label="Faro" x={680} y={860} rot={5} w={230} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ 5. study */

const Study: React.FC<{ t: number; o: number; bb: BB }> = ({ t, o, bb }) => {
  const lt = t - STEPS[4].at;
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${mix(1.12, 1, ease.out(clamp01(lt / 0.6)))})`, transformOrigin: "540px 748px" }}>
      <Plate src="longstay/img/loc_olhao.jpg" bb={bb} blur={5} zoom={1.08 + lt * 0.04} />
    </AbsoluteFill>
  );
};

const StudyFront: React.FC<{ t: number }> = ({ t }) => {
  const at = STEPS[4].at;
  if (t < at || t > STEPS[5].at + 0.4) return null;
  const out = ease.in(clamp01((t - STEPS[5].at) / 0.3));
  const est = wordTime("L07", "estudar.").a;
  const toss = clamp01((t - (est - 0.2)) / 0.9);
  const y = -Math.sin(toss * Math.PI) * 300;
  const books = ease.back(clamp01((t - (at + 0.2)) / 0.45));
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : "none" }}>
      {/* books */}
      <div style={{ position: "absolute", left: 300, top: 960, transform: `translateY(${(1 - books) * 120}px)`, opacity: clamp01(books * 2) }}>
        {[
          { w: 300, c: C.blue, dx: 0 },
          { w: 270, c: "#5E5D66", dx: 18 },
          { w: 286, c: "#8FB9D6", dx: 6 },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              width: b.w,
              height: 44,
              marginLeft: b.dx,
              marginTop: i ? -2 : 0,
              borderRadius: 10,
              background: b.c,
              boxShadow: "0 10px 18px -10px rgba(18,28,39,0.5)",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", right: 14, top: 8, bottom: 8, width: 30, borderRadius: 4, background: "rgba(255,255,255,0.85)" }} />
          </div>
        ))}
      </div>
      {/* mortarboard toss */}
      {toss > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 470,
            top: 760,
            transform: `translateY(${y}px) rotate(${toss * 380}deg) scale(${1 + Math.sin(toss * Math.PI) * 0.2})`,
            filter: "drop-shadow(0 18px 18px rgba(18,28,39,0.35))",
          }}
        >
          <svg width={180} height={140} viewBox="0 0 180 140">
            <path d="M90,12 L172,48 L90,84 L8,48 Z" fill={C.ink} />
            <path d="M40,64 L40,98 Q90,124 140,98 L140,64 L90,86 Z" fill="#26323F" />
            <path d="M90,48 L150,72 L150,112" stroke="#FFB347" strokeWidth={5} fill="none" strokeLinecap="round" />
            <circle cx={150} cy={116} r={7} fill="#FFB347" />
          </svg>
        </div>
      ) : null}
      <Postcard t={t} at={est - 0.05} out={STEPS[5].at - 0.05} src="longstay/img/loc_olhao.jpg" label="Olhão" x={700} y={440} rot={6} w={220} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ 6. stay */

// The villa sits full-frame behind the window so the window can simply open up.
export const VillaPlate: React.FC<{ t: number; style?: React.CSSProperties }> = ({ t, style }) => {
  const z = 1.0 + clamp01((t - 17.3) / 8) * 0.1;
  return (
    <Img
      src={staticFile("longstay/img/villa.jpg")}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        objectFit: "cover",
        transform: `scale(${z}) translateY(${(z - 1) * 260}px)`,
        transformOrigin: "50% 62%",
        ...style,
      }}
    />
  );
};

const Villa: React.FC<{ t: number; o: number }> = ({ t, o }) => <AbsoluteFill style={{ opacity: o }}>{<VillaPlate t={t} />}</AbsoluteFill>;

const BADGES = [
  { I: ISun, x: 118, y: 470 },
  { I: IFlag, x: 962, y: 520 },
  { I: ILaptop, x: 96, y: 900 },
  { I: IBox, x: 984, y: 980 },
  { I: ICap, x: 540, y: 1206 },
];

const StayFront: React.FC<{ t: number }> = ({ t }) => {
  const at = STEPS[5].at;
  if (t < at) return null;
  const words = wordsAt("L08");
  const l1 = words.slice(0, 4); // Ou para quem, simplesmente,
  const l2 = words.slice(4); // quer ficar mais tempo.
  const open = STEPS[6].at;
  return (
    <>
      {BADGES.map((b, i) => {
        const p = ease.back(clamp01((t - (at + 0.25 + i * 0.07)) / 0.4));
        const q = ease.in(clamp01((t - (open - 0.05 + i * 0.03)) / 0.45));
        if (p <= 0 || q >= 1) return null;
        const dx = (b.x - 540) * q * 0.9;
        const dy = (b.y - 800) * q * 0.9;
        const bob = Math.sin(t * 2.2 + i) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x - 54 + dx,
              top: b.y - 54 + bob + dy,
              width: 108,
              height: 108,
              borderRadius: 999,
              background: C.white,
              boxShadow: shadow.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${p * (1 - q * 0.5)})`,
              opacity: 1 - q,
              filter: q > 0.02 ? `blur(${q * 10}px)` : "none",
            }}
          >
            <b.I size={52} color={C.blue} stroke={2.2} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 30, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={l1} fontSize={64} weight={800} exitAt={open - 0.02} exitDur={0.3} accent={["simplesmente,"]} lineHeight={1.05} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 24, display: "flex", justifyContent: "center" }}>
        <Kinetic
          t={t}
          words={l2}
          fontSize={112}
          weight={800}
          accent={["mais", "tempo."]}
          underline="tempo."
          breakAfter={["ficar"]}
          hideBefore={open - 0.05}
          exitAt={21.05}
          exitDur={0.4}
          exitMode="blur"
          lineHeight={1.0}
          shadow="0 6px 30px rgba(255,240,220,0.65)"
        />
      </div>
    </>
  );
};

