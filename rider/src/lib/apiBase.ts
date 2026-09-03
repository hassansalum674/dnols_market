/** Production API on Render — used when VITE_API_URL is missing at build time */
export const PRODUCTION_API_URL = "https://dnols-83jj.onrender.com";

export function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.PROD) return PRODUCTION_API_URL;
  return "/api";
}
