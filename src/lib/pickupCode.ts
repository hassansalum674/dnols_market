/** 6-character checkout code: mixed upper, lower, and digits (no ambiguous 0/O/1/l). */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generatePickupCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]!;
  }
  return code;
}

export function isValidPickupCode(code: string | undefined): boolean {
  if (!code || code.length !== 6) return false;
  return [...code].every((c) => CHARS.includes(c));
}
