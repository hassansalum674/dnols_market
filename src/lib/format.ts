export function formatTsh(n: number): string {
  return `TSh ${n.toLocaleString("en-TZ")}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)}km`;
}

export function PLACE_LABEL(): string {
  return "Kariakoo";
}
