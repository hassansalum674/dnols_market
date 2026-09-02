import { Link } from "react-router-dom";
import { useState } from "react";
import {
  loadSettings,
  saveSettings,
  type TextSize,
  type ThemeMode,
} from "../store/settings";
import { UserAvatar } from "../components/UserAvatar";
import { userDisplayName } from "../lib/userDisplay";
import { loadProfile } from "../lib/profile";
import { formatTzPhoneDisplay } from "../lib/phone";
import { useAuth } from "../store/auth";

export function SettingsPage() {
  const { user, signOut } = useAuth();
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
          ← My Account
        </Link>
        <h1>Settings</h1>
      </div>

      <section className="account-section">
        <h2>Appearance</h2>
        <p className="section-desc">Theme and text size apply across the app.</p>
        <p className="field-label" id="settings-theme">Theme</p>
        <div className="sheet-options" role="radiogroup" aria-labelledby="settings-theme">
          {(
            [
              ["dark", "Dark"],
              ["light", "Light"],
              ["system", "System"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={settings.theme === value}
              className={`sheet-chip ${settings.theme === value ? "on" : ""}`}
              onClick={() => patchTheme(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="field-label" id="settings-text">Text size</p>
        <div className="sheet-options" role="radiogroup" aria-labelledby="settings-text">
          {(
            [
              ["normal", "Normal"],
              ["large", "Large"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={settings.textSize === value}
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
          <h2>Account</h2>
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
            Sign out
          </button>
        </section>
      )}

      <section className="account-section">
        <h2>Location</h2>
        <p className="section-desc">
          Each time you open Dnols, the app reads your location in the background
          and compares it with each stall pin. That difference is the distance
          shown on products. Exact stall coordinates stay hidden until you pay.
        </p>
      </section>

      <section className="account-section">
        <h2>Legal</h2>
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
