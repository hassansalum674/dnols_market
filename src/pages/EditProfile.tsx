import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguagePicker } from "../components/LanguagePicker";
import { ProfilePhotoUpload } from "../components/ProfilePhotoUpload";
import { SignInPanel } from "../components/SignInPanel";
import { publicAccountId } from "../lib/accountId";
import { notifyAvatarChange } from "../lib/avatar";
import {
  formatTzPhoneDisplay,
  isValidTzPhone,
  normalizeTzPhone,
} from "../lib/phone";
import { loadProfile, saveProfile } from "../lib/profile";
import { userDisplayName, userInitial } from "../lib/userDisplay";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";

const TOTAL_STEPS = 3;

export function EditProfilePage() {
  const { user, loading, signOut, updateDisplayName } = useAuth();
  const { lang, setLang, t, tf } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [savedFlash, setSavedFlash] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setStep(1);
      setName("");
      setPhone("");
      setPhoto(null);
      setErr(null);
      return;
    }
    const p = loadProfile(user.uid);
    setName(p.displayName?.trim() || user.displayName?.trim() || "");
    setPhone(p.phone ? formatTzPhoneDisplay(p.phone) : "");
    setPhoto(
      p.avatarDataUrl ?? (p.preferLetterAvatar ? null : user.photoURL) ?? null,
    );
    if (p.language) setLang(p.language);
    setStep(1);
    setErr(null);
  }, [user?.uid, setLang]);

  useEffect(() => {
    if (!user?.displayName) return;
    setName((cur) => cur.trim() || user.displayName!.trim());
  }, [user?.displayName]);

  useEffect(() => {
    if (!savedFlash) return;
    const tmr = setTimeout(() => setSavedFlash(false), 2000);
    return () => clearTimeout(tmr);
  }, [savedFlash]);

  async function persistPhoto(dataUrl: string | null) {
    if (!user) return;
    saveProfile(user.uid, {
      avatarDataUrl: dataUrl ?? "",
      preferLetterAvatar: !dataUrl,
    });
    setPhoto(dataUrl);
    notifyAvatarChange();
    setSavedFlash(true);
  }

  function persistLang(next: typeof lang) {
    setLang(next);
    if (user) saveProfile(user.uid, { language: next });
  }

  async function saveDetails() {
    if (!user) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErr(t("nameShort"));
      return;
    }
    if (phone.trim() && !isValidTzPhone(phone)) {
      setErr(t("phoneInvalid"));
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      saveProfile(user.uid, {
        displayName: trimmed,
        language: lang,
        ...(phone.trim() ? { phone: normalizeTzPhone(phone) } : {}),
      });
      try {
        await updateDisplayName(trimmed);
      } catch (e) {
        console.warn("Could not update Firebase display name", e);
      }
      notifyAvatarChange();
      navigate("/you", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  const accountId = user ? publicAccountId(user.uid) : null;

  return (
    <div className="page profile-onboard">
      <Link to="/you" className="back-link">
        ← {t("myAccount")}
      </Link>

      {loading ? (
        <p className="muted">{t("loading")}</p>
      ) : !user ? (
        <>
          <h1 className="onboarding-title">{t("yourBuyerProfile")}</h1>
          <p className="profile-notice">{t("signInThenSetup")}</p>
          <label className="lbl">{t("chooseLanguage")}</label>
          <LanguagePicker value={lang} onChange={persistLang} />
          <p className="hint">{t("languageHint")}</p>
          <SignInPanel />
        </>
      ) : (
        <>
          <div className="progress-wrap">
            <div className="progress-meta">
              <span>{tf("stepOf", { current: step, total: TOTAL_STEPS })}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
          <h1 className="onboarding-title">
            {step === 1
              ? t("chooseLanguage")
              : step === 2
                ? t("addPhoto")
                : t("nameAndPhone")}
          </h1>
          <span
            className={`draft-saved${savedFlash ? " visible" : ""}`}
            aria-live="polite"
          >
            {t("saved")}
          </span>

          {step === 1 && (
            <form
              className="onboarding-form"
              onSubmit={(e) => {
                e.preventDefault();
                persistLang(lang);
                setErr(null);
                setStep(2);
              }}
            >
              <p className="profile-notice">{t("languageHint")}</p>
              <LanguagePicker value={lang} onChange={persistLang} />
              <button type="submit" className="btn profile-onboard-btn">
                {t("continue")}
              </button>
            </form>
          )}

          {step === 2 && (
            <form
              className="onboarding-form"
              onSubmit={(e) => {
                e.preventDefault();
                setErr(null);
                setStep(3);
              }}
            >
              <p className="profile-notice">{t("photoHint")}</p>
              <label className="lbl">{t("profilePhoto")}</label>
              <ProfilePhotoUpload
                previewUrl={photo}
                seed={user.uid || user.email || name}
                initial={userInitial({
                  ...user,
                  displayName: name || user.displayName,
                })}
                onChange={(url) => void persistPhoto(url)}
              />
              <button type="submit" className="btn profile-onboard-btn">
                {t("continue")}
              </button>
              <button
                type="button"
                className="btn ghost profile-onboard-btn"
                onClick={() => setStep(1)}
              >
                {t("back")}
              </button>
            </form>
          )}

          {step === 3 && (
            <form
              className="onboarding-form"
              onSubmit={(e) => {
                e.preventDefault();
                void saveDetails();
              }}
            >
              <p className="profile-notice">{t("stallsMayUse")}</p>
              {accountId && (
                <div className="profile-id-card">
                  <p className="lbl">{t("yourId")}</p>
                  <p className="profile-id-value">{accountId}</p>
                  <p className="hint">{t("idHint")}</p>
                  <button
                    type="button"
                    className="text-link-btn"
                    onClick={() => {
                      void navigator.clipboard?.writeText(accountId).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      });
                    }}
                  >
                    {copied ? t("copied") : t("copyId")}
                  </button>
                </div>
              )}
              <label className="lbl" htmlFor="buyer-name">
                {t("fullName")} *
              </label>
              <input
                id="buyer-name"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />

              <label className="lbl" htmlFor="buyer-phone">
                {t("mobileNumber")}
              </label>
              <input
                id="buyer-phone"
                className="field"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
              {phone.trim() && isValidTzPhone(phone) && (
                <p className="hint">{formatTzPhoneDisplay(phone)}</p>
              )}
              <p className="hint">{t("usedAtCheckout")}</p>

              {err && <p className="err">{err}</p>}
              <button
                type="submit"
                className="btn profile-onboard-btn"
                disabled={busy}
              >
                {busy ? t("saving") : t("saveProfile")}
              </button>
              <button
                type="button"
                className="btn ghost profile-onboard-btn"
                onClick={() => {
                  setErr(null);
                  setStep(2);
                }}
              >
                {t("back")}
              </button>
            </form>
          )}

          <p className="hint profile-signed-as">
            {t("signedInAs")} {user.email || userDisplayName(user)}
          </p>
          <button
            type="button"
            className="text-link-btn profile-switch-account"
            onClick={() => void signOut()}
          >
            {t("differentAccount")}
          </button>
        </>
      )}
    </div>
  );
}
