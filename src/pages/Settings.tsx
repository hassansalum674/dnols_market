import { Link } from "react-router-dom";
import { useState } from "react";
import {
  loadSettings,
  PREFERRED_LANGUAGES,
  saveSettings,
  type PreferredLanguage,
  type TextSize,
  type ThemeMode,
} from "../store/settings";
import { UserAvatar } from "../components/UserAvatar";
import { userDisplayName } from "../lib/userDisplay";
import { loadProfile } from "../lib/profile";
import { formatTzPhoneDisplay } from "../lib/phone";
import { useAuth } from "../store/auth";

const COPY: Record<
  PreferredLanguage,
  {
    back: string;
    title: string;
    appearance: string;
    appearanceDesc: string;
    theme: string;
    dark: string;
    light: string;
    system: string;
    textSize: string;
    normal: string;
    large: string;
    language: string;
    languageDesc: string;
    account: string;
    signOut: string;
    legal: string;
    terms: string;
    privacy: string;
    escrow: string;
    escrowDesc: string;
  }
> = {
  english: {
    back: "← My Account",
    title: "Settings",
    appearance: "Appearance",
    appearanceDesc: "Theme and text size apply across the app.",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
    textSize: "Text size",
    normal: "Normal",
    large: "Large",
    language: "Language",
    languageDesc: "English and Kiswahili for this app.",
    account: "Account",
    signOut: "Sign out",
    legal: "Legal",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    escrow: "Privacy & escrow",
    escrowDesc:
      "Dnols holds buyer payments in escrow until in-person handover at Kariakoo. Your name, email, and order history are kept only for pickup verification and dispute resolution. Sellers never receive your payment until you confirm the item.",
  },
  swahili: {
    back: "← Akaunti yangu",
    title: "Mipangilio",
    appearance: "Muonekano",
    appearanceDesc: "Mandhari na ukubwa wa maandishi hutumika kwenye programu nzima.",
    theme: "Mandhari",
    dark: "Giza",
    light: "Mwanga",
    system: "Mfumo",
    textSize: "Ukubwa wa maandishi",
    normal: "Kawaida",
    large: "Kubwa",
    language: "Lugha",
    languageDesc: "English na Kiswahili kwa programu hii.",
    account: "Akaunti",
    signOut: "Toka",
    legal: "Kisheria",
    terms: "Masharti ya Matumizi",
    privacy: "Sera ya Faragha",
    escrow: "Faragha na escrow",
    escrowDesc:
      "Dnols inashikilia malipo ya mnunuzi kwenye escrow hadi bidhaa ikabidhiwe ana kwa ana Kariakoo. Jina, barua pepe, na historia ya oda hutumika tu kuthibitisha uchukuaji na kutatua migogoro. Muuzaji hapokei malipo yako hadi uthibitishe bidhaa.",
  },
};

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState(loadSettings);
  const t = COPY[settings.language];

  function patchTheme(theme: ThemeMode) {
    setSettings(saveSettings({ theme }));
  }

  function patchTextSize(textSize: TextSize) {
    setSettings(saveSettings({ textSize }));
  }

  function patchLanguage(language: PreferredLanguage) {
    setSettings(saveSettings({ language }));
  }

  return (
    <div className="page account-page">
      <div className="account-top">
        <Link to="/you" className="back-link">
          {t.back}
        </Link>
        <h1>{t.title}</h1>
      </div>

      <section className="account-section">
        <h2>{t.language}</h2>
        <p className="section-desc">{t.languageDesc}</p>
        <div className="sheet-options" role="radiogroup" aria-label={t.language}>
          {PREFERRED_LANGUAGES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`sheet-chip ${settings.language === opt.id ? "on" : ""}`}
              aria-pressed={settings.language === opt.id}
              onClick={() => patchLanguage(opt.id)}
            >
              {opt.native}
            </button>
          ))}
        </div>
      </section>

      <section className="account-section">
        <h2>{t.appearance}</h2>
        <p className="section-desc">{t.appearanceDesc}</p>
        <p className="field-label">{t.theme}</p>
        <div className="sheet-options">
          {(
            [
              ["dark", t.dark],
              ["light", t.light],
              ["system", t.system],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`sheet-chip ${settings.theme === value ? "on" : ""}`}
              onClick={() => patchTheme(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="field-label">{t.textSize}</p>
        <div className="sheet-options">
          {(
            [
              ["normal", t.normal],
              ["large", t.large],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`sheet-chip ${settings.textSize === value ? "on" : ""}`}
              onClick={() => patchTextSize(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {user && (
        <section className="account-section">
          <h2>{t.account}</h2>
          <div className="settings-profile">
            <UserAvatar user={user} size="lg" />
            <div>
              <p className="account-name">{userDisplayName(user)}</p>
              {user.email && <p className="muted">{user.email}</p>}
              {loadProfile(user.uid).phone && (
                <p className="muted">
                  {formatTzPhoneDisplay(loadProfile(user.uid).phone!)}
                </p>
              )}
            </div>
          </div>
          <button type="button" className="btn ghost account-menu-btn" onClick={() => void signOut()}>
            {t.signOut}
          </button>
        </section>
      )}

      <section className="account-section">
        <h2>{t.legal}</h2>
        <nav className="account-menu" aria-label={t.legal}>
          <Link to="/terms" className="account-menu-item">
            {t.terms}
          </Link>
          <Link to="/privacy" className="account-menu-item">
            {t.privacy}
          </Link>
        </nav>
      </section>

      <section className="account-section">
        <h2>{t.escrow}</h2>
        <p className="section-desc">{t.escrowDesc}</p>
      </section>
    </div>
  );
}
