/**
 * PWA PNGs from the brand favicon artwork (logo5_favicon.png).
 * SVGs are copied as given — this does not restyle the d.
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
const art = readFileSync(join(root, "brand", "logo5_favicon.png"));
const artHref = `data:image/png;base64,${art.toString("base64")}`;

function render(size, dest) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <image width="512" height="512" href="${artHref}"/>
</svg>`;
  const resvg = new Resvg(Buffer.from(svg), {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  });
  writeFileSync(dest, resvg.render().asPng());
}

const icons = join(root, "public", "icons");
mkdirSync(icons, { recursive: true });
mkdirSync(join(root, "public", "brand"), { recursive: true });

render(16, join(root, "public", "icons", "favicon-16.png"));
render(32, join(root, "public", "favicon.png"));
render(180, join(root, "public", "apple-touch-icon.png"));
render(192, join(root, "public", "icons", "icon-192.png"));
render(512, join(root, "public", "icons", "icon-512.png"));
render(512, join(root, "public", "icons", "icon-maskable-512.png"));

for (const name of [
  "logo1_primary.svg",
  "logo3_wordmark.svg",
  "logo4_submark.svg",
  "logo5_favicon.svg",
  "logo6_dark.svg",
]) {
  copyFileSync(join(root, "brand", name), join(root, "public", "brand", name));
}

console.log("Wrote PWA icons from brand/logo5_favicon.png (original artwork)");

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
