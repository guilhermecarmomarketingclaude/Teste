import { Easing } from "remotion";

// Palette sampled from the management-service reel and the HD Properties logo.
export const C = {
  bgTop: "#F6F9FC",
  bgBottom: "#DDE8F2",
  ink: "#121C27",
  inkSoft: "#3A4756",
  muted: "#7C8A99",
  line: "#D8E2EB",
  // HD Properties logo blue, measured on the logo itself — every blue element uses exactly this
  blue: "#23A4EB",
  blueText: "#23A4EB",
  blueDeep: "#23A4EB",
  blueSoft: "#DEF1FC", // 14% tint of the logo blue, only for soft fills
  greyDark: "#64636C",
  greyLight: "#8F8E93",
  white: "#FFFFFF",
  sea: "#D6E8F5",
  sun: "#FFB347",
};

export const FONT = {
  display: "Montserrat",
  body: "Poppins",
  hand: "Caveat",
};

export const W = 1080;
export const H = 1920;
export const FPS = 60;

// Instagram Reels ad safe zone (Meta: keep ~14% top, ~35% bottom, ~6% sides clear).
export const SAFE = {
  top: 260,
  bottom: H - 670,
  left: 64,
  right: W - 64,
};
// Reels right-hand action column (like / comment / share / audio): keep text and key UI
// out of x > colX once below colY.
export const SAFE_COL = { x: 940, y: 980 };
export const SAFE_W = SAFE.right - SAFE.left;
export const SAFE_H = SAFE.bottom - SAFE.top;
export const SAFE_CX = W / 2;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

export const sec = (s: number) => Math.round(s * FPS);

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Progress 0..1 between two times (seconds) with an easing.
export const prog = (
  t: number,
  a: number,
  b: number,
  e: (x: number) => number = ease.out,
) => e(clamp01((t - a) / (b - a)));

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
