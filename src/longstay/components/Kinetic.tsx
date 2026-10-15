import React from "react";
import { C, FONT, clamp01, ease, mix } from "../brand";

export type KWord = { w: string; a: number; b: number };

type Mode = "rise" | "blur" | "pop" | "slide";

type Props = {
  t: number;
  words: KWord[];
  fontSize: number;
  weight?: number;
  color?: string;
  accent?: string[]; // words that stay blue
  karaoke?: boolean; // currently spoken word turns blue
  underline?: string; // word that gets the hand-drawn swoosh
  align?: "left" | "center" | "right";
  lineHeight?: number;
  maxWidth?: number;
  mode?: Mode;
  lead?: number; // seconds a word starts appearing before it is spoken
  exitAt?: number; // seconds when the whole line leaves
  exitDur?: number;
  exitMode?: "up" | "blur" | "down";
  letterSpacing?: number;
  style?: React.CSSProperties;
  family?: string;
  shadow?: string;
  breakAfter?: string[]; // force a line break after these words
  hideBefore?: number; // nothing rendered before this time
  scaleAccent?: number;
};

const norm = (s: string) => s.toLowerCase().replace(/[.,:;!?…]/g, "");

export const Kinetic: React.FC<Props> = ({
  t,
  words,
  fontSize,
  weight = 800,
  color = C.ink,
  accent = [],
  karaoke = false,
  underline,
  align = "center",
  lineHeight = 1.06,
  maxWidth = 940,
  mode = "rise",
  lead = 0.08,
  exitAt,
  exitDur = 0.32,
  exitMode = "up",
  letterSpacing = -0.02,
  style,
  family = FONT.display,
  shadow,
  breakAfter = [],
  hideBefore,
  scaleAccent = 1,
}) => {
  if (hideBefore !== undefined && t < hideBefore) return null;
  const acc = new Set(accent.map(norm));
  const brk = new Set(breakAfter.map(norm));
  const ex = exitAt === undefined ? 0 : ease.in(clamp01((t - exitAt) / exitDur));
  if (ex >= 1) return null;
  const nodes: React.ReactNode[] = [];
  words.forEach((wd, i) => {
    const p = clamp01((t - (wd.a - lead)) / 0.26);
    const e = mode === "pop" ? ease.back(p) : ease.out(p);
    const speaking = t >= wd.a - lead && t < wd.b + 0.05;
    const isAcc = acc.has(norm(wd.w));
    const col = isAcc || (karaoke && speaking) ? C.blueText : color;
    let transform = "";
    let filter = "none";
    if (mode === "rise") {
      transform = `translateY(${(1 - e) * 0.55}em)`;
      filter = p < 1 ? `blur(${(1 - e) * 10}px)` : "none";
    } else if (mode === "blur") {
      transform = `scale(${mix(1.18, 1, e)})`;
      filter = p < 1 ? `blur(${(1 - e) * 16}px)` : "none";
    } else if (mode === "pop") {
      transform = `scale(${mix(0.4, 1, e)}) translateY(${(1 - e) * 0.2}em)`;
    } else if (mode === "slide") {
      transform = `translateX(${(1 - e) * 0.6}em)`;
      filter = p < 1 ? `blur(${(1 - e) * 8}px)` : "none";
    }
    if (ex > 0) {
      const d = ex * (1 + i * 0.08);
      if (exitMode === "up") transform += ` translateY(${-d * 0.5}em)`;
      if (exitMode === "down") transform += ` translateY(${d * 0.5}em)`;
      filter = `blur(${d * 12}px)`;
    }
    const isUnder = underline && norm(wd.w) === norm(underline);
    const up = isUnder ? ease.inOut(clamp01((t - (wd.b - 0.1)) / 0.45)) : 0;
    nodes.push(
      <span
        key={i}
        style={{
          display: "inline-block",
          position: "relative",
          opacity: p * (1 - ex),
          transform: `${transform} ${isAcc && scaleAccent !== 1 ? `scale(${scaleAccent})` : ""}`,
          filter,
          color: col,
          whiteSpace: "pre",
          transition: "none",
          willChange: "transform, opacity, filter",
        }}
      >
        {wd.w}
        {isUnder ? <Swoosh p={up} /> : null}
      </span>,
    );
    const last = i === words.length - 1;
    if (brk.has(norm(wd.w))) nodes.push(<br key={`br${i}`} />);
    else if (!last) nodes.push(<span key={`s${i}`}> </span>);
  });
  return (
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontSize,
        lineHeight,
        letterSpacing: `${letterSpacing}em`,
        textAlign: align,
        maxWidth,
        color,
        textShadow: shadow,
        ...style,
      }}
    >
      {nodes}
    </div>
  );
};

// Hand-drawn underline like the one in the management-service reel.
export const Swoosh: React.FC<{ p: number; color?: string; thickness?: number }> = ({
  p,
  color = C.blue,
  thickness = 0.085,
}) => {
  if (p <= 0) return null;
  const len = 120;
  return (
    <svg
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: "-2%",
        width: "104%",
        bottom: "-0.12em",
        height: "0.24em",
        overflow: "visible",
      }}
    >
      <path
        d="M2,9 C25,4 55,3 98,6"
        fill="none"
        stroke={color}
        strokeWidth={thickness * 100}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: `${thickness}em` }}
      />
    </svg>
  );
};

// Rolling slot: old phrase slides up and blurs out, new phrase rises from below.
export const RollingSlot: React.FC<{
  t: number;
  items: { text: React.ReactNode; at: number }[];
  height: number;
  style?: React.CSSProperties;
  dur?: number;
}> = ({ t, items, height, style, dur = 0.34 }) => {
  return (
    <div style={{ position: "relative", height, overflow: "hidden", ...style }}>
      {items.map((it, i) => {
        const next = items[i + 1];
        const pin = ease.out(clamp01((t - it.at) / dur));
        const pout = next ? ease.in(clamp01((t - next.at) / (dur * 0.8))) : 0;
        if (pin <= 0 || pout >= 1) return null;
        const y = (1 - pin) * height * 0.9 - pout * height * 0.9;
        const blur = (1 - pin) * 10 + pout * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${y}px)`,
              opacity: pin * (1 - pout),
              filter: blur > 0.2 ? `blur(${blur}px)` : "none",
            }}
          >
            {it.text}
          </div>
        );
      })}
    </div>
  );
};
