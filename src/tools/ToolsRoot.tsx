import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { Logo, LOGO_BOX } from "../longstay/components/Logo";
import { loadFonts } from "../longstay/fonts";

loadFonts();

// Full-colour logo on a transparent plate, used to model the watermark in the client's footage.
const LogoPlate: React.FC<{ width: number }> = ({ width }) => (
  <AbsoluteFill>
    <Logo width={width} id="plate" />
  </AbsoluteFill>
);

const PW = 3300;
export const ToolsRoot: React.FC = () => (
  <Composition
    id="LogoPlate"
    component={LogoPlate}
    durationInFrames={1}
    fps={30}
    width={PW}
    height={Math.ceil((PW * LOGO_BOX.h) / LOGO_BOX.w)}
    defaultProps={{ width: PW }}
  />
);
