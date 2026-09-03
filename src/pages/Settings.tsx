import { Link } from "react-router-dom";
import { useState } from "react";
import { LanguagePicker } from "../components/LanguagePicker";
import {
  loadSettings,
  saveSettings,
  type TextSize,
  type ThemeMode,
} from "../store/settings";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { saveProfile } from "../lib/profile";
import { InstallAppSettings } from "../components/InstallApp";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [settings, setSettings] = useState(loadSettings);

  function patchTheme(theme: ThemeMode) {
    setSettings(saveSettings({ theme }));
  }

  function patchTextSize(textSize: TextSize) {
    setSettings(saveSettings({ textSize }));
  }

  return (
    <div className="page account-page">
      <div className="account-top">
        <Link to="/you" className="back-link">
          ← {t("myAccount")}
        </Link>
        <h1>{t("settings")}</h1>
      </div>

      <section className="account-section">
        <h2>{t("language")}</h2>
        <p className="section-desc">{t("languageHint")}</p>
        <LanguagePicker
          value={lang}
          onChange={(next) => {
            setLang(next);
            if (user) saveProfile(user.uid, { language: next });
          }}
        />
      </section>

      <section className="account-section">
        <h2>{t("appearance")}</h2>
        <p className="section-desc">Theme and text size apply across the app.</p>
        <p className="field-label">{t("theme")}</p>
        <div className="sheet-options">
          {(
            [
              ["light", t("light")],
              ["dark", t("dark")],
              ["system", t("system")],
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
        <p className="field-label">{t("textSize")}</p>
        <div className="sheet-options">
          {(
            [
              ["normal", t("normal")],
              ["large", t("large")],
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

      <InstallAppSettings />

      {user && (
        <section className="account-section">
          <h2>{t("account")}</h2>
          <nav className="account-menu" aria-label={t("account")}>
            <Link to="/you/profile" className="account-menu-item">
              {t("editProfile")}
            </Link>
          </nav>
          <button type="button" className="btn ghost account-menu-btn" onClick={() => void signOut()}>
            {t("signOut")}
          </button>
        </section>
      )}

      <section className="account-section">
        <h2>{t("legal")}</h2>
        <nav className="account-menu" aria-label="Legal">
          <Link to="/terms" className="account-menu-item">
            Terms of Use
          </Link>
          <Link to="/privacy" className="account-menu-item">
            Privacy Policy
          </Link>
        </nav>
      </section>

      <section className="account-section">
        <h2>Privacy & escrow</h2>
        <p className="section-desc">
          Dnols holds buyer payments in escrow until in-person handover at Kariakoo.
          Your name, email, and order history are kept only for pickup verification
          and dispute resolution. Sellers never receive your payment until you confirm
          the item.
        </p>
      </section>
    </div>
  );
}
