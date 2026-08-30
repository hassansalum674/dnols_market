/** Tanzania mobile money numbers (+255 7XX XXX XXX). */

export function normalizeTzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255")) return `+${digits}`;
  if (digits.startsWith("0")) return `+255${digits.slice(1)}`;
  if (digits.length === 9) return `+255${digits}`;
  return raw.trim();
}

export function isValidTzPhone(raw: string): boolean {
  const d = normalizeTzPhone(raw).replace(/\D/g, "");
  return /^2557\d{8}$/.test(d);
}

export function formatTzPhoneDisplay(raw: string): string {
  const d = normalizeTzPhone(raw).replace(/\D/g, "");
  if (!d.startsWith("255") || d.length < 12) return raw;
  const local = d.slice(3);
  return `+255 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}
