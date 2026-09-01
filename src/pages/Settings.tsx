import { Link } from "react-router-dom";
import {
  PREFERRED_LANGUAGES,
  type TextSize,
  type ThemeMode,
} from "../store/settings";
import { useI18n } from "../store/i18n";
import { UserAvatar } from "../components/UserAvatar";
import { userDisplayName, providerLabel } from "../lib/userDisplay";
import { loadProfile } from "../lib/profile";
import { formatTzPhoneDisplay } from "../lib/phone";
import { useAuth } from "../store/auth";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { settings, patch, t } = useI18n();
  const profile = user ? loadProfile(user.uid) : {};
  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "dark", label: t.dark },
    { value: "light", label: t.light },
    { value: "system", label: t.system },
  ];
  const textSizeOptions: { value: TextSize; label: string }[] = [
    { value: "normal", label: t.normal },
    { value: "large", label: t.large },
  ];

  return (
    <div className="page account-page settings-page">
      <div className="account-top">
        <Link to="/you" className="back-link">
          {t.backAccount}
        </Link>
        <h1>{t.settings}</h1>
      </div>

      {user ? (
        <header className="settings-hero">
          <UserAvatar user={user} size="xl" />
          <div className="settings-hero-body">
            <p className="settings-hero-name">{userDisplayName(user)}</p>
            {user.email && <p className="settings-hero-line">{user.email}</p>}
            {profile.phone && (
              <p className="settings-hero-line">
                {formatTzPhoneDisplay(profile.phone)}
              </p>
            )}
            <p className="settings-hero-meta">
              {t.signedInWith} {providerLabel(user.provider)}
            </p>
          </div>
          <button
            type="button"
            className="settings-hero-signout"
            onClick={() => void signOut()}
          >
            {t.signOut}
          </button>
        </header>
      ) : (
        <header className="settings-hero settings-hero--guest">
          <div className="settings-hero-body">
            <p className="settings-hero-name">{t.guest}</p>
            <p className="settings-hero-line">{t.signInToOrder}</p>
            <Link to="/signin" className="btn settings-hero-cta">
              {t.signIn}
            </Link>
          </div>
        </header>
      )}

      <section className="settings-card">
        <h2>{t.preferences}</h2>
        <p className="settings-card-desc">{t.languageDesc}</p>
        <p className="field-label">{t.language}</p>
        <div className="sheet-options" role="radiogroup" aria-label={t.language}>
          {PREFERRED_LANGUAGES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`sheet-chip ${settings.language === opt.id ? "on" : ""}`}
              aria-pressed={settings.language === opt.id}
              onClick={() => patch({ language: opt.id })}
            >
              {opt.native}
            </button>
          ))}
        </div>
        <p className="field-label">{t.theme}</p>
        <div className="sheet-options">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`sheet-chip ${settings.theme === opt.value ? "on" : ""}`}
              onClick={() => patch({ theme: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="field-label">{t.textSize}</p>
        <div className="sheet-options">
          {textSizeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`sheet-chip ${settings.textSize === opt.value ? "on" : ""}`}
              onClick={() => patch({ textSize: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-card">
        <h2>{t.account}</h2>
        <nav className="settings-rows" aria-label={t.account}>
          <Link to="/you" className="settings-row">
            <span>{t.myProfile}</span>
            <span className="account-links-chevron" aria-hidden>
              ›
            </span>
          </Link>
          <Link to="/orders" className="settings-row">
            <span>{t.orders}</span>
            <span className="account-links-chevron" aria-hidden>
              ›
            </span>
          </Link>
          <Link to="/you/saved" className="settings-row">
            <span>{t.savedItems}</span>
            <span className="account-links-chevron" aria-hidden>
              ›
            </span>
          </Link>
          {user && (
            <div className="settings-row settings-row--static">
              <span>{t.connectedAccounts}</span>
              <span className="settings-row-meta">{providerLabel(user.provider)}</span>
            </div>
          )}
        </nav>
      </section>

      <section className="settings-card">
        <h2>{t.legalNav}</h2>
        <nav className="settings-rows" aria-label={t.legalNav}>
          <Link to="/terms" className="settings-row">
            <span>{t.terms}</span>
            <span className="account-links-chevron" aria-hidden>
              ›
            </span>
          </Link>
          <Link to="/privacy" className="settings-row">
            <span>{t.privacy}</span>
            <span className="account-links-chevron" aria-hidden>
              ›
            </span>
          </Link>
        </nav>
        <p className="settings-card-note">{t.escrowDesc}</p>
      </section>
    </div>
  );
}
