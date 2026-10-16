import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, FONT, SAFE, clamp01, ease, mix } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { IMoon } from "../components/Icons";
import { shadow } from "../components/UI";
import { wordTime, wordsAt } from "../data/timeline";
import { Stage3D, Text3D, measure3D, useFont3D, wy } from "../components/Type3D";

// 33.6–40.2 s: the longer you stay the less you pay → 28+ days → −30% on the drop (38.40).
export const Offer: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const w11 = wordsAt("L11");
  const a1 = w11.slice(0, 5); // E quanto mais tempo fica,
  const a2 = w11.slice(5); // menos paga:
  const w12 = wordsAt("L12");
  const b1 = w12.slice(0, 7); // em estadias com mais de 28 dias,
  const em = w12[0].a;
  const n28 = wordTime("L12", "28").a;
  const drop = wordTime("L12", "30%").a;
  const enter = ease.out(clamp01((t - t0) / 0.4));
  const toCount = ease.inOut(clamp01((t - (em - 0.25)) / 0.45));
  const push = ease.in(clamp01((t - (n28 + 0.2)) / (drop - n28 - 0.2)));
  const exit = ease.inOut(clamp01((t - (t1 - 0.32)) / 0.26));
  return (
    <AbsoluteFill style={{ opacity: enter }}>
      {/* A — price per night goes down as nights go up */}
      {toCount < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - toCount, transform: `scale(${1 - toCount * 0.1})`, filter: toCount > 0.02 ? `blur(${toCount * 12}px)` : "none" }}>
          <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 24, textAlign: "center" }}>
            <Kinetic t={t} words={a1} fontSize={64} weight={800} accent={["tempo"]} lineHeight={1.08} />
            <div style={{ height: 4 }} />
            <Kinetic t={t} words={a2} fontSize={118} weight={800} accent={["menos"]} underline="menos" lineHeight={1.0} />
          </div>
          <PriceGraph t={t} at={t0 + 0.15} />
        </AbsoluteFill>
      ) : null}
      {/* B — 28+ days */}
      {toCount > 0 && t < drop + 0.1 ? (
        <AbsoluteFill
          style={{
            opacity: toCount * (1 - clamp01((t - drop) / 0.08)),
            transform: `scale(${mix(1.1, 1, toCount) * (1 + push * 0.22)})`,
            filter: push > 0.6 ? `blur(${(push - 0.6) * 20}px)` : "none",
          }}
        >
          <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: SAFE.top + 30, display: "flex", justifyContent: "center" }}>
            <Kinetic t={t} words={b1} fontSize={66} weight={800} accent={["28", "dias,"]} breakAfter={["com"]} lineHeight={1.08} />
          </div>
          <DayCounter t={t} from={em} n28={n28} />
        </AbsoluteFill>
      ) : null}
      {/* C — the drop */}
      {t >= drop - 0.02 ? <Discount t={t} drop={drop} exit={exit} /> : null}
    </AbsoluteFill>
  );
};

const PriceGraph: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = ease.back(clamp01((t - at) / 0.5));
  const fica = wordTime("L11", "fica,").a;
  const menos = wordTime("L11", "menos").a;
  // nights 1 → 28+, price per night steps down
  const steps = [
    { n: "1", y: 40 },
    { n: "7", y: 92 },
    { n: "14", y: 150 },
    { n: "21", y: 196 },
    { n: "28+", y: 262 },
  ];
  const X0 = 70;
  const X1 = 760;
  const xs = steps.map((_, i) => mix(X0, X1, i / (steps.length - 1)));
  let d = `M${X0},${steps[0].y}`;
  steps.forEach((s, i) => {
    if (i === 0) return;
    d += ` L${xs[i] - 40},${steps[i - 1].y} Q${xs[i] - 10},${steps[i - 1].y} ${xs[i]},${s.y}`;
  });
  d += ` L${X1 + 40},${steps[steps.length - 1].y}`;
  const draw = ease.inOut(clamp01((t - (at + 0.25)) / (menos + 0.2 - at - 0.25)));
  const ride = clamp01((t - (at + 0.35)) / (fica + 0.5 - at - 0.35));
  const k = Math.min(steps.length - 1, Math.floor(ride * (steps.length - 0.001)));
  const dot = { x: mix(X0, X1, ease.inOut(ride)), y: steps[k].y };
  const hot = ease.out(clamp01((t - (menos - 0.05)) / 0.3));
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 640,
        width: 920,
        transformOrigin: "50% 50%",
        padding: "34px 40px 30px",
        borderRadius: 44,
        background: "rgba(255,255,255,0.97)",
        boxShadow: shadow.card,
        // scaled to 0.78 so the card (and its '28+ noites' tag) stays clear of the Reels action column
        transform: `translateY(${(1 - p) * 120}px) scale(${mix(0.85, 1, p) * 0.78})`,
        opacity: clamp01(p * 2),
        fontFamily: FONT.body,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 600, fontSize: 30, color: C.inkSoft }}>
          <IMoon size={34} color={C.blue} stroke={2.4} /> Preço por noite
        </div>
        <div
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            background: hot > 0.5 ? C.blue : C.blueSoft,
            color: hot > 0.5 ? C.white : C.blueDeep,
            fontWeight: 600,
            fontSize: 24,
            transform: `scale(${1 + Math.sin(hot * Math.PI) * 0.15})`,
          }}
        >
          {hot > 0.5 ? "↓ menos" : "noites ↑"}
        </div>
      </div>
      <svg width={840} height={330} viewBox="0 0 840 330" style={{ marginTop: 18, overflow: "visible" }}>
        {[60, 130, 200, 270].map((y) => (
          <line key={y} x1={40} x2={820} y1={y} y2={y} stroke={C.line} strokeWidth={2} strokeDasharray="4 10" />
        ))}
        <path d={`${d} L${X1 + 40},300 L${X0},300 Z`} fill="url(#pgFill)" opacity={draw} />
        <defs>
          <linearGradient id="pgFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.blue} stopOpacity="0.22" />
            <stop offset="1" stopColor={C.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke={C.blue} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {steps.map((s, i) => (
          <text key={s.n} x={xs[i]} y={326} textAnchor="middle" fontFamily={FONT.display} fontWeight={700} fontSize={26} fill={i === steps.length - 1 && hot > 0.5 ? C.blue : C.muted}>
            {s.n}
          </text>
        ))}
        {ride > 0 ? (
          <g transform={`translate(${dot.x},${dot.y})`}>
            <circle r={22} fill={C.blue} opacity={0.18} />
            <circle r={12} fill={C.blue} stroke="#fff" strokeWidth={4} />
            <g transform="translate(0,-52)">
              <rect x={-74} y={-26} width={148} height={46} rx={23} fill={C.ink} />
              <text x={0} y={6} textAnchor="middle" fontFamily={FONT.body} fontWeight={600} fontSize={24} fill="#fff">
                {`${steps[k].n} ${steps[k].n === "1" ? "noite" : "noites"}`}
              </text>
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

const DayCounter: React.FC<{ t: number; from: number; n28: number }> = ({ t, from, n28 }) => {
  const c = ease.inOut(clamp01((t - (from + 0.05)) / (n28 + 0.05 - from)));
  const n = Math.max(1, Math.round(c * 28));
  const plus = ease.back(clamp01((t - (n28 + 0.12)) / 0.4));
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 300, lineHeight: 1, color: C.ink, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>{n}</div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 900,
            fontSize: 220,
            lineHeight: 1,
            color: C.blue,
            marginTop: 10,
            transform: `scale(${plus}) rotate(${(1 - plus) * -90}deg)`,
            width: plus > 0 ? undefined : 0,
          }}
        >
          +
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 44, letterSpacing: "0.3em", color: C.inkSoft }}>DIAS</div>
      {/* 28 day dots */}
      <div style={{ position: "absolute", left: 540 - (7 * 62) / 2, top: 970, width: 7 * 62, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const on = clamp01(c * 28 - i);
          return (
            <div
              key={i}
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: on > 0.5 ? C.blue : "rgba(255,255,255,0.9)",
                boxShadow: on > 0.5 ? "0 8px 16px -8px rgba(35,164,235,0.8)" : shadow.soft,
                transform: `scale(${1 + Math.sin(on * Math.PI) * 0.2})`,
              }}
            />
          );
        })}
      </div>
    </>
  );
};

export const OFFER_BG = C.blue;

const SPARKS = Array.from({ length: 46 }).map((_, i) => ({
  a: random(`sa${i}`) * Math.PI * 2,
  v: 600 + random(`sv${i}`) * 1100,
  s: 8 + random(`ss${i}`) * 18,
  c: random(`sc${i}`) > 0.6 ? "#FFFFFF" : random(`sc2${i}`) > 0.5 ? "#BFE5FA" : "#FFFFFF",
  sq: random(`sq${i}`) > 0.5,
}));

const Discount: React.FC<{ t: number; drop: number; exit: number }> = ({ t, drop, exit }) => {
  const lt = t - drop;
  const wipe = ease.out(clamp01(lt / 0.42));
  const slam = clamp01(lt / 0.36);
  const sE = ease.out(slam);
  const desc = wordTime("L12", "de", 1);
  const words = wordsAt("L12").slice(9); // de desconto.
  const chip = ease.back(clamp01((t - (desc.a + 0.5)) / 0.45));
  const settle = Math.sin(clamp01((lt - 0.36) / 0.5) * Math.PI) * (1 - clamp01((lt - 0.36) / 0.5));
  const drift = lt * 0.025;
  useFont3D();
  const S30 = Math.min(300, 300 * (820 / Math.max(1, measure3D("−30%", 300))));
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: OFFER_BG,
          clipPath: `circle(${mix(0, 1500, wipe)}px at 540px 760px)`,
        }}
      />
      <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.12})`, filter: exit > 0.02 ? `blur(${exit * 14}px)` : "none" }}>
      {/* sparks */}
      {SPARKS.map((s, i) => {
        const p = clamp01(lt / 1.4);
        if (p <= 0 || p >= 1) return null;
        const e = ease.out(p);
        const x = 540 + Math.cos(s.a) * s.v * e;
        const y = 760 + Math.sin(s.a) * s.v * e * 0.9 + p * p * 300;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s.s,
              height: s.sq ? s.s * 0.5 : s.s,
              borderRadius: s.sq ? 3 : 99,
              background: s.c,
              opacity: 1 - p,
              transform: `rotate(${p * 540 + i * 30}deg)`,
            }}
          />
        );
      })}
      {/* real extruded 3D numeral, slammed in on the drop */}
      <Stage3D cam={{ x: -60, y: -110, pitch: 0.03, yaw: -0.017 + Math.sin(lt * 1.2) * 0.012, dolly: drift * 900 }}>
        <Text3D
          text="−30%"
          size={S30}
          depth={S30 * 0.4}
          bevel={S30 * 0.03}
          face={C.white}
          side={"#64636C"}
          y={wy(690)}
          z={mix(1700, 0, sE)}
          rx={mix(-0.95, 0, sE) + Math.sin(lt * 1.1) * 0.035}
          ry={mix(0.85, 0, sE) + Math.sin(lt * 0.8) * 0.1}
          rz={mix(0.25, 0, sE)}
          scale={1 + settle * 0.05}
          opacity={clamp01(slam * 4)}
        />
      </Stage3D>
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.left, top: 905, display: "flex", justifyContent: "center" }}>
        <Kinetic t={t} words={words} fontSize={96} weight={800} color={C.white} mode="pop" lineHeight={1} />
      </div>
      {chip > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "18px 34px",
              borderRadius: 999,
              background: C.white,
              color: C.blueDeep,
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 34,
              boxShadow: "0 18px 40px -16px rgba(5,40,70,0.55)",
              transform: `scale(${mix(0.5, 1, chip)})`,
              opacity: clamp01(chip * 2),
            }}
          >
            Em estadias com mais de 28 dias
          </div>
        </div>
      ) : null}
      </AbsoluteFill>
      {/* flash on impact */}
      {lt < 0.3 ? <AbsoluteFill style={{ background: "#fff", opacity: (1 - lt / 0.3) * 0.75 }} /> : null}
    </AbsoluteFill>
  );
};
