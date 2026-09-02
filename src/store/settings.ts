import type { AppLanguage } from "../lib/i18n";

export type ThemeMode = "dark" | "light" | "system";
export type TextSize = "normal" | "large";

export type AppSettings = {
  theme: ThemeMode;
  textSize: TextSize;
  language: AppLanguage;
};

const KEY = "dnols.settings.v1";

const DEFAULTS: AppSettings = {
  theme: "light",
  textSize: "normal",
  language: "en",
};

const LIGHT_THEME_COLOR = "#ffffff";
const DARK_THEME_COLOR = "#0D0D0D";

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...loadSettings(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
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

  const apple = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  if (apple) {
    apple.setAttribute(
      "content",
      theme === "light" ? "default" : "black-translucent",
    );
  }
}

export function applySettings(s: AppSettings = loadSettings()) {
  const theme = resolvedTheme(s.theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.textSize = s.textSize;
  document.documentElement.lang = s.language === "sw" ? "sw" : "en";
  setThemeColor(theme);
}

export function initSettings() {
  applySettings();
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", () => {
    if (loadSettings().theme === "system") applySettings();
  });
}
