export type ThemeMode = "dark" | "light" | "system";
export type TextSize = "normal" | "large";
export type PreferredLanguage = "english" | "swahili";

export const PREFERRED_LANGUAGES: {
  id: PreferredLanguage;
  native: string;
  htmlLang: string;
}[] = [
  { id: "english", native: "English", htmlLang: "en" },
  { id: "swahili", native: "Kiswahili", htmlLang: "sw" },
];

export type AppSettings = {
  theme: ThemeMode;
  textSize: TextSize;
  language: PreferredLanguage;
};

const KEY = "dnols.settings.v1";

const DEFAULTS: AppSettings = {
  theme: "dark",
  textSize: "normal",
  language: "english",
};

function isPreferredLanguage(value: unknown): value is PreferredLanguage {
  return value === "english" || value === "swahili";
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULTS,
      ...parsed,
      language: isPreferredLanguage(parsed.language)
        ? parsed.language
        : DEFAULTS.language,
    };
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
  document.documentElement.lang =
    PREFERRED_LANGUAGES.find((l) => l.id === s.language)?.htmlLang ?? "en";
}

export function initSettings() {
  applySettings();
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", () => {
    if (loadSettings().theme === "system") applySettings();
  });
}
