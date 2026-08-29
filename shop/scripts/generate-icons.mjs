/**
 * Rasterize logo5_favicon.svg to PWA PNGs (same brand as buyer).
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandSrc = join(root, "..", "brand");
const svg = readFileSync(join(brandSrc, "logo5_favicon.svg"), "utf8");

const LETTER = `
  <circle cx="256" cy="256" r="116" fill="#FFFFFF"/>
  <circle cx="256" cy="256" r="56" fill="#1A6FD4"/>
  <rect x="312" y="134" width="60" height="244" rx="8" fill="#FFFFFF"/>
`;

function render(source, size, dest) {
  const resvg = new Resvg(Buffer.from(source), {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  });
  writeFileSync(dest, resvg.render().asPng());
}

function maskableSvg() {
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

render(svg, 16, join(root, "public", "icons", "favicon-16.png"));
render(svg, 32, join(root, "public", "favicon.png"));
render(svg, 180, join(root, "public", "apple-touch-icon.png"));
render(svg, 192, join(root, "public", "icons", "icon-192.png"));
render(svg, 512, join(root, "public", "icons", "icon-512.png"));
render(maskableSvg(), 512, join(root, "public", "icons", "icon-maskable-512.png"));

for (const name of [
  "logo1_primary.svg",
  "logo3_wordmark.svg",
  "logo4_submark.svg",
  "logo5_favicon.svg",
  "logo6_dark.svg",
]) {
  copyFileSync(join(brandSrc, name), join(root, "public", "brand", name));
}

console.log("Wrote shop PWA icons from brand/logo5_favicon.svg");
