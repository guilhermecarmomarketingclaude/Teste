// Render the transparent logo plate (tools entry) to PNG.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const out = process.argv[2];
const serveUrl = await bundle({ entryPoint: path.resolve("src/tools/index.ts"), webpackOverride: (c) => c });
const browserExecutable = process.env.REMOTION_CHROME;
const composition = await selectComposition({ serveUrl, id: "LogoPlate", inputProps: {}, browserExecutable });
await renderStill({ composition, serveUrl, output: out, frame: 0, imageFormat: "png", inputProps: {}, browserExecutable });
console.log("ok", out);
