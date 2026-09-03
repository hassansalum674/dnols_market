import type { AppLanguage } from "../lib/i18n";
import {
  consumePrefsFromUrl,
  readSharedPrefs,
  writeSharedPrefs,
} from "../lib/sharedPrefs";

export type ThemeMode = "dark" | "light" | "system";

export type AppSettings = {
  theme: ThemeMode;
  language: AppLanguage;
};

const KEY = "dnols.settings.v1";

const DEFAULTS: AppSettings = {
  theme: "light",
  language: "en",
};

const LIGHT_THEME_COLOR = "#ffffff";
const DARK_THEME_COLOR = "#0D0D0D";

function fromStorage(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<AppSettings>;
  } catch {
    return {};
  }
}

export function loadSettings(): AppSettings {
  const cookie = readSharedPrefs();
  return {
    ...DEFAULTS,
    ...fromStorage(),
    ...(cookie.theme ? { theme: cookie.theme } : {}),
    ...(cookie.language ? { language: cookie.language } : {}),
  };
}

function persist(next: AppSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  writeSharedPrefs({ theme: next.theme, language: next.language });
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...loadSettings(), ...patch };
  persist(next);
  applySettings(next);
  window.dispatchEvent(new Event("dnols-settings"));
  return next;
}

function resolvedTheme(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return mode;
}

function setThemeColor(theme: "dark" | "light") {
  const color = theme === "light" ? LIGHT_THEME_COLOR : DARK_THEME_COLOR;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (metas.length === 0) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    document.head.appendChild(meta);
    return;
  }
  metas.forEach((meta) => meta.setAttribute("content", color));
}

export function applySettings(s: AppSettings = loadSettings()) {
  const theme = resolvedTheme(s.theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = s.language === "sw" ? "sw" : "en";
  setThemeColor(theme);
}

export function initSettings() {
  consumePrefsFromUrl();
  const s = loadSettings();
  persist(s);
  applySettings(s);
}
