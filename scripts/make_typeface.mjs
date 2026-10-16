// Convert a TTF to a three.js typeface JSON (FontLoader format) + kerning pairs, for 3D titles.
// usage: node scripts/make_typeface.mjs in.ttf out.json
import opentype from "opentype.js";
import fs from "node:fs";

const [inp, out] = process.argv.slice(2);
const font = opentype.loadSync(inp);
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
  "ÀÁÂÃÇÉÊÍÓÔÕÚàáâãçéêíóôõú" +
  " .,:;!?%+-−–—·'’\"()/&€°#@";
const scale = (1000 * 100) / ((font.unitsPerEm || 2048) * 72);
const r = (v) => Math.round(v * scale);
const result = {
  glyphs: {},
  kern: {},
  familyName: font.names.fontFamily.en,
  ascender: r(font.ascender),
  descender: r(font.descender),
  underlinePosition: r(font.tables.post.underlinePosition),
  underlineThickness: r(font.tables.post.underlineThickness),
  boundingBox: { xMin: r(font.tables.head.xMin), yMin: r(font.tables.head.yMin), xMax: r(font.tables.head.xMax), yMax: r(font.tables.head.yMax) },
  resolution: 1000,
  original_font_information: { fullName: font.names.fullName?.en ?? "" },
};
const glyphs = {};
for (const ch of CHARS) {
  const g = font.charToGlyph(ch === "−" ? "−" : ch);
  if (!g || g.index === 0) {
    console.warn("missing", ch);
    continue;
  }
  glyphs[ch] = g;
  let o = "";
  for (const c of g.path.commands) {
    const t = c.type.toLowerCase() === "c" ? "b" : c.type.toLowerCase();
    o += t + " ";
    if (c.x !== undefined) o += r(c.x) + " " + r(c.y) + " ";
    if (c.x1 !== undefined) o += r(c.x1) + " " + r(c.y1) + " ";
    if (c.x2 !== undefined) o += r(c.x2) + " " + r(c.y2) + " ";
  }
  const bb = g.getBoundingBox();
  result.glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o };
}
for (const a of Object.keys(glyphs)) {
  for (const b of Object.keys(glyphs)) {
    const k = font.getKerningValue(glyphs[a], glyphs[b]);
    if (k) result.kern[a + b] = r(k);
  }
}
fs.writeFileSync(out, JSON.stringify(result));
console.log(out, Object.keys(result.glyphs).length, "glyphs", Object.keys(result.kern).length, "kern pairs");
