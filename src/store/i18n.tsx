import { createContext, useContext, useMemo, useState } from "react";
import { BUYER_COPY, type BuyerCopy } from "../lib/i18n";
import {
  loadSettings,
  saveSettings,
  type AppSettings,
  type PreferredLanguage,
} from "./settings";

type I18nValue = {
  settings: AppSettings;
  language: PreferredLanguage;
  t: BuyerCopy;
  patch: (next: Partial<AppSettings>) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);

  const value = useMemo<I18nValue>(
    () => ({
      settings,
      language: settings.language,
      t: BUYER_COPY[settings.language],
      patch: (next) => setSettings(saveSettings(next)),
    }),
    [settings],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
