/** Tanzania mobile numbers: +255 plus 9 digits starting with 6 or 7. */

export function tzLocalDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("255")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  if (!d || (d[0] !== "6" && d[0] !== "7")) return "";
  return d.slice(0, 9);
}

/** Local mask: 6XX XXX XXX / 7XX XXX XXX */
export function formatTzLocalMask(local: string): string {
  const d = tzLocalDigits(local);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function toTzE164(raw: string): string {
  const local = tzLocalDigits(raw);
  return local ? `+255${local}` : "";
}

export function normalizeTzPhone(raw: string): string {
  const local = tzLocalDigits(raw);
  if (local) return `+255${local}`;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255")) return `+${digits}`;
  if (digits.startsWith("0")) return `+255${digits.slice(1)}`;
  if (digits.length === 9) return `+255${digits}`;
  return raw.trim();
}

export function isValidTzPhone(raw: string): boolean {
  return /^[67]\d{8}$/.test(tzLocalDigits(raw));
}

export function formatTzPhoneDisplay(raw: string): string {
  const local = tzLocalDigits(raw);
  if (!local) return "";
  return `+255 ${formatTzLocalMask(local)}`;
}
