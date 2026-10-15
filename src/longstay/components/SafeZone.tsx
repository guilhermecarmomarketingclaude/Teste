import React from "react";
import { AbsoluteFill } from "remotion";
import { H, SAFE, W } from "../brand";

// Review aid: Instagram Reels ad UI footprint (not rendered in the final file).
export const SafeZoneOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: SAFE.top, background: "rgba(255,0,80,0.18)" }} />
    <div style={{ position: "absolute", left: 0, top: SAFE.bottom, width: W, height: H - SAFE.bottom, background: "rgba(255,0,80,0.18)" }} />
    <div style={{ position: "absolute", left: 0, top: SAFE.top, width: SAFE.left, height: SAFE.bottom - SAFE.top, background: "rgba(255,0,80,0.18)" }} />
    <div style={{ position: "absolute", left: SAFE.right, top: SAFE.top, width: W - SAFE.right, height: SAFE.bottom - SAFE.top, background: "rgba(255,0,80,0.18)" }} />
    {/* right-hand action column */}
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ position: "absolute", left: W - 104, top: 1010 + i * 118, width: 64, height: 64, borderRadius: 32, border: "3px solid rgba(255,0,80,0.6)" }} />
    ))}
    <div style={{ position: "absolute", left: 40, right: 140, top: H - 330, height: 70, borderRadius: 14, border: "3px solid rgba(255,0,80,0.6)" }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: H - 220, height: 96, borderRadius: 14, border: "3px solid rgba(255,0,80,0.6)" }} />
  </AbsoluteFill>
);
