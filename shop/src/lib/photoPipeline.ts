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

import { apiBase } from "./apiBase";

const BASE = apiBase();

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
function photoFetchError(cause: unknown): Error {
  const msg = cause instanceof Error ? cause.message : String(cause);
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return new Error(
      "Cannot reach the photo server. The API at dnols-83jj.onrender.com may be offline — redeploy the marketplace API (root directory: api) on Render, then try again.",
    );
  }
  return cause instanceof Error ? cause : new Error(msg || "Photo processing failed");
}

export async function processProductPhoto(
  file: File,
  mode: PhotoProcessMode,
): Promise<PhotoPipelineResult> {
  const beforeUrl = filePreviewUrl(file);
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);

  let res: Response;
  try {
    res = await fetch(`${BASE}/photos/process`, {
      method: "POST",
      body: form,
    });
  } catch (e) {
    revokePreviewUrl(beforeUrl);
    throw photoFetchError(e);
  }

  const body = (await res.json().catch(() => ({}))) as ProcessedPhoto & {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    revokePreviewUrl(beforeUrl);
    if (res.status === 404) {
      throw new Error(
        "Photo API not found (404). Redeploy dnols_market/api on Render — the service is currently running the wrong app.",
      );
    }
    throw new Error(body.message || body.error || `Photo processing failed (${res.status})`);
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
