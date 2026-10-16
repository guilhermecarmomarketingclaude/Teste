import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { C, clamp01, ease, mix } from "../brand";
import { Clip } from "../components/Media";
import { Logo } from "../components/Logo";
import { Bar3D, Stage3D, Text3D, measure3D, useFont3D, wy } from "../components/Type3D";
import { wordTime } from "../data/timeline";

// 0–3.84 s · scroll-stopper. Real drone footage of the coast; on "Pare." the frame freezes and drains
// to the brand's blue-grey, a real extruded "PARE." slams in, the line builds word by word in 3D and
// "À SEMANA." is struck through. The camera then flies through the type into the story.

const shake = (t: number, at: number, amp: number, dur: number, seed: string) => {
  const d = t - at;
  if (d < 0 || d > dur) return [0, 0];
  const k = (1 - d / dur) ** 2 * amp;
  const f = Math.floor(d * 60);
  return [(random(`${seed}x${f}`) - 0.5) * 2 * k, (random(`${seed}y${f}`) - 0.5) * 2 * k];
};

export const Hook3: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t1 }) => {
  useFont3D();
  const pare = wordTime("H01", "Pare.");
  const nao = wordTime("H01", "Não").a;
  const res = wordTime("H01", "reserve").a;
  const o = wordTime("H01", "o").a;
  const alg = wordTime("H01", "Algarve").a;
  const a = wordTime("H01", "à").a;
  const sem = wordTime("H01", "semana.");
  const hit = pare.a + 0.014;
  const strike = sem.b + 0.04;
  const out = t1 - 0.84; // camera fly-through starts

  // ---------------------------------------------------------------- background
  const frozen = t >= hit;
  const drain = clamp01((t - hit) / 0.12);
  const fly = ease.in(clamp01((t - out) / 0.84));
  const bgScale = t < hit ? mix(1.0, 1.05, t / hit) : mix(1.1, 1.16, clamp01((t - hit) / (out - hit))) * mix(1, 1.55, fly);
  const s1 = shake(t, hit, 26, 0.42, "h");
  const s2 = shake(t, strike, 12, 0.3, "s");
  const sx = s1[0] + s2[0];
  const sy = s1[1] + s2[1];

  // ---------------------------------------------------------------- 3D type
  const SP = 100 * (880 / Math.max(1, measure3D("PARE.", 100)));
  const S1 = Math.min(108, 100 * (900 / Math.max(1, measure3D("NÃO RESERVE", 100))));
  const S2 = S1;
  // kept within x 140–940 so it clears the Reels action column at the right
  const S3 = Math.min(150, 100 * (800 / Math.max(1, measure3D("À SEMANA.", 100))));
  // PARE.: flies in from the camera, lands on the voice, then steps up to make room
  const inP = clamp01(t / hit);
  const zIn = mix(1300, 0, ease.in(inP));
  const up = ease.inOut(clamp01((t - (nao - 0.12)) / 0.34));
  const squash = t > hit ? Math.sin(clamp01((t - hit) / 0.22) * Math.PI) * (1 - clamp01((t - hit) / 0.22)) : 0;
  const pareY = mix(wy(700), wy(522), up);
  const pareS = mix(1, 0.5, up) * (1 + squash * 0.07);
  // per-letter flip-in keyed to each spoken word
  const flip = (onsets: number[]) => (i: number) => {
    const at = onsets[i];
    if (at === undefined) return null;
    const p = clamp01((t - (at - 0.05 + (i % 7) * 0.012)) / 0.26);
    if (p <= 0) return null;
    const e = ease.back(p);
    return { rx: (1 - e) * -1.45, y: (1 - ease.out(p)) * -70, z: (1 - ease.out(p)) * 160, o: clamp01(p * 2.2) };
  };
  const l1On = [nao, nao, nao, -1, res, res, res, res, res, res, res];
  const l2On = [o, -1, alg, alg, alg, alg, alg, alg, alg];
  const l3On = [a, -1, sem.a, sem.a, sem.a, sem.a, sem.a, sem.a, sem.a];
  // struck: the letters lose their footing
  const broke = clamp01((t - strike) / 0.7);
  const l3fx = (i: number) => {
    const base = flip(l3On)(i);
    if (!base || broke <= 0) return base;
    const k = ease.in(broke);
    return {
      ...base,
      y: (base.y ?? 0) - k * (40 + random(`d${i}`) * 90),
      rz: (random(`r${i}`) - 0.5) * 0.5 * k,
      rx: (base.rx ?? 0) + (random(`q${i}`) - 0.3) * 0.6 * k,
      o: (base.o ?? 1) * mix(1, 0.5, k),
    };
  };
  const w3 = measure3D("À SEMANA.", S3);
  const strikeP = ease.out(clamp01((t - strike) / 0.13));
  const logoIn = ease.out(clamp01((t - 0.25) / 0.5)) * (1 - fly);
  const flash = clamp01((t - (t1 - 0.16)) / 0.14);
  return (
    <AbsoluteFill style={{ background: "#0E2A3D", overflow: "hidden" }}>
      {/* footage: moving until the word lands, then frozen and drained to the brand blue-grey */}
      <AbsoluteFill
        style={{
          transform: `translate(${sx}px, ${sy}px) scale(${bgScale})`,
          filter: frozen ? `grayscale(${drain}) brightness(${mix(1, 0.52, drain)}) contrast(${mix(1, 1.18, drain)})${fly > 0.02 ? ` blur(${fly * 10}px)` : ""}` : "none",
        }}
      >
        {!frozen ? <Clip src="longstay/v3/clips/c_golf_drone.mp4" at={0} dur={hit + 0.05} /> : null}
        {frozen ? <Img src={staticFile("longstay/v3/img/hook_freeze.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.blue, mixBlendMode: "multiply", opacity: 0.62 * drain }} />
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(8,26,40,0.55) 0%, rgba(8,26,40,0) 28%, rgba(8,26,40,0) 62%, rgba(8,26,40,0.7) 100%)",
          opacity: drain,
        }}
      />
      {/* impact flash on the word */}
      {t >= hit && t < hit + 0.16 ? <AbsoluteFill style={{ background: "#fff", opacity: (1 - (t - hit) / 0.16) * 0.55 }} /> : null}
      <Stage3D cam={{ x: -sx * 0.6 - 90, y: sy * 0.6 - 140, dolly: fly * 2900, pitch: 0.035, yaw: -0.025 + fly * 0.08, roll: fly * -0.05 }}>
        <Text3D
          text="PARE."
          size={SP}
          depth={SP * 0.34}
          bevel={SP * 0.025}
          face={C.white}
          side={C.blue}
          y={pareY}
          z={zIn}
          rx={mix(-0.35, 0, ease.out(inP)) + Math.sin(t * 1.3) * 0.02}
          ry={Math.sin(t * 1.7) * 0.05}
          scale={pareS}
        />
        <Text3D text="NÃO RESERVE" size={S1} depth={S1 * 0.3} face={C.white} side={C.blue} y={wy(690)} fx={flip(l1On)} ry={Math.sin(t * 1.5 + 1) * 0.04} />
        <Text3D text="O ALGARVE" size={S2} depth={S2 * 0.3} face={C.white} side={C.blue} y={wy(822)} fx={flip(l2On)} ry={Math.sin(t * 1.5 + 2) * 0.04} />
        <Text3D text="À SEMANA." size={S3} depth={S3 * 0.3} face={C.blue} side={"#64636C"} y={wy(952)} fx={l3fx} ry={Math.sin(t * 1.5 + 3) * 0.04} />
        <Bar3D x={-w3 / 2 - 30} y={wy(952) - 6} z={S3 * 0.24} w={(w3 + 60) * strikeP} h={S3 * 0.12} d={S3 * 0.18} rz={-0.07} color={C.white} side={C.blue} opacity={strikeP > 0 ? 1 : 0} />
      </Stage3D>
      {/* brand mark, quiet, from the first second */}
      <div style={{ position: "absolute", left: 540 - 70, top: 290, opacity: logoIn * 0.95 }}>
        <Logo width={140} monochrome="#FFFFFF" id="hooklogo" />
      </div>
      {flash > 0 ? <AbsoluteFill style={{ background: "#F3F7FB", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};
