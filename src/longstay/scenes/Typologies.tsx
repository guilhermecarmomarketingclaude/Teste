import React from "react";
import { AbsoluteFill } from "remotion";
import { C, clamp01, ease, mix } from "../brand";
import { Bar3D, Stage3D, Text3D, measure3D, useFont3D, wy } from "../components/Type3D";
import { PhotoCard3D, useTextures } from "../components/Photo3D";
import { wordTime } from "../data/timeline";

// "Do estúdio à moradia com piscina, há uma casa para cada orçamento." — a camera travelling past
// real HD Properties homes, one per typology (3D labels), then a wall of listings and a 3D caption.

const HERO = [
  { file: "longstay/v3/tex/studio_alcharb.jpg", label: "ESTÚDIO", pan: [0, 0] as [number, number] },
  { file: "longstay/v3/tex/t1_york_living.jpg", label: "T1", pan: [0.2, 0] as [number, number] },
  { file: "longstay/v3/tex/t2_talia_balcony.jpg", label: "T2", pan: [0, 0] as [number, number] },
  { file: "longstay/v3/tex/casa_azul_faro.jpg", label: "CASA", pan: [-0.1, 0] as [number, number] },
  { file: "longstay/v3/tex/villa_ria_pool.jpg", label: "MORADIA C/ PISCINA", pan: [0, 0] as [number, number] },
];
const TILES = Array.from({ length: 30 }).map((_, i) => `longstay/v3/tiles/t${String(i).padStart(2, "0")}.jpg`);
const SPACING = 820;
const CW = 560;
const CH = 720;
const CARD_Y = wy(900);
const WALL = { cols: 5, rows: 9, w: 300, h: 208, gap: 18, z: -900 };

export const Typologies: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  useFont3D();
  const tex = useTextures([...HERO.map((h) => h.file), ...TILES]);
  const est = wordTime("T01", "estúdio").a;
  const mor = wordTime("T01", "moradia").a;
  const pis = wordTime("T01", "piscina,").a;
  const ha = wordTime("T01", "há").a;
  const uma = wordTime("T01", "uma").a;
  const casa = wordTime("T01", "casa").a;
  const para = wordTime("T01", "para").a;
  const cada = wordTime("T01", "cada").a;
  const orc = wordTime("T01", "orçamento.").a;
  // ------------------------------------------------------------ camera
  const enter = ease.out(clamp01((t - t0) / 0.45));
  const whipA = mor - 0.12;
  const whipB = pis + 0.02;
  const whip = ease.inOut(clamp01((t - whipA) / (whipB - whipA)));
  const lastX = SPACING * (HERO.length - 1);
  const camX = mix(-900, 0, enter) + whip * lastX;
  const settle = clamp01((t - whipB) / (ha - whipB));
  const back = ease.inOut(clamp01((t - (ha - 0.05)) / 1.6));
  const outP = ease.in(clamp01((t - (t1 - 0.62)) / 0.62));
  const dolly = mix(-1400, 0, enter) + settle * 160 - back * 760 + outP * 3600;
  const yaw = Math.sin(t * 0.9) * 0.015 * (1 - back) + (1 - enter) * 0.08 - Math.sin(whip * Math.PI) * 0.05;
  const roll = (1 - enter) * 0.05 + Math.sin(whip * Math.PI) * -0.025;
  // ------------------------------------------------------------ hero cards and labels
  const passAt = (i: number) => (i === 0 ? est - 0.04 : i === HERO.length - 1 ? pis - 0.06 : mix(whipA, whipB, ease.inOut(i / (HERO.length - 1))) - 0.02);
  const labelSize = (txt: string) => Math.min(70, 70 * (740 / Math.max(1, measure3D(txt, 70))));
  // ------------------------------------------------------------ wall + caption
  const wallW = WALL.cols * WALL.w + (WALL.cols - 1) * WALL.gap;
  const wallH = WALL.rows * WALL.h + (WALL.rows - 1) * WALL.gap;
  const cap1 = "UMA CASA PARA";
  const cap2 = "CADA ORÇAMENTO";
  const s1 = Math.min(84, 84 * (680 / Math.max(1, measure3D(cap1, 84))));
  const s2 = Math.min(96, 96 * (720 / Math.max(1, measure3D(cap2, 96))));
  const capOn = [uma, uma, uma, -1, casa, casa, casa, casa, -1, para, para, para, para];
  const cap2On = [cada, cada, cada, cada, -1, orc, orc, orc, orc, orc, orc, orc, orc, orc];
  const pop = (on: number[]) => (i: number) => {
    const p = clamp01((t - (on[i] - 0.05 + (i % 6) * 0.01)) / 0.26);
    if (p <= 0) return null;
    return { rx: (1 - ease.back(p)) * -1.3, y: (1 - ease.out(p)) * -40, z: (1 - ease.out(p)) * 120, o: clamp01(p * 2.4) };
  };
  const plate = ease.back(clamp01((t - (uma - 0.12)) / 0.4));
  const fadeWhite = clamp01((t - (t1 - 0.2)) / 0.2);
  return (
    <AbsoluteFill style={{ opacity: clamp01((t - t0) / 0.12) }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #F3F7FB 0%, #E7EEF5 100%)" }} />
      {tex ? (
        <Stage3D cam={{ x: camX, dolly, yaw, roll, y: 0 }}>
          {/* the wall of listings, flipping in from the centre outwards */}
          {TILES.concat(TILES.slice(0, 15)).map((file, k) => {
            const c = k % WALL.cols;
            const r = Math.floor(k / WALL.cols);
            const x = lastX - wallW / 2 + WALL.w / 2 + c * (WALL.w + WALL.gap);
            const y = CARD_Y + wallH / 2 - WALL.h / 2 - r * (WALL.h + WALL.gap) + 60;
            const dist = Math.hypot(c - 2, (r - 4) * 0.8);
            const p = ease.out(clamp01((t - (ha - 0.15 + dist * 0.07)) / 0.45));
            if (p <= 0) return null;
            return (
              <PhotoCard3D
                key={k}
                tex={tex[file]}
                w={WALL.w}
                h={WALL.h}
                x={x}
                y={y}
                z={WALL.z - (1 - p) * 500}
                rx={(1 - p) * 1.2}
                rz={(1 - p) * (c % 2 ? 0.2 : -0.2)}
                o={p * mix(1, 0.62, plate)}
                border={8}
                radius={18}
                shadow={0.6}
              />
            );
          })}
          {/* hero typologies */}
          {HERO.map((h, i) => {
            const x = i * SPACING;
            const z = i % 2 ? -140 : 0;
            const off = ease.in(clamp01((t - (ha - 0.1 + i * 0.03)) / 0.5));
            const lp = clamp01((t - passAt(i)) / 0.3);
            const ls = labelSize(h.label);
            return (
              <group key={h.file}>
                <PhotoCard3D
                  tex={tex[h.file]}
                  w={CW}
                  h={CH}
                  x={x}
                  y={CARD_Y + off * 500}
                  z={z - off * 2600}
                  ry={(x - camX) * -0.00018}
                  rz={off * (i % 2 ? 0.3 : -0.3)}
                  pan={h.pan}
                  zoom={1.04 + clamp01((t - t0) / 4) * 0.08}
                  o={1 - clamp01((off - 0.45) / 0.4)}
                />
                {lp > 0 ? (
                  <Text3D
                    text={h.label}
                    size={ls}
                    depth={ls * 0.32}
                    face={C.ink}
                    side={C.blue}
                    x={x}
                    y={wy(455) + off * 600}
                    z={z + 90 - off * 2600}
                    fx={(li) => {
                      const p = clamp01((t - (passAt(i) + li * 0.018)) / 0.28);
                      if (p <= 0) return null;
                      return { rx: (1 - ease.back(p)) * -1.4, y: (1 - ease.out(p)) * -50, o: clamp01(p * 2.4) * (1 - clamp01((off - 0.3) / 0.4)) };
                    }}
                  />
                ) : null}
              </group>
            );
          })}
          {/* caption on a lit plate */}
          {plate > 0 ? (
            <group position={[lastX, 0, 120]}>
              <Bar3D x={-420} y={wy(892)} w={840} h={290 * plate} d={30} color={C.white} side={"#D8E2EB"} opacity={clamp01(plate * 2)} />
              <Text3D text={cap1} size={s1} depth={s1 * 0.28} face={C.ink} side={C.blue} y={wy(838)} z={30} fx={pop(capOn)} />
              <Text3D text={cap2} size={s2} depth={s2 * 0.3} face={C.blue} side={"#64636C"} y={wy(958)} z={30} fx={pop(cap2On)} />
            </group>
          ) : null}
        </Stage3D>
      ) : null}
      {fadeWhite > 0 ? <AbsoluteFill style={{ background: "#F3F7FB", opacity: fadeWhite }} /> : null}
    </AbsoluteFill>
  );
};
