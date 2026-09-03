import { useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { BrandLogo } from "../components/BrandLogo";
import {
  confirmRiderOtp,
  riderAuthErrorCode,
  sendRiderOtp,
} from "../lib/authActions";
import { formatTzMobile, isValidTzMobile } from "../lib/deliveryCloud";
import { useI18n } from "../store/i18n";
import type { RiderMsg } from "../lib/i18n";

function localDigits(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("255")) return d.slice(3);
  if (d.startsWith("0")) return d.slice(1);
  return d;
}

function errorKey(code: string): RiderMsg {
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
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const digits = localDigits(phone);
  const phoneReady = isValidTzMobile(phone);

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
      setErr(t(errorKey(riderAuthErrorCode(e))));
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
