import "./index.css";
import { Composition } from "remotion";
import { LongStay } from "./longstay/LongStay";
import { TL } from "./longstay/data/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LongStay"
        component={LongStay}
        durationInFrames={Math.round(TL.duration * TL.fps)}
        fps={TL.fps}
        width={1080}
        height={1920}
        defaultProps={{ showSafeZone: false, mix: "longstay/mix/mix3.wav" }}
      />
      {/* preview: same film at 30 fps (half the frames to render) */}
      <Composition
        id="LongStay30"
        component={LongStay}
        durationInFrames={Math.round(TL.duration * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ showSafeZone: false, mix: "longstay/mix/mix3.wav" }}
      />
    </>
  );
};
