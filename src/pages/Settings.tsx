import { Link } from "react-router-dom";
import { useState } from "react";
import {
  loadSettings,
  saveSettings,
  type TextSize,
  type ThemeMode,
} from "../store/settings";
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
        <p className="field-label">Theme</p>
        <div className="sheet-options">
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
              className={`sheet-chip ${settings.theme === value ? "on" : ""}`}
              onClick={() => patchTheme(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="field-label">Text size</p>
        <div className="sheet-options">
          {(
            [
              ["normal", "Normal"],
              ["large", "Large"],
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
          <h2>Account</h2>
          <div className="settings-row">
            <span className="muted">Signed in as</span>
            <strong>{user.email}</strong>
          </div>
          <button type="button" className="btn ghost account-menu-btn" onClick={() => void signOut()}>
            Sign out
          </button>
        </section>
      )}

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
