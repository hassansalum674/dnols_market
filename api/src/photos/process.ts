import sharp, { type Metadata, type Sharp } from "sharp";
import { removeBackground } from "./removeBg.js";

const MIN_COVER_PX = 800;
const MAX_KB = 500;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

export type ProcessMode = "cover" | "detail";

export type ProcessResult = {
  buffer: Buffer;
  width: number;
  height: number;
  provider: string;
  mode: ProcessMode;
};

/** Find bounding box of non-transparent pixels for centering */
async function subjectBounds(png: Buffer): Promise<{
  left: number;
  top: number;
  width: number;
  height: number;
}> {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const alpha = channels === 4 ? data[i + 3] : 255;
      if (alpha > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return { left: 0, top: 0, width, height };
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.08);
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const right = Math.min(width - 1, maxX + pad);
  const bottom = Math.min(height - 1, maxY + pad);
  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

async function toWebpUnderLimit(
  pipeline: Sharp,
  maxKb = MAX_KB,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let quality = 85;
  let buffer: Buffer;
  let meta: Metadata;

  do {
    buffer = await pipeline.clone().webp({ quality }).toBuffer();
    meta = await sharp(buffer).metadata();
    quality -= 8;
  } while (buffer.length > maxKb * 1024 && quality > 35);

  return {
    buffer,
    width: meta.width ?? MIN_COVER_PX,
    height: meta.height ?? MIN_COVER_PX,
  };
}

export async function processCoverPhoto(
  input: Buffer,
  mimeType: string,
): Promise<ProcessResult> {
  const { buffer: cutout, provider } = await removeBackground(input, mimeType);

  let subject: Buffer;
  if (provider === "fallback") {
    subject = await sharp(input)
      .resize(MIN_COVER_PX, MIN_COVER_PX, {
        fit: "cover",
        position: "centre",
      })
      .flatten({ background: WHITE })
      .png()
      .toBuffer();
  } else {
    const bounds = await subjectBounds(cutout);
    const cropped = await sharp(cutout)
      .extract(bounds)
      .png()
      .toBuffer();

    const side = Math.max(bounds.width, bounds.height, MIN_COVER_PX);
    subject = await sharp(cropped)
      .resize(side, side, {
        fit: "contain",
        background: WHITE,
        position: "centre",
      })
      .flatten({ background: WHITE })
      .png()
      .toBuffer();
  }

  if ((await sharp(subject).metadata()).width! < MIN_COVER_PX) {
    subject = await sharp(subject)
      .resize(MIN_COVER_PX, MIN_COVER_PX, {
        fit: "contain",
        background: WHITE,
        position: "centre",
      })
      .png()
      .toBuffer();
  }

  const pipeline = sharp(subject).resize(MIN_COVER_PX, MIN_COVER_PX, {
    fit: "cover",
    position: "centre",
  });

  const { buffer, width, height } = await toWebpUnderLimit(pipeline);

  if (width < MIN_COVER_PX || height < MIN_COVER_PX) {
    throw new Error(`Cover image must be at least ${MIN_COVER_PX}×${MIN_COVER_PX}px after crop.`);
  }

  return { buffer, width, height, provider, mode: "cover" };
}

export async function processDetailPhoto(input: Buffer): Promise<ProcessResult> {
  const meta = await sharp(input).metadata();
  let pipeline = sharp(input);

  const maxDim = 1600;
  if ((meta.width ?? 0) > maxDim || (meta.height ?? 0) > maxDim) {
    pipeline = pipeline.resize(maxDim, maxDim, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const { buffer, width, height } = await toWebpUnderLimit(pipeline);

  return { buffer, width, height, provider: "none", mode: "detail" };
}
