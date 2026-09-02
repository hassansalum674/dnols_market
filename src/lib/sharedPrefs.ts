export type SharedLanguage = "en" | "sw";
export type SharedTheme = "light" | "dark" | "system";

export type SharedPrefs = {
  theme?: SharedTheme;
  language?: SharedLanguage;
};

const COOKIE = "dnols.prefs";
const MAX_AGE = 60 * 60 * 24 * 365;

function cookieDomain(): string | undefined {
  const host = window.location.hostname;
  if (host === "dnols.com" || host.endsWith(".dnols.com")) return ".dnols.com";
  return undefined;
}

function sanitize(raw: unknown): SharedPrefs {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: SharedPrefs = {};
  if (o.theme === "light" || o.theme === "dark" || o.theme === "system") {
    out.theme = o.theme;
  }
  if (o.language === "en" || o.language === "sw") {
    out.language = o.language;
  }
  return out;
}

export function readSharedPrefs(): SharedPrefs {
  try {
    const prefix = `${COOKIE}=`;
    const match = document.cookie.split("; ").find((part) => part.startsWith(prefix));
    if (!match) return {};
    return sanitize(JSON.parse(decodeURIComponent(match.slice(prefix.length))));
  } catch {
    return {};
  }
}

export function writeSharedPrefs(patch: SharedPrefs): SharedPrefs {
  const next = { ...readSharedPrefs(), ...sanitize(patch) };
  const value = encodeURIComponent(JSON.stringify(next));
  const parts = [
    `${COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${MAX_AGE}`,
    "SameSite=Lax",
  ];
  if (window.location.protocol === "https:") parts.push("Secure");
  const domain = cookieDomain();
  if (domain) parts.push(`Domain=${domain}`);
  document.cookie = parts.join("; ");
  return next;
}

export function consumePrefsFromUrl(): SharedPrefs {
  const url = new URL(window.location.href);
  const fromUrl: SharedPrefs = {};
  const lang = url.searchParams.get("lang");
  const theme = url.searchParams.get("theme");
  if (lang === "en" || lang === "sw") fromUrl.language = lang;
  if (theme === "light" || theme === "dark" || theme === "system") {
    fromUrl.theme = theme;
  }
  if (!fromUrl.language && !fromUrl.theme) return {};
  const next = writeSharedPrefs(fromUrl);
  url.searchParams.delete("lang");
  url.searchParams.delete("theme");
  const qs = url.searchParams.toString();
  const nextUrl = `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
  return next;
}

export function withPrefsQuery(baseUrl: string, prefs: SharedPrefs): string {
  const url = new URL(baseUrl, window.location.origin);
  if (prefs.language) url.searchParams.set("lang", prefs.language);
  if (prefs.theme) url.searchParams.set("theme", prefs.theme);
  return url.toString();
}

export function languageToSeller(lang: SharedLanguage): "english" | "swahili" {
  return lang === "sw" ? "swahili" : "english";
}

export function languageFromSeller(pref: "english" | "swahili"): SharedLanguage {
  return pref === "swahili" ? "sw" : "en";
}
