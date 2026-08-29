/**
 * Rasterize logo5_favicon.svg to PWA PNGs (same brand as buyer).
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandSrc = join(root, "..", "brand");
const svg = readFileSync(join(brandSrc, "logo5_favicon.svg"));

function render(size, dest) {
  const resvg = new Resvg(svg, {
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
  copyFileSync(join(brandSrc, name), join(root, "public", "brand", name));
}

console.log("Wrote shop PWA icons from brand/logo5_favicon.svg");
