export type ThemeMode = "dark" | "light" | "system";
export type TextSize = "normal" | "large";

export type AppSettings = {
  theme: ThemeMode;
  textSize: TextSize;
};

const KEY = "dnols.settings.v1";

const DEFAULTS: AppSettings = {
  theme: "dark",
  textSize: "normal",
};

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

export function applySettings(s: AppSettings = loadSettings()) {
  const theme = resolvedTheme(s.theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.textSize = s.textSize;
}

export function initSettings() {
  applySettings();
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", () => {
    if (loadSettings().theme === "system") applySettings();
  });
}
