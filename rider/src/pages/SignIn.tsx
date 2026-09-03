import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { consumeAuthError, riderAuthErrorCode } from "../lib/authActions";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";

export function SignInPage() {
  const { t, lang, setLang } = useI18n();
  const { signInWithGoogle, configured, loading } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [err, setErr] = useState<string | null>(() => consumeAuthError());

  async function google() {
    setErr(null);
    setGoogleBusy(true);
    try {
      const method = await signInWithGoogle();
      if (method === "redirect") return;
    } catch (e) {
      const code = riderAuthErrorCode(e);
      if (code === "auth/unauthorized-domain") setErr(t("authDomain"));
      else if (code === "auth/operation-not-allowed") setErr(t("googleAuthOff"));
      else setErr(e instanceof Error ? e.message : t("signInFailed"));
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="page rider-signin">
      <div className="rider-signin-card">
        <BrandLogo height={32} />
        <h1 className="stall-page-title">{t("signInTitle")}</h1>
        <p className="hint">{t("signInHint")}</p>

        <div className="chip-grid" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`chip ${lang === "en" ? "selected" : ""}`}
            onClick={() => setLang("en")}
          >
            {t("english")}
          </button>
          <button
            type="button"
            className={`chip ${lang === "sw" ? "selected" : ""}`}
            onClick={() => setLang("sw")}
          >
            {t("swahili")}
          </button>
        </div>

        <button
          type="button"
          className="btn-google"
          disabled={googleBusy || loading || !configured}
          onClick={() => void google()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {googleBusy ? t("signingIn") : t("continueGoogle")}
        </button>

        {err && <p className="err">{err}</p>}
      </div>
    </div>
  );
}
