const PICSUM = "https://picsum.photos";

export type PhotoSize = "card" | "detail" | "thumb";

const DIM: Record<PhotoSize, number> = {
  card: 400,
  detail: 640,
  thumb: 96,
};

/** Build a picsum URL for listing seeds (card grid default). */
export function listingPhoto(seed: string, size: PhotoSize = "card"): string {
  const dim = DIM[size];
  return `${PICSUM}/seed/${encodeURIComponent(seed)}/${dim}/${dim}`;
}

/** Downscale an existing picsum URL to the size shown in the UI. */
export function photoUrl(url: string, size: PhotoSize = "card"): string {
  const m = url.match(/^https:\/\/picsum\.photos\/seed\/([^/]+)\/\d+\/\d+/);
  if (!m) return url;
  const dim = DIM[size];
  return `${PICSUM}/seed/${m[1]}/${dim}/${dim}`;
}
