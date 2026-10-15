import { continueRender, delayRender, staticFile } from "remotion";

const faces: Array<[string, string, string]> = [
  ["Montserrat", "500", "Montserrat-500.ttf"],
  ["Montserrat", "600", "Montserrat-600.ttf"],
  ["Montserrat", "700", "Montserrat-700.ttf"],
  ["Montserrat", "800", "Montserrat-800.ttf"],
  ["Montserrat", "900", "Montserrat-900.ttf"],
  ["Poppins", "300", "Poppins-300.ttf"],
  ["Poppins", "400", "Poppins-400.ttf"],
  ["Poppins", "500", "Poppins-500.ttf"],
  ["Poppins", "600", "Poppins-600.ttf"],
  ["Poppins", "700", "Poppins-700.ttf"],
  ["Caveat", "600", "Caveat-600.woff2"],
  ["Caveat", "700", "Caveat-700.woff2"],
];

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("Loading brand fonts");
  Promise.all(
    faces.map(([family, weight, file]) => {
      const face = new FontFace(
        family,
        `url(${staticFile(`longstay/fonts/${file}`)}) format("${file.endsWith(".woff2") ? "woff2" : "truetype"}")`,
        { weight, style: "normal" },
      );
      return face.load().then((f) => {
        document.fonts.add(f);
      });
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
