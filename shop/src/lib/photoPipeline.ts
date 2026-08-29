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

  const after = {
    ...body,
    cdnUrl: resolveApiUrl(body.cdnUrl),
  };

  return { beforeUrl, after };
}

/** Resolve relative CDN paths when API is on a different host than the PWA */
export function resolveApiUrl(url: string): string {
  if (!url || url.startsWith("http") || url.startsWith("blob:")) return url;
  if (url.startsWith("/api/")) {
    const path = url.slice(4);
    return `${BASE}${path}`;
  }
  if (url.startsWith("/")) return `${BASE}${url}`;
  return url;
}

/** Returns true if URL is a CDN-served processed image (safe for buyers) */
export function isCdnPhoto(url: string): boolean {
  return /\/cdn\/[a-f0-9]+\.webp$/i.test(url);
}
