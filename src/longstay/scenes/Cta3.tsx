import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, clamp01, ease, mix } from "../brand";
import { ICalendar, IChat } from "../components/Icons";
import { Logo } from "../components/Logo";
import { Roof3D } from "../components/Logo3D";
import { Stage3D, Text3D, measure3D, useFont3D, wy } from "../components/Type3D";
import { shadow } from "../components/UI";
import { TL, wordTime } from "../data/timeline";

// Sign-off + call to action: the roof mark assembles in 3D on "HD Properties.", then
// "Reserve já a sua estadia, ou fale connosco." with two real buttons that get tapped.

const LW0 = 520; // logo width when it lands
const LW1 = 300; // logo width at the top

export const Cta3: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0 }) => {
  useFont3D();
  const hd = wordTime("S01", "HD").a;
  const res = wordTime("C01", "Reserve").a;
  const ja = wordTime("C01", "já").a;
  const a = wordTime("C01", "a").a;
  const sua = wordTime("C01", "sua").a;
  const est = wordTime("C01", "estadia,");
  const ou = wordTime("C01", "ou").a;
  const fale = wordTime("C01", "fale").a;
  const con = wordTime("C01", "connosco.");
  const hit = TL.music.stop;
  // ------------------------------------------------ background: light circle opens from the blue offer
  const open = ease.inOut(clamp01((t - t0) / 0.42));
  // ------------------------------------------------ logo: lands centred, then moves to the top
  const land = hd - 0.02;
  const move = ease.inOut(clamp01((t - (res - 0.3)) / 0.5));
  const lw = mix(LW0, LW1, move);
  const lh = (lw * 474) / 528;
  const lcy = mix(700, 400, move);
  const left = 540 - lw / 2;
  const top = lcy - lh / 2;
  const partFx = (p: "blue" | "dark" | "light") => {
    const order = { dark: 0, light: 1, blue: 2 }[p];
    const st = land - 0.42 + order * 0.07;
    const q = clamp01((t - st) / 0.42);
    if (q <= 0) return null;
    const e = ease.out(q);
    const dir = { dark: [-1, 0.4], light: [1, 0.8], blue: [-0.6, -1] }[p];
    const glint = t > hit ? Math.sin(clamp01((t - hit) / 0.5) * Math.PI) * 0.08 : 0;
    return {
      x: dir[0] * 520 * (1 - e),
      y: dir[1] * 420 * (1 - e),
      z: 900 * (1 - e),
      rx: (1 - e) * 1.1 + Math.sin(t * 1.2 + order) * 0.03,
      ry: (1 - e) * (order - 1) * 1.6 + Math.sin(t * 0.9 + order) * 0.06 + glint,
      rz: (1 - e) * (order - 1) * 0.6,
      o: clamp01(q * 3),
    };
  };
  const tp = (d: number, len = 0.32) => clamp01((t - (land + d)) / len);
  const sway = Math.sin(t * 1.1) * 0.04;
  // ------------------------------------------------ 3D headline
  const L1 = "RESERVE JÁ";
  const L2 = "A SUA ESTADIA";
  const s1 = Math.min(112, 112 * (820 / Math.max(1, measure3D(L1, 112))));
  const s2 = Math.min(84, 84 * (800 / Math.max(1, measure3D(L2, 84))));
  const on1 = [res, res, res, res, res, res, res, -1, ja, ja];
  const on2 = [a, -1, sua, sua, sua, -1, est.a, est.a, est.a, est.a, est.a, est.a, est.a];
  const pop = (on: number[]) => (i: number) => {
    const p = clamp01((t - (on[i] - 0.06 + (i % 7) * 0.012)) / 0.26);
    if (p <= 0) return null;
    return { rx: (1 - ease.back(p)) * -1.35, y: (1 - ease.out(p)) * -46, z: (1 - ease.out(p)) * 140, o: clamp01(p * 2.4) };
  };
  // ------------------------------------------------ buttons + taps
  const b1 = ease.back(clamp01((t - (est.a + 0.05)) / 0.42));
  const b2 = ease.back(clamp01((t - (fale - 0.08)) / 0.42));
  const tap1 = est.b + 0.2;
  const tap2 = con.b + 0.12;
  const press = (at: number) => {
    const d = t - at;
    return d < 0 || d > 0.32 ? 0 : Math.sin((d / 0.32) * Math.PI);
  };
  const ripple = (at: number) => clamp01((t - at) / 0.55);
  // cursor path: in from bottom-right, to button 1, to button 2
  const B1Y = 905;
  const B2Y = 1072;
  const cur = (() => {
    const p0 = [930, 1500];
    const p1 = [655, B1Y + 22];
    const p2 = [640, B2Y + 24];
    const a1 = ease.inOut(clamp01((t - (tap1 - 0.55)) / 0.5));
    const a2 = ease.inOut(clamp01((t - (tap2 - 0.55)) / 0.5));
    const x = mix(mix(p0[0], p1[0], a1), p2[0], a2);
    const y = mix(mix(p0[1], p1[1], a1), p2[1], a2) - Math.sin(a1 * Math.PI) * 60 - Math.sin(a2 * Math.PI) * 40;
    const vis = clamp01((t - (tap1 - 0.6)) / 0.2) * (1 - clamp01((t - (tap2 + 0.7)) / 0.3));
    return { x, y, vis, s: 1 - (press(tap1) + press(tap2)) * 0.16 };
  })();
  const pills = ease.back(clamp01((t - (con.b + 0.35)) / 0.45));
  const pulse = t > hit ? Math.sin(clamp01((t - hit) / 0.36) * Math.PI) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: C.blue }} />
      <AbsoluteFill
        style={{
          background: "radial-gradient(1300px 1700px at 540px 760px, #FFFFFF 0%, #F3F7FB 55%, #E6EEF6 100%)",
          clipPath: `circle(${mix(0, 1500, open)}px at 540px 760px)`,
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${1 + pulse * 0.02})` }}>
        {/* 2D logo text (the roof is 3D) */}
        <div style={{ position: "absolute", left, top }}>
          <Logo width={lw} noRoof hd={tp(0.0, 0.3)} props={tp(0.38, 0.38)} holiday={tp(0.62, 0.36)} id="ctalogo" />
        </div>
        <Stage3D cam={{ x: -40, y: -60, pitch: 0.016, yaw: -0.011 }}>
          <Roof3D left={left} top={top} width={lw} depth={mix(34, 22, move)} fx={partFx} />
          <group rotation={[0, sway, 0]}>
            <Text3D text={L1} size={s1} depth={s1 * 0.3} face={C.ink} side={C.blue} y={wy(636)} fx={pop(on1)} />
            <Text3D text={L2} size={s2} depth={s2 * 0.3} face={C.blue} side={"#64636C"} y={wy(758)} fx={pop(on2)} />
          </group>
        </Stage3D>
        {/* primary: book */}
        <Button y={B1Y} p={b1} pressed={press(tap1)} ripple={ripple(tap1)} primary icon={<ICalendar size={46} color={C.white} stroke={2.4} />} label="Reservar estadia" pulse={pulse} />
        {/* secondary: talk to us */}
        <Button y={B2Y} p={b2} pressed={press(tap2)} ripple={ripple(tap2)} icon={<IChat size={46} color={C.blue} stroke={2.4} />} label="Fale connosco" pulse={pulse * 0.6} />
        {/* "ou" between the two */}
        {ou > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: B1Y + 70,
              textAlign: "center",
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: "0.18em",
              color: C.muted,
              opacity: clamp01((t - (ou - 0.05)) / 0.25),
            }}
          >
            OU
          </div>
        ) : null}
        {/* footer pills */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1160, display: "flex", justifyContent: "center", gap: 16 }}>
          {pills > 0 ? (
            <>
              <Pill p={pills} color={C.blue}>−30% · estadias +28 dias</Pill>
              <Pill p={clamp01(pills * 1.2 - 0.2)} color={C.ink}>hdproperties.pt</Pill>
            </>
          ) : null}
        </div>
        {/* hand cursor */}
        {cur.vis > 0 ? (
          <svg
            width={92}
            height={108}
            viewBox="0 0 46 54"
            style={{
              position: "absolute",
              left: cur.x - 18,
              top: cur.y - 6,
              opacity: cur.vis,
              transform: `scale(${cur.s})`,
              transformOrigin: "18px 6px",
              filter: "drop-shadow(0 10px 12px rgba(18,28,39,0.35))",
            }}
          >
            <path
              d="M14 3c2.2 0 4 1.8 4 4v13.2l2.1-.6c1.9-.5 3.8.6 4.4 2.4l.3.9 1.4-.4c2-.5 4 .6 4.6 2.6l.4 1.4 1.1-.3c2-.5 4.1.6 4.6 2.6l2.4 8.9c1.6 6-2 12.2-8 13.8l-5.2 1.4c-4.4 1.2-9.1-.4-11.9-4L5.4 37.6c-1.2-1.6-.9-3.9.7-5.1 1.5-1.1 3.6-1 4.9.3L10 31V7c0-2.2 1.8-4 4-4z"
              fill="#FFFFFF"
              stroke={C.ink}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Button: React.FC<{
  y: number;
  p: number;
  pressed: number;
  ripple: number;
  primary?: boolean;
  icon: React.ReactNode;
  label: string;
  pulse: number;
}> = ({ y, p, pressed, ripple, primary, icon, label, pulse }) => {
  if (p <= 0) return null;
  const w = 680;
  const h = 128;
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: y - h / 2, width: w, height: h }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: primary ? C.blue : C.white,
          border: primary ? "none" : `4px solid ${C.blue}`,
          boxShadow: primary ? "0 26px 46px -18px rgba(35,164,235,0.75)" : shadow.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 44,
          color: primary ? C.white : C.blue,
          transform: `translateY(${(1 - p) * 60 + pressed * 6}px) scale(${mix(0.6, 1, p) * (1 - pressed * 0.05) * (1 + pulse * 0.04)})`,
          opacity: clamp01(p * 2),
          overflow: "hidden",
        }}
      >
        {ripple > 0 && ripple < 1 ? (
          <div
            style={{
              position: "absolute",
              left: w / 2 + 115 - 400,
              top: h / 2 - 400,
              width: 800,
              height: 800,
              borderRadius: 999,
              background: primary ? "rgba(255,255,255,0.35)" : "rgba(35,164,235,0.18)",
              transform: `scale(${mix(0.05, 1, ease.out(ripple))})`,
              opacity: 1 - ripple,
            }}
          />
        ) : null}
        {icon}
        {label}
      </div>
    </div>
  );
};

const Pill: React.FC<{ p: number; color: string; children: React.ReactNode }> = ({ p, color, children }) => (
  <div
    style={{
      padding: "14px 26px",
      borderRadius: 999,
      background: C.white,
      color,
      fontFamily: FONT.body,
      fontWeight: 600,
      fontSize: 28,
      boxShadow: shadow.chip,
      transform: `scale(${mix(0.5, 1, ease.back(clamp01(p)))})`,
      opacity: clamp01(p * 2),
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
