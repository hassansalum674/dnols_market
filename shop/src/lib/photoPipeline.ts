export type PhotoProcessMode = "cover" | "detail";

export type ProcessedPhoto = {
  cdnUrl: string;
  cdnId: string;
  width: number;
  height: number;
  mode: PhotoProcessMode;
  provider: string;
  sizeKb: number;
};

export type PhotoPipelineResult = {
  beforeUrl: string;
  after: ProcessedPhoto;
};

const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

/** Read file as object URL for before preview — never persisted as listing photo */
export function filePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string): void {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

/**
 * Process a product photo through the server pipeline.
 * Raw uploads are never returned to buyers — only CDN URLs from this call.
 */
export async function processProductPhoto(
  file: File,
  mode: PhotoProcessMode,
): Promise<PhotoPipelineResult> {
  const beforeUrl = filePreviewUrl(file);
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);

  const res = await fetch(`${BASE}/photos/process`, {
    method: "POST",
    body: form,
  });

  const body = (await res.json().catch(() => ({}))) as ProcessedPhoto & {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    revokePreviewUrl(beforeUrl);
    throw new Error(body.message || body.error || "Photo processing failed");
  }

  return { beforeUrl, after: body };
}

/** Returns true if URL is a CDN-served processed image (safe for buyers) */
export function isCdnPhoto(url: string): boolean {
  return url.includes("/cdn/") && url.endsWith(".webp");
}
