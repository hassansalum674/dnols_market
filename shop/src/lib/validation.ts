import type { MobileMoneyProvider } from "../types";
import { MOBILE_MONEY_PROVIDERS } from "../types";

/** Normalize to digits only, strip leading +255 or 0 */
export function normalizeTzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255") && digits.length >= 12) {
    return digits.slice(3);
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return digits.slice(1);
  }
  return digits;
}

/** Format as +255 XXX XXX XXX for display */
export function formatTzPhone(raw: string): string {
  const d = normalizeTzPhone(raw);
  if (d.length < 9) return raw;
  const nine = d.slice(0, 9);
  return `+255 ${nine.slice(0, 3)} ${nine.slice(3, 6)} ${nine.slice(6)}`;
}

/** Validate Tanzanian mobile: 9 digits starting with 6 or 7 */
export function isValidTzPhone(raw: string): boolean {
  const d = normalizeTzPhone(raw);
  return /^[67]\d{8}$/.test(d);
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
