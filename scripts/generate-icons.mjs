/**
 * Rasterize the centered favicon mark to PWA PNGs.
 * Maskable icons get a 20% safe zone so Android squircles do not crop the d.
 */
import { Resvg } from "@resvg/resvg-js";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mark = readFileSync(join(root, "brand", "logo5_favicon.svg"), "utf8");

/** White d only — keep in sync with brand/logo5_favicon.svg */
const LETTER = `
  <circle cx="256" cy="256" r="116" fill="#FFFFFF"/>
  <circle cx="256" cy="256" r="56" fill="#1A6FD4"/>
  <rect x="312" y="134" width="60" height="244" rx="8" fill="#FFFFFF"/>
`;

function raster(svg, size, dest) {
  const resvg = new Resvg(Buffer.from(svg), {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  });
  writeFileSync(dest, resvg.render().asPng());
}

function maskableSvg() {
  // Android maskable safe zone is the inner 80%. Scale the d to ~72% so
  // squircles/circles do not crop the stem (which reads as a left-shifted d).
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#1A6FD4"/>
  <g transform="translate(256 256) scale(0.72) translate(-256 -256)">
    ${LETTER}
  </g>
</svg>`;
}

const icons = join(root, "public", "icons");
mkdirSync(icons, { recursive: true });
mkdirSync(join(root, "public", "brand"), { recursive: true });

raster(mark, 16, join(root, "public", "icons", "favicon-16.png"));
raster(mark, 32, join(root, "public", "favicon.png"));
raster(mark, 180, join(root, "public", "apple-touch-icon.png"));
raster(mark, 192, join(root, "public", "icons", "icon-192.png"));
raster(mark, 512, join(root, "public", "icons", "icon-512.png"));
raster(maskableSvg(), 512, join(root, "public", "icons", "icon-maskable-512.png"));

for (const name of [
  "logo1_primary.svg",
  "logo3_wordmark.svg",
  "logo4_submark.svg",
  "logo5_favicon.svg",
  "logo6_dark.svg",
]) {
  copyFileSync(join(root, "brand", name), join(root, "public", "brand", name));
}

console.log("Wrote PWA icons from brand/logo5_favicon.svg (centered d, maskable safe zone)");

const fontDest = join(root, "public", "fonts");
mkdirSync(fontDest, { recursive: true });
const fontSrc = join(
  root,
  "node_modules",
  "@fontsource",
  "playfair-display",
  "files",
);
for (const f of [
  "playfair-display-latin-400-normal.woff2",
  "playfair-display-latin-700-normal.woff2",
]) {
  const from = join(fontSrc, f);
  if (existsSync(from)) copyFileSync(from, join(fontDest, f));
}
console.log("Copied Playfair Display latin 400/700 into public/fonts");
