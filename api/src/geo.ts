const EARTH_M = 6_371_000;

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

export function mapsHint(lat: number, lng: number, shopName: string): string {
  return `After payment: open Google Maps and search "${shopName}" or pin ${lat.toFixed(5)}, ${lng.toFixed(5)}. Pickup is in Kariakoo — ask for the stall by shop name, not street number.`;
}
