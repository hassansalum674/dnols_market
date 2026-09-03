import sharp from "sharp";
import { readCdnWebp } from "./photos/cdn.js";

export type DescribeImage = {
  mime: "image/jpeg";
  b64: string;
};

const PHOTO_MAX = 2;
const JPEG_MAX_EDGE = 768;

/** Only accept local CDN ids — never fetch arbitrary URLs. */
export function cdnIdFromPhotoUrl(url: string): string | null {
  const raw = String(url ?? "").trim();
  if (/^[a-f0-9]{16,64}$/i.test(raw)) return raw.toLowerCase();
  try {
    const parsed = raw.includes("://") ? new URL(raw) : new URL(raw, "https://cdn.local");
    const fromPath = parsed.pathname.match(/\/cdn\/([a-f0-9]{16,64})\.webp$/i);
    if (fromPath?.[1]) return fromPath[1].toLowerCase();
  } catch {
    /* fall through */
  }
  return null;
}

export async function loadDescribeImages(photos: unknown): Promise<DescribeImage[]> {
  if (!Array.isArray(photos)) return [];
  const ids: string[] = [];
  for (const p of photos) {
    const id = cdnIdFromPhotoUrl(String(p ?? ""));
    if (id && !ids.includes(id)) ids.push(id);
    if (ids.length >= PHOTO_MAX) break;
  }

  const out: DescribeImage[] = [];
  for (const id of ids) {
    const webp = await readCdnWebp(id);
    if (!webp) continue;
    try {
      const jpeg = await sharp(webp)
        .rotate()
        .resize(JPEG_MAX_EDGE, JPEG_MAX_EDGE, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 72, mozjpeg: true })
        .toBuffer();
      if (jpeg.length < 80 || jpeg.length > 900_000) continue;
      out.push({ mime: "image/jpeg", b64: jpeg.toString("base64") });
    } catch {
      /* skip a broken file and keep going */
    }
  }
  return out;
}
