import React from "react";
import { Img, staticFile } from "remotion";
import { FONT } from "../brand";

// White-bordered instant photo with a handwritten caption.
export const Polaroid: React.FC<{ src: string; w: number; caption?: string; style?: React.CSSProperties }> = ({ src, w, caption, style }) => (
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

