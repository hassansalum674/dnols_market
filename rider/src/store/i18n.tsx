import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  interpolate,
  translate,
  type AppLanguage,
  type RiderMsg,
} from "../lib/i18n";
import { loadSettings, saveSettings } from "./settings";

type I18nState = {
  lang: AppLanguage;
  t: (key: RiderMsg) => string;
  tf: (key: RiderMsg, vars: Record<string, string | number>) => string;
  setLang: (lang: AppLanguage) => void;
};

const Ctx = createContext<I18nState | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLanguage>(
    () => loadSettings().language,
  );

  useEffect(() => {
    const sync = () => setLangState(loadSettings().language);
    window.addEventListener("dnols-settings", sync);
    return () => window.removeEventListener("dnols-settings", sync);
  }, []);

  const setLang = useCallback((next: AppLanguage) => {
    saveSettings({ language: next });
    setLangState(next);
  }, []);

  const value = useMemo<I18nState>(
    () => ({
      lang,
      setLang,
      t: (key) => translate(lang, key),
      tf: (key, vars) => interpolate(translate(lang, key), vars),
    }),
    [lang, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
