/**
 * Background removal via FAPIhub (preferred), Remove.bg, or Clipdrop.
 * Set FAPIAPI_API_KEY on Render for FAPIhub.
 */

export type BgRemovalResult = {
  buffer: Buffer;
  provider: "fapihub" | "removebg" | "clipdrop" | "fallback";
  /** True when FAPIhub already applied a white background */
  whiteBackground?: boolean;
};

function imageBlob(imageBuffer: Buffer, mimeType: string): Blob {
  return new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
}

async function fapihubRemoveBackground(
  apiKey: string,
  imageBuffer: Buffer,
  mimeType: string,
  whiteBackground: boolean,
): Promise<BgRemovalResult> {
  const form = new FormData();
  form.append("image", imageBlob(imageBuffer, mimeType), "upload.jpg");

  const endpoint = whiteBackground
    ? "https://fapihub.com/v2/rembg/color/"
    : "https://fapihub.com/v2/rembg/";

  if (whiteBackground) {
    form.append("bgcolor", "(255, 255, 255, 255)");
  } else {
    form.append("model", "falcon");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { ApiKey: apiKey },
    body: form,
  });

  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    return { buffer: buf, provider: "fapihub", whiteBackground };
  }

  const err = await res.text().catch(() => "");
  throw new Error(`FAPIhub failed (${res.status}): ${err.slice(0, 200)}`);
}

export async function removeBackground(
  imageBuffer: Buffer,
  mimeType: string,
  options: { whiteBackground?: boolean } = {},
): Promise<BgRemovalResult> {
  const whiteBackground = options.whiteBackground ?? false;

  const fapiKey = process.env.FAPIAPI_API_KEY?.trim();
  if (fapiKey) {
    return fapihubRemoveBackground(fapiKey, imageBuffer, mimeType, whiteBackground);
  }

  const removeBgKey = process.env.REMOVEBG_API_KEY?.trim();
  if (removeBgKey) {
    const form = new FormData();
    form.append("image_file", imageBlob(imageBuffer, mimeType), "upload.jpg");
    form.append("size", "auto");
    form.append("format", "png");
    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": removeBgKey },
      body: form,
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { buffer: buf, provider: "removebg" };
    }
    const err = await res.text().catch(() => "");
    throw new Error(`Remove.bg failed (${res.status}): ${err.slice(0, 200)}`);
  }

  const clipdropKey = process.env.CLIPDROP_API_KEY?.trim();
  if (clipdropKey) {
    const form = new FormData();
    form.append("image_file", imageBlob(imageBuffer, mimeType), "upload.jpg");
    const res = await fetch("https://clipdrop-api.co/remove-background/v1", {
      method: "POST",
      headers: { "x-api-key": clipdropKey },
      body: form,
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { buffer: buf, provider: "clipdrop" };
    }
    const err = await res.text().catch(() => "");
    throw new Error(`Clipdrop failed (${res.status}): ${err.slice(0, 200)}`);
  }

  return { buffer: imageBuffer, provider: "fallback" };
}
