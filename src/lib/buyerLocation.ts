import { isValidLatLng } from "./geo";

const KEY = "dnols.buyer.location.v1";

export type BuyerLocation = {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  capturedAt: string;
};

export function loadBuyerLocation(): BuyerLocation | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuyerLocation;
    if (!isValidLatLng(parsed.lat, parsed.lng)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveBuyerLocation(loc: BuyerLocation): BuyerLocation {
  try {
    localStorage.setItem(KEY, JSON.stringify(loc));
  } catch {
    /* ignore quota */
  }
  return loc;
}

export function requestBuyerLocation(): Promise<BuyerLocation | null> {
  const cached = loadBuyerLocation();
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(cached);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (!isValidLatLng(latitude, longitude)) {
          resolve(cached);
          return;
        }
        resolve(
          saveBuyerLocation({
            lat: latitude,
            lng: longitude,
            accuracyMeters: Number.isFinite(accuracy)
              ? Math.round(accuracy)
              : undefined,
            capturedAt: new Date().toISOString(),
          }),
        );
      },
      () => resolve(cached),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  });
}
