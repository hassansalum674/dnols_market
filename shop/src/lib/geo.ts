const EARTH_M = 6_371_000;
const KARIAKOO = { lat: -6.8224, lng: 39.2739 };

export type GeoFix = {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
  capturedAt: string;
  locationSource: "gps" | "kariakoo_fallback";
};

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(a))));
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/** Within ~1.5 km of the Kariakoo market pin. */
export function isNearKariakoo(lat: number, lng: number): boolean {
  return haversineMeters(lat, lng, KARIAKOO.lat, KARIAKOO.lng) <= 1500;
}

export function kariakooFallbackPin(): GeoFix {
  return {
    lat: KARIAKOO.lat,
    lng: KARIAKOO.lng,
    accuracyMeters: 80,
    capturedAt: new Date().toISOString(),
    locationSource: "kariakoo_fallback",
  };
}

export function captureStallLocation(): Promise<GeoFix> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "This device cannot share location. Stand at your stall on a phone and try again.",
        ),
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (!isValidLatLng(latitude, longitude)) {
          reject(
            new Error("Location reading was invalid. Try again at your stall."),
          );
          return;
        }
        resolve({
          lat: latitude,
          lng: longitude,
          accuracyMeters: Number.isFinite(accuracy)
            ? Math.round(accuracy)
            : null,
          capturedAt: new Date().toISOString(),
          locationSource: "gps",
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error(
              "Allow location so nearby buyers know where your products are.",
            ),
          );
        } else if (err.code === err.TIMEOUT) {
          reject(
            new Error(
              "Location timed out. Step outside the stall and try again.",
            ),
          );
        } else {
          reject(new Error("Could not read your stall location. Try again."));
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });
}
