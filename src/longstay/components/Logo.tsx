import React from "react";
import { C, FONT, clamp01, ease, mix } from "../brand";

// HD Properties logo rebuilt as vectors from the reel's end card.
// Geometry is in the source crop's pixel space; the three roof strokes share a
// 0.618 slope (dx per dy), the blue one has a rounded top-left corner and the
// dark one a rounded bottom-right corner.
export const LOGO_BOX = { x: 26, y: 23, w: 528, h: 474 };
export const ROOF_BOX = { x: 26, y: 23, w: 492, h: 325 };

const BASE = 347.7;
const TOP = 23.8;

export const ROOF = {
  blue: "M27,347.7 L211.9,48.6 Q227.25,23.8 256.4,23.8 L309.6,23.8 L109.4,347.7 Z",
  dark: "M125.5,347.7 L325.7,23.8 L406.8,23.8 L221.9,322.9 Q206.6,347.7 177.45,347.7 Z",
  light: "M326.6,23.8 L408.1,23.8 L517.6,201 L436.1,201 Z",
};

export const LOGO_COLORS = {
  blue: C.blue,
  dark: "#605F68",
  light: "#8F8E93",
};

type Props = {
  // 0..1 progress of each part
  blue?: number;
  dark?: number;
  light?: number;
  hd?: number;
  props?: number;
  holiday?: number;
  width: number;
  showText?: boolean;
  roofOnly?: boolean;
  monochrome?: string;
  glint?: number; // -1..2 sweep position, outside 0..1 hidden
  id?: string;
  style?: React.CSSProperties;
};

const wipeUp = (p: number, top: number, bottom: number) => {
  const y = mix(bottom, top - 2, p);
  return { y, h: bottom - y + 2 };
};

export const Logo: React.FC<Props> = ({
  blue = 1,
  dark = 1,
  light = 1,
  hd = 1,
  props = 1,
  holiday = 1,
  width,
  showText = true,
  roofOnly = false,
  monochrome,
  glint = -1,
  id = "logo",
  style,
}) => {
  const box = roofOnly ? ROOF_BOX : LOGO_BOX;
  const height = (width * box.h) / box.w;
  const bw = wipeUp(ease.inOut(clamp01(blue)), TOP, BASE);
  const dw = wipeUp(ease.inOut(clamp01(dark)), TOP, BASE);
  const lp = ease.inOut(clamp01(light));
  const hdP = ease.out(clamp01(hd));
  const prP = clamp01(props);
  const hoP = ease.out(clamp01(holiday));
  const col = (k: keyof typeof LOGO_COLORS) => monochrome ?? LOGO_COLORS[k];
  return (
    <svg
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <clipPath id={`${id}-cb`}>
          <rect x={0} y={bw.y} width={600} height={bw.h} />
        </clipPath>
        <clipPath id={`${id}-cd`}>
          <rect x={0} y={dw.y} width={600} height={dw.h} />
        </clipPath>
        <clipPath id={`${id}-cl`}>
          <rect x={0} y={TOP - 2} width={600} height={mix(0, 182, lp)} />
        </clipPath>
        <clipPath id={`${id}-chd`}>
          <rect x={300} y={200} width={300} height={150} />
        </clipPath>
        <linearGradient id={`${id}-glint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-roofclip`}>
          <path d={ROOF.blue} />
          <path d={ROOF.dark} />
          <path d={ROOF.light} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-cd)`}>
        <path d={ROOF.dark} fill={col("dark")} />
      </g>
      <g clipPath={`url(#${id}-cl)`}>
        <path d={ROOF.light} fill={col("light")} />
      </g>
      <g clipPath={`url(#${id}-cb)`}>
        <path d={ROOF.blue} fill={col("blue")} />
      </g>
      {glint > -0.5 && glint < 1.5 ? (
        <g clipPath={`url(#${id}-roofclip)`}>
          <rect
            x={mix(-120, 560, glint)}
            y={0}
            width={120}
            height={400}
            fill={`url(#${id}-glint)`}
            transform={`skewX(-28)`}
            opacity={0.9}
          />
        </g>
      ) : null}
      {!roofOnly && showText ? (
        <>
          <g clipPath={`url(#${id}-chd)`}>
            <text
              x={333.8}
              y={348.5 + (1 - hdP) * 130}
              fontFamily={FONT.body}
              fontWeight={500}
              fontSize={175.8}
              fill={col("blue")}
              textLength={219.6}
              lengthAdjust="spacingAndGlyphs"
            >
              HD
            </text>
          </g>
          <g>
            <text
              x={26.2}
              y={445.1 + (1 - ease.out(prP)) * 26}
              opacity={ease.out(prP)}
              fontFamily={FONT.body}
              fontWeight={400}
              fontSize={101.7}
              fill={col("dark")}
              textLength={527.2}
              lengthAdjust="spacingAndGlyphs"
              letterSpacing={mix(18, 0, ease.out(prP))}
            >
              PROPERTIES
            </text>
          </g>
          <g opacity={hoP}>
            <text
              x={113.2}
              y={496.6}
              fontFamily={FONT.body}
              fontWeight={300}
              fontSize={49.1}
              fill={col("light")}
              textLength={353.4}
              lengthAdjust="spacingAndGlyphs"
            >
              HOLIDAY RENTALS
            </text>
            <rect x={mix(81.5, 26.2, hoP)} y={478} width={mix(0, 55.3, hoP)} height={2} fill={col("light")} />
            <rect x={498.6} y={478} width={mix(0, 55.2, hoP)} height={2} fill={col("light")} />
          </g>
        </>
      ) : null}
    </svg>
  );
};
