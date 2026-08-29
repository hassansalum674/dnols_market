/**
 * Background removal via Remove.bg or Clipdrop API.
 * Set REMOVEBG_API_KEY or CLIPDROP_API_KEY in env.
 */

export type BgRemovalResult = {
  buffer: Buffer;
  provider: "removebg" | "clipdrop" | "fallback";
};

export async function removeBackground(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<BgRemovalResult> {
  const removeBgKey = process.env.REMOVEBG_API_KEY?.trim();
  if (removeBgKey) {
    const form = new FormData();
    form.append(
      "image_file",
      new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
      "upload.jpg",
    );
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
    form.append(
      "image_file",
      new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
      "upload.jpg",
    );
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
