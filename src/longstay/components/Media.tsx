import React from "react";
import { OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";

// A pre-cut clip that starts at ad-time `at` (seconds). Clips are short, pre-cropped H.264 files
// in public/longstay/v3/clips; `rate` < 1 slows them down for a calmer, more cinematic pace.
export const Clip: React.FC<{
  src: string;
  at: number;
  dur: number;
  rate?: number;
  startAt?: number;
  style?: React.CSSProperties;
}> = ({ src, at, dur, rate = 1, startAt = 0, style }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} durationInFrames={Math.max(1, Math.round(dur * fps))} layout="none">
      <OffthreadVideo
        src={staticFile(src)}
        muted
        playbackRate={rate}
        startFrom={Math.round(startAt * fps)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }}
      />
    </Sequence>
  );
};
