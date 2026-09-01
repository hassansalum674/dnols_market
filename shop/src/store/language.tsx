import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyLanguage, loadLanguage, saveLanguage } from "../storage";
import type { PreferredLanguage } from "../types";

type ShopCopy = {
  today: string;
  stock: string;
  orders: string;
  shop: string;
  place: string;
  hours: string;
  days: string;
  open: string;
  close: string;
  hoursHint: string;
  payout: string;
  sendPayout: string;
  nothingToPayout: string;
  sentPayout: (amount: string) => string;
  releasedAfter: string;
  alreadyMocked: string;
  switchBuying: string;
  buyerPwa: string;
  language: string;
  languageHint: string;
  apiChecking: string;
  apiUp: string;
  apiDown: string;
  dar: string;
  defaultPlaceHint: string;
  mockPayoutNote: string;
  tabAria: string;
};

const COPY: Record<PreferredLanguage, ShopCopy> = {
  english: {
    today: "Today",
    stock: "Stock",
    orders: "Orders",
    shop: "Shop",
    place: "Place",
    hours: "Hours",
    days: "Days",
    open: "Open",
    close: "Close",
    hoursHint: "Hours stay on this device only.",
    payout: "Payout",
    sendPayout: "Send payout",
    nothingToPayout: "Nothing to pay out until a handover lands.",
    sentPayout: (amount) => `Sent ${amount} (stub).`,
    releasedAfter: "Released after handover",
    alreadyMocked: "Already mocked out",
    switchBuying: "Switch to buying",
    buyerPwa: "Opens the buyer PWA at",
    language: "Language",
    languageHint: "English and Kiswahili for this stall app.",
    apiChecking: "API …",
    apiUp: "API up on :8787",
    apiDown: "API down — start api/",
    dar: "Dar es Salaam",
    defaultPlaceHint:
      "Shop-only cluster. Exact stall pin stays off buyer listings until they pay.",
    mockPayoutNote: "Mock mobile-money payout to stall wallet.",
    tabAria: "Shop",
  },
  swahili: {
    today: "Leo",
    stock: "Bidhaa",
    orders: "Oda",
    shop: "Duka",
    place: "Eneo",
    hours: "Saa",
    days: "Siku",
    open: "Fungua",
    close: "Funga",
    hoursHint: "Saa zinabaki kwenye kifaa hiki tu.",
    payout: "Malipo",
    sendPayout: "Tuma malipo",
    nothingToPayout: "Hakuna cha kulipa hadi bidhaa ikabidhiwe.",
    sentPayout: (amount) => `Imetumwa ${amount} (jaribio).`,
    releasedAfter: "Inatolewa baada ya kuwasilisha",
    alreadyMocked: "Tayari zimelipwa (jaribio)",
    switchBuying: "Nenda kununua",
    buyerPwa: "Inafungua PWA ya mnunuzi kwenye",
    language: "Lugha",
    languageHint: "English na Kiswahili kwa programu hii ya duka.",
    apiChecking: "API …",
    apiUp: "API inafanya kazi kwenye :8787",
    apiDown: "API imezima — anzisha api/",
    dar: "Dar es Salaam",
    defaultPlaceHint:
      "Kundi la maduka pekee. Pin halisi ya duka haionekani kwa wanunuzi hadi walipie.",
    mockPayoutNote: "Malipo ya jaribio ya simu kwenda pochi ya duka.",
    tabAria: "Duka",
  },
};

type LanguageContextValue = {
  language: PreferredLanguage;
  setLanguage: (language: PreferredLanguage) => void;
  t: ShopCopy;
  locale: string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<PreferredLanguage>(loadLanguage);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (next) => {
        setLanguageState(saveLanguage(next));
      },
      t: COPY[language],
      locale: language === "swahili" ? "sw-TZ" : "en-TZ",
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
