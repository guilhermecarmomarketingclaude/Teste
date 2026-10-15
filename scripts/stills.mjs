// Render a list of frames as PNG stills (one bundle) for quick visual review.
// usage: node scripts/stills.mjs out/dir 30,60,90 [safe]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [outDir, framesArg, safe] = process.argv.slice(2);
const frames = framesArg.split(",").map((x) => parseInt(x, 10));
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => c });
const inputProps = { mix: "", showSafeZone: safe === "safe" };
const browserExecutable = process.env.REMOTION_CHROME;
const composition = await selectComposition({ serveUrl, id: "LongStay", inputProps, browserExecutable, chromiumOptions: { gl: "swangle" } });
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, inputProps, browserExecutable, chromiumOptions: { gl: "swangle" }, scale: 0.5 });
  console.log("rendered", output);
}
