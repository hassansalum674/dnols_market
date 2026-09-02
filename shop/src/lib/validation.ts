import type { MobileMoneyProvider } from "../types";
import { MOBILE_MONEY_PROVIDERS } from "../types";

/** 9 local digits starting with 6 or 7 (strips +255 / leading 0). */
export function tzLocalDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("255")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  if (!d || (d[0] !== "6" && d[0] !== "7")) return "";
  return d.slice(0, 9);
}

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

/** Normalize to 9 local digits, strip leading +255 or 0 */
export function normalizeTzPhone(raw: string): string {
  const local = tzLocalDigits(raw);
  if (local) return local;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255") && digits.length >= 12) {
    return digits.slice(3);
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return digits.slice(1);
  }
  return digits;
}

/** Format as +255 6XX XXX XXX for display */
export function formatTzPhone(raw: string): string {
  const d = tzLocalDigits(raw) || normalizeTzPhone(raw);
  if (!d) return "+255";
  return `+255 ${formatTzLocalMask(d)}`;
}

/** Validate Tanzanian mobile: 9 digits starting with 6 or 7 */
export function isValidTzPhone(raw: string): boolean {
  return /^[67]\d{8}$/.test(tzLocalDigits(raw));
}

export function validateNida(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return /^\d{20}$/.test(digits);
}

export function validateMobileMoneyNumber(
  raw: string,
  provider: MobileMoneyProvider,
): boolean {
  if (!isValidTzPhone(raw)) return false;
  const d = normalizeTzPhone(raw);
  const prefix = "0" + d.slice(0, 2);
  const config = MOBILE_MONEY_PROVIDERS.find((p) => p.id === provider);
  if (!config) return false;
  return config.prefixes.some((p) => prefix.startsWith(p.slice(0, 3)));
}

export function parseTzsPrice(raw: string): number {
  return Number(raw.replace(/[^\d]/g, "")) || 0;
}

export function formatTzsInput(n: number): string {
  if (!n) return "";
  return n.toLocaleString("en-TZ");
}
