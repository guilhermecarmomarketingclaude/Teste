import React from "react";
import { AbsoluteFill } from "remotion";
import { H, SAFE, SAFE_COL, W } from "../brand";

// Review aid: Instagram Reels ad UI footprint (never rendered in the deliverable).
// Top: account/"Patrocinado" bar; bottom 35%: caption, CTA button, audio; sides 6%;
// right column: like / comment / share / more / audio from ~51% height down.
export const SafeZoneOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: SAFE.top, background: "rgba(255,0,80,0.2)" }} />
    <div style={{ position: "absolute", left: 0, top: SAFE.bottom, width: W, height: H - SAFE.bottom, background: "rgba(255,0,80,0.2)" }} />
    <div style={{ position: "absolute", left: 0, top: SAFE.top, width: SAFE.left, height: SAFE.bottom - SAFE.top, background: "rgba(255,0,80,0.2)" }} />
    <div style={{ position: "absolute", left: SAFE.right, top: SAFE.top, width: W - SAFE.right, height: SAFE_COL.y - SAFE.top, background: "rgba(255,0,80,0.2)" }} />
    <div style={{ position: "absolute", left: SAFE_COL.x, top: SAFE_COL.y, width: W - SAFE_COL.x, height: SAFE.bottom - SAFE_COL.y, background: "rgba(255,0,80,0.2)" }} />
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ position: "absolute", left: W - 112, top: 1000 + i * 132, width: 72, height: 72, borderRadius: 36, border: "3px solid rgba(255,0,80,0.7)" }} />
    ))}
    <div style={{ position: "absolute", left: 40, top: SAFE.bottom + 140, width: 760, height: 60, borderRadius: 12, border: "3px solid rgba(255,0,80,0.7)" }} />
    <div style={{ position: "absolute", left: 40, top: SAFE.bottom + 230, width: 900, height: 110, borderRadius: 16, border: "3px solid rgba(255,0,80,0.7)" }} />
    <div style={{ position: "absolute", left: 40, top: H - 210, width: W - 80, height: 96, borderRadius: 16, border: "3px solid rgba(255,0,80,0.7)" }} />
  </AbsoluteFill>
);
