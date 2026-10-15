import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { C, FONT, clamp01, ease, mix } from "../brand";

// 0–3.84 s: scroll-stopper on drop 2. One beat = 0.48 s; every element lands on a beat
// (hit, snap, snap, shutter, shutter, sticker, shutter+glitch) and the last beat sucks
// everything into the centre while the music tape-stops.
const B = 0.48;

const Polaroid: React.FC<{ src: string; w: number; caption?: string; style?: React.CSSProperties }> = ({ src, w, caption, style }) => (
  <div
    style={{
      width: w,
      padding: w * 0.055,
      paddingBottom: caption ? w * 0.2 : w * 0.055,
      background: "#FFFFFF",
      boxShadow: "0 30px 50px -18px rgba(5,25,45,0.55), 0 6px 14px -6px rgba(5,25,45,0.35)",
      borderRadius: 6,
      position: "relative",
      ...style,
    }}
  >
    <div style={{ width: "100%", aspectRatio: "1 / 1.05", overflow: "hidden", borderRadius: 2 }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.06)" }} />
    </div>
    {caption ? (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: w * 0.035, textAlign: "center", fontFamily: FONT.hand, fontWeight: 700, fontSize: w * 0.13, color: "#33414F" }}>
        {caption}
      </div>
    ) : null}
  </div>
);

export { Polaroid };

const shakeAt = (t: number, at: number, amp: number, seed: string) => {
  const d = t - at;
  if (d < 0 || d > 0.35) return [0, 0];
  const k = (1 - d / 0.35) ** 2 * amp;
  return [(random(`${seed}x${Math.floor(d * 60)}`) - 0.5) * 2 * k, (random(`${seed}y${Math.floor(d * 60)}`) - 0.5) * 2 * k];
};

export const ColdOpen: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t1 }) => {
  const suck = ease.in(clamp01((t - (t1 - B)) / B));
  const s1 = shakeAt(t, 0, 26, "s0");
  const s2 = shakeAt(t, 2 * B, 14, "s2");
  const s3 = shakeAt(t, 5 * B, 18, "s5");
  const sx = s1[0] + s2[0] + s3[0];
  const sy = s1[1] + s2[1] + s3[1];
  const slam = ease.out(clamp01(t / 0.26));
  const line2 = ease.out(clamp01((t - 2 * B) / 0.22));
  const glitch = t > 6 * B && t < 6 * B + 0.12;
  const rays = t * 18;
  const flashIn = clamp01(1 - t / 0.18);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* deep sea-blue field with a warm sun breaking in from the top right */}
      <AbsoluteFill style={{ background: `radial-gradient(1300px 1500px at 540px 760px, #33B4F2 0%, ${C.blue} 32%, ${C.blueDeep} 66%, #08385E 100%)` }} />
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${rays}deg at 930px 300px, rgba(255,236,190,0.16) 0deg 7deg, rgba(255,236,190,0) 7deg 22deg)`,
          WebkitMaskImage: "radial-gradient(1100px 1100px at 930px 300px, #000 0%, transparent 75%)",
          maskImage: "radial-gradient(1100px 1100px at 930px 300px, #000 0%, transparent 75%)",
          opacity: 0.9 * (1 - suck),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 930 - 230,
          top: 300 - 230,
          width: 460,
          height: 460,
          borderRadius: 999,
          background: "radial-gradient(circle, #FFF8E1 0%, #FFE08A 30%, #FFB347 52%, rgba(255,179,71,0) 72%)",
          transform: `scale(${mix(0.2, 1, ease.back(clamp01(t / 0.45))) * (1 + Math.sin(t * 3) * 0.02)})`,
          opacity: 1 - suck,
        }}
      />
      <AbsoluteFill
        style={{
          transform: `translate(${sx}px, ${sy}px) scale(${mix(1, 0.04, suck)}) rotate(${suck * 28}deg)`,
          transformOrigin: "540px 860px",
          filter: suck > 0.02 ? `blur(${suck * 14}px)` : "none",
        }}
      >
        {/* polaroids slapped down on the beat */}
        {[
          { at: 3 * B, src: "longstay/img/loc_vilamoura.jpg", x: 70, y: 980, r: -10, cap: "Vilamoura" },
          { at: 4 * B, src: "longstay/img/th_beach.jpg", x: 690, y: 940, r: 9, cap: "Praia" },
          { at: 6 * B, src: "longstay/img/th_pool_palms.jpg", x: 380, y: 1060, r: -3, cap: "Piscina" },
        ].map((p, i) => {
          const q = clamp01((t - p.at) / 0.22);
          if (q <= 0) return null;
          const e = ease.out(q);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                transform: `perspective(1000px) translateY(${(1 - e) * -260}px) rotate(${p.r + (1 - e) * 24}deg) rotateX(${(1 - e) * 40}deg) scale(${mix(1.6, 1, e)})`,
                opacity: clamp01(q * 4),
                filter: q < 1 ? `blur(${(1 - e) * 8}px)` : "none",
              }}
            >
              <Polaroid src={p.src} w={300} caption={p.cap} />
            </div>
          );
        })}
        {/* 1 MÊS — chunky extruded numeral */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 330,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${mix(2.6, 1, slam) * (1 + [B, 2 * B, 6 * B + 0.24].reduce((acc, at) => acc + (t > at && t < at + 0.2 ? Math.sin(((t - at) / 0.2) * Math.PI) * 0.06 : 0), 0))})`,
            filter: slam < 1 ? `blur(${(1 - slam) * 16}px)` : "none",
            opacity: clamp01(slam * 3),
          }}
        >
          <div style={{ position: "relative", fontFamily: FONT.display, fontWeight: 900, fontSize: 250, lineHeight: 1, letterSpacing: "-0.05em" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: i === 11 ? "relative" : "absolute",
                  left: 0,
                  top: 0,
                  transform: `translate(${(11 - i) * 1.2}px, ${(11 - i) * 2.2}px)`,
                  color: i === 11 ? C.white : `rgb(${8 + i},${48 + i * 4},${84 + i * 5})`,
                  whiteSpace: "nowrap",
                  textShadow: i === 11 && glitch ? "-8px 0 rgba(255,60,90,0.85), 8px 0 rgba(60,240,255,0.85)" : undefined,
                }}
              >
                1 MÊS
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 610,
            textAlign: "center",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 104,
            letterSpacing: "0.02em",
            color: C.white,
            textShadow: glitch ? "-6px 0 rgba(255,60,90,0.85), 6px 0 rgba(60,240,255,0.85)" : "0 10px 30px rgba(5,30,55,0.45)",
            transform: `translateY(${(1 - line2) * 60}px) scale(${mix(1.3, 1, line2)})`,
            opacity: line2,
            filter: line2 < 1 ? `blur(${(1 - line2) * 10}px)` : "none",
          }}
        >
          NO ALGARVE
        </div>
        {/* the offer, stamped on */}
        <Sticker t={t} at={5 * B} />
      </AbsoluteFill>
      {/* impact flash on frame one + shutter flashes */}
      {flashIn > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flashIn * 0.9 }} /> : null}
      {[3 * B, 4 * B, 6 * B].map((at, i) => {
        const d = t - at;
        if (d < 0 || d > 0.12) return null;
        return <AbsoluteFill key={i} style={{ background: "#fff", opacity: (1 - d / 0.12) * 0.55 }} />;
      })}
    </AbsoluteFill>
  );
};

const Sticker: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const q = clamp01((t - at) / 0.3);
  if (q <= 0) return null;
  const e = ease.back(q);
  const wob = Math.sin((t - at) * 9) * 3 * (1 - clamp01((t - at) / 0.8));
  return (
    <div
      style={{
        position: "absolute",
        left: 712,
        top: 735,
        width: 280,
        height: 280,
        borderRadius: 999,
        background: "radial-gradient(circle at 35% 30%, #FFE680 0%, #FFD23F 55%, #F5B700 100%)",
        boxShadow: "0 24px 40px -14px rgba(5,25,45,0.6), inset 0 -8px 0 rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${mix(2.2, 1, e)}) rotate(${-14 + (1 - e) * -40 + wob}deg)`,
        opacity: clamp01(q * 3),
      }}
    >
      <div style={{ position: "absolute", inset: 14, borderRadius: 999, border: "4px dashed rgba(15,111,168,0.45)" }} />
      <div style={{ display: "flex", alignItems: "center", fontFamily: FONT.display, fontWeight: 900, fontSize: 96, color: C.blueDeep, letterSpacing: "-0.04em", lineHeight: 1 }}>
        <span style={{ display: "inline-block", width: 34, height: 12, background: C.blueDeep, borderRadius: 4, marginRight: 8, marginTop: 6 }} />
        30%
      </div>
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 26, color: C.blueDeep, marginTop: 4 }}>28+ noites</div>
    </div>
  );
};
