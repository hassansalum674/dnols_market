import { useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { BrandLogo } from "../components/BrandLogo";
import {
  confirmRiderOtp,
  consumeAuthError,
  riderAuthErrorCode,
  sendRiderOtp,
} from "../lib/authActions";
import { formatTzMobile, isValidTzMobile } from "../lib/deliveryCloud";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import type { RiderMsg } from "../lib/i18n";

function localDigits(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("255")) return d.slice(3);
  if (d.startsWith("0")) return d.slice(1);
  return d;
}

function errorKey(code: string, message = ""): RiderMsg {
  if (
    code === "auth/billing-not-enabled" ||
    /billing|blaze|spark/i.test(`${code} ${message}`)
  ) {
    return "sparkSms";
  }
  if (code === "auth/invalid-phone-number") return "badPhone";
  if (code === "auth/too-many-requests") return "tooManyCodes";
  if (code === "auth/unauthorized-domain") return "authDomain";
  if (code === "auth/operation-not-allowed") return "phoneAuthOff";
  if (
    code === "auth/captcha-check-failed" ||
    code === "auth/invalid-app-credential" ||
    code === "auth/admin-restricted-operation"
  ) {
    return "captchaFailed";
  }
  return "signInFailed";
}

export function SignInPage() {
  const { t, tf, lang, setLang } = useI18n();
  const { signInWithGoogle, configured, loading } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [err, setErr] = useState<string | null>(() => consumeAuthError());

  const digits = localDigits(phone);
  const phoneReady = isValidTzMobile(phone);

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

  async function send() {
    setErr(null);
    if (!phoneReady) {
      setErr(t("badPhone"));
      return;
    }
    setBusy(true);
    try {
      const next = await sendRiderOtp(phone);
      setConfirm(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setErr(t(errorKey(riderAuthErrorCode(e), msg)));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!confirm) return;
    setErr(null);
    setBusy(true);
    try {
      await confirmRiderOtp(confirm, code);
    } catch {
      setErr(t("badCode"));
    } finally {
      setBusy(false);
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

        <p className="auth-divider">
          <span>{t("orUsePhone")}</span>
        </p>
        <p className="hint">{t("sparkSms")}</p>

        {!confirm ? (
          <>
            <label className="lbl" htmlFor="rider-phone">
              {t("phoneNumber")}
            </label>
            <input
              id="rider-phone"
              className="field"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("phoneHint")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="hint">
              {digits.length === 0
                ? t("phoneHint")
                : phoneReady
                  ? formatTzMobile(phone)
                  : tf("phoneCount", { n: digits.length })}
            </p>
            <button className="btn" disabled={busy} onClick={() => void send()}>
              {busy ? t("sendingCode") : t("sendCode")}
            </button>
          </>
        ) : (
          <>
            <label className="lbl" htmlFor="rider-otp">
              {t("otpLabel")}
            </label>
            <input
              id="rider-otp"
              className="field"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="btn" disabled={busy} onClick={() => void verify()}>
              {busy ? t("verifying") : t("verify")}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setConfirm(null);
                setCode("");
              }}
            >
              {t("changeNumber")}
            </button>
          </>
        )}
        {err && <p className="err">{err}</p>}
      </div>
    </div>
  );
}
