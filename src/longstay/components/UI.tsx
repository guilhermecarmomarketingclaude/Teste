import React from "react";
import { C, FONT, clamp01, ease, mix } from "../brand";
import { ICheck } from "./Icons";

export const shadow = {
  card: "0 30px 60px -24px rgba(18,28,39,0.30), 0 10px 22px -12px rgba(18,28,39,0.18)",
  soft: "0 18px 40px -20px rgba(18,28,39,0.28)",
  chip: "0 10px 24px -12px rgba(18,28,39,0.25)",
};

// "02 ——— ONDE" editorial label from the management-service reel.
export const SectionLabel: React.FC<{ n: string; label: string; p: number; style?: React.CSSProperties; dark?: boolean }> = ({
  n,
  label,
  p,
  style,
  dark,
}) => {
  const e = ease.out(clamp01(p));
  if (e <= 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: "0.22em",
        color: dark ? "rgba(255,255,255,0.85)" : C.inkSoft,
        opacity: e,
        ...style,
      }}
    >
      <span style={{ color: dark ? "#FFFFFF" : C.blue, letterSpacing: "0.05em" }}>{n}</span>
      <span style={{ display: "block", height: 2, width: mix(0, 110, e), background: dark ? "#FFFFFF" : C.blue, borderRadius: 2 }} />
      <span style={{ transform: `translateX(${(1 - e) * 20}px)` }}>{label}</span>
    </div>
  );
};

export const Chip: React.FC<{
  label: string;
  icon?: React.ReactNode;
  active?: number; // 0..1 blue fill
  checked?: number; // 0..1 check mark
  appear?: number; // 0..1
  size?: number;
  style?: React.CSSProperties;
}> = ({ label, icon, active = 0, checked = 0, appear = 1, size = 30, style }) => {
  const a = ease.back(clamp01(appear));
  if (a <= 0.001) return null;
  const act = ease.out(clamp01(active));
  const chk = ease.back(clamp01(checked));
  const bg = `rgba(${Math.round(mix(255, 31, act))},${Math.round(mix(255, 166, act))},${Math.round(mix(255, 235, act))},${mix(0.92, 1, act)})`;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.38,
        padding: `${size * 0.42}px ${size * 0.75}px ${size * 0.42}px ${size * 0.55}px`,
        borderRadius: 999,
        background: bg,
        boxShadow: shadow.chip,
        border: `1.5px solid rgba(35,164,235,${mix(0.18, 0, act)})`,
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: size,
        color: act > 0.5 ? C.white : C.ink,
        transform: `scale(${mix(0.6, 1, a)})`,
        opacity: clamp01(appear * 3),
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon ? <span style={{ display: "flex", color: act > 0.5 ? C.white : C.blue }}>{icon}</span> : null}
      <span>{label}</span>
      {chk > 0 ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: size * 1.05,
            height: size * 1.05,
            borderRadius: 999,
            background: act > 0.5 ? C.white : C.blue,
            transform: `scale(${chk})`,
            marginLeft: size * 0.1,
          }}
        >
          <ICheck size={size * 0.7} color={act > 0.5 ? C.blue : C.white} stroke={3} />
        </span>
      ) : null}
    </div>
  );
};

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; radius?: number }> = ({
  style,
  children,
  radius = 34,
}) => (
  <div
    style={{
      background: C.white,
      borderRadius: radius,
      boxShadow: shadow.card,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Button: React.FC<{ label: string; press?: number; style?: React.CSSProperties; icon?: React.ReactNode; dark?: boolean }> = ({
  label,
  press = 0,
  style,
  icon,
  dark,
}) => {
  const pr = Math.sin(clamp01(press) * Math.PI);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "28px 46px",
        borderRadius: 999,
        background: dark ? C.ink : C.blue,
        color: C.white,
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 36,
        boxShadow: `0 ${mix(22, 8, pr)}px ${mix(40, 18, pr)}px -14px rgba(35,164,235,0.65)`,
        transform: `scale(${mix(1, 0.94, pr)})`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span>{label}</span>
      {icon}
    </div>
  );
};

// Expanding ring used for taps and pin pops.
export const Ripple: React.FC<{ p: number; size?: number; color?: string; style?: React.CSSProperties }> = ({
  p,
  size = 160,
  color = C.blue,
  style,
}) => {
  if (p <= 0 || p >= 1) return null;
  const e = ease.out(p);
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: 999,
        border: `${mix(6, 1, e)}px solid ${color}`,
        transform: `scale(${mix(0.2, 1, e)})`,
        opacity: 1 - e,
        ...style,
      }}
    />
  );
};
