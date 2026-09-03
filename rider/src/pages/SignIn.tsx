import { useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { BrandLogo } from "../components/BrandLogo";
import { confirmRiderOtp, sendRiderOtp } from "../lib/authActions";
import { isValidTzMobile } from "../lib/deliveryCloud";
import { useI18n } from "../store/i18n";

export function SignInPage() {
  const { t, lang, setLang } = useI18n();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    setErr(null);
    if (!isValidTzMobile(phone)) {
      setErr(t("badPhone"));
      return;
    }
    setBusy(true);
    try {
      const next = await sendRiderOtp(phone);
      setConfirm(next);
    } catch {
      setErr(t("signInFailed"));
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
    <div className="page stall-page">
      <header className="stall-page-head">
        <BrandLogo height={32} />
        <p className="muted stall-page-desc">{t("riderPortal")}</p>
      </header>
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
  );
}
