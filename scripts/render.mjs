// Render the LongStay composition to MP4.
// usage: node scripts/render.mjs out.mp4 [crf] [composition id] [concurrency] [mix wav in public/]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [out, crfArg, compArg, concArg, mixArg] = process.argv.slice(2);
const crf = crfArg ? parseInt(crfArg, 10) : 18;
const concurrency = concArg ? parseInt(concArg, 10) : 4;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => c });
const inputProps = { showSafeZone: false, mix: mixArg || "longstay/mix/mix3.wav" };
const browserExecutable = process.env.REMOTION_CHROME;
const chromiumOptions = { gl: "swangle" };
const composition = await selectComposition({ serveUrl, id: compArg || "LongStay", inputProps, browserExecutable, chromiumOptions });
let last = -1;
const t0 = Date.now();
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf,
  x264Preset: "medium",
  pixelFormat: "yuv420p",
  audioCodec: "aac",
  audioBitrate: "320k",
  outputLocation: out,
  inputProps,
  browserExecutable,
  chromiumOptions,
  concurrency,
  onProgress: ({ progress, renderedFrames, encodedFrames, stitchStage }) => {
    const p = Math.floor(progress * 100);
    if (p !== last) {
      last = p;
      const el = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`${p}% rendered=${renderedFrames} encoded=${encodedFrames} stage=${stitchStage} t=${el}s`);
    }
  },
});
console.log("done", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
