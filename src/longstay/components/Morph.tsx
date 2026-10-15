// Shape morphing: every shape is resampled to N points by arc length, starting at
// its top-centre and going clockwise, so point-wise interpolation stays untwisted.
export type Pt = [number, number];
export type ShapeKind = "rect" | "circle" | "house" | "arch" | "screen" | "wide" | "full";

const N = 120;

const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, steps: number): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
};

// Rounded rectangle outline starting at top-centre, clockwise (screen coords, y down).
const roundRect = (cx: number, cy: number, w: number, h: number, r: number): Pt[] => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  r = Math.min(r, w / 2, h / 2);
  const P: Pt[] = [[cx, y0], [x1 - r, y0]];
  P.push(...arcPts(x1 - r, y0 + r, r, -Math.PI / 2, 0, 12));
  P.push([x1, y1 - r]);
  P.push(...arcPts(x1 - r, y1 - r, r, 0, Math.PI / 2, 12));
  P.push([x0 + r, y1]);
  P.push(...arcPts(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, 12));
  P.push([x0, y0 + r]);
  P.push(...arcPts(x0 + r, y0 + r, r, Math.PI, (Math.PI * 3) / 2, 12));
  P.push([cx, y0]);
  return P;
};

const ellipse = (cx: number, cy: number, w: number, h: number): Pt[] => {
  const P: Pt[] = [];
  for (let i = 0; i <= 96; i++) {
    const a = -Math.PI / 2 + (i / 96) * Math.PI * 2;
    P.push([cx + (Math.cos(a) * w) / 2, cy + (Math.sin(a) * h) / 2]);
  }
  return P;
};

// House: walls + pitched roof with the logo's ~58° slope, softened corners.
const house = (cx: number, cy: number, w: number, h: number): Pt[] => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y1 = cy + h / 2;
  const apexY = cy - h / 2;
  const eaveY = apexY + (w / 2) * 0.62;
  const r = 34;
  const P: Pt[] = [[cx, apexY], [x1, eaveY], [x1, y1 - r]];
  P.push(...arcPts(x1 - r, y1 - r, r, 0, Math.PI / 2, 10));
  P.push([x0 + r, y1]);
  P.push(...arcPts(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, 10));
  P.push([x0, eaveY], [cx, apexY]);
  return P;
};

// Arch: flat bottom, semicircular top.
const arch = (cx: number, cy: number, w: number, h: number): Pt[] => {
  const r = w / 2;
  const x0 = cx - r;
  const x1 = cx + r;
  const y1 = cy + h / 2;
  const topC = cy - h / 2 + r;
  const P: Pt[] = [];
  P.push(...arcPts(cx, topC, r, -Math.PI / 2, 0, 40));
  P.push([x1, y1 - 30]);
  P.push(...arcPts(x1 - 30, y1 - 30, 30, 0, Math.PI / 2, 8));
  P.push([x0 + 30, y1]);
  P.push(...arcPts(x0 + 30, y1 - 30, 30, Math.PI / 2, Math.PI, 8));
  P.push([x0, topC]);
  P.push(...arcPts(cx, topC, r, Math.PI, (Math.PI * 3) / 2, 40));
  return P;
};

const resample = (poly: Pt[], n: number): Pt[] => {
  const seg: number[] = [];
  let total = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    const d = Math.hypot(poly[i + 1][0] - poly[i][0], poly[i + 1][1] - poly[i][1]);
    seg.push(d);
    total += d;
  }
  const out: Pt[] = [];
  let si = 0;
  let acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (k / n) * total;
    while (si < seg.length - 1 && acc + seg[si] < target) {
      acc += seg[si];
      si++;
    }
    const f = seg[si] > 0 ? (target - acc) / seg[si] : 0;
    const a = poly[si];
    const b = poly[si + 1];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
};

export type ShapeSpec = { kind: ShapeKind; cx: number; cy: number; w: number; h: number; r?: number };

export const shapePts = (s: ShapeSpec): Pt[] => {
  let poly: Pt[];
  switch (s.kind) {
    case "circle":
      poly = ellipse(s.cx, s.cy, s.w, s.h);
      break;
    case "house":
      poly = house(s.cx, s.cy, s.w, s.h);
      break;
    case "arch":
      poly = arch(s.cx, s.cy, s.w, s.h);
      break;
    default:
      poly = roundRect(s.cx, s.cy, s.w, s.h, s.r ?? 48);
  }
  return resample(poly, N);
};

export const lerpPts = (a: Pt[], b: Pt[], p: number): Pt[] => a.map((q, i) => [q[0] + (b[i][0] - q[0]) * p, q[1] + (b[i][1] - q[1]) * p]);

export const toPath = (pts: Pt[]) => `M${pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" L")} Z`;

export const bbox = (pts: Pt[]) => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};
