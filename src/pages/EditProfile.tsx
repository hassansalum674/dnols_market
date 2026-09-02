import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProfilePhotoUpload } from "../components/ProfilePhotoUpload";
import { SignInPanel } from "../components/SignInPanel";
import { notifyAvatarChange } from "../lib/avatar";
import {
  formatTzPhoneDisplay,
  isValidTzPhone,
  normalizeTzPhone,
} from "../lib/phone";
import { loadProfile, saveProfile } from "../lib/profile";
import { userDisplayName, userInitial } from "../lib/userDisplay";
import { useAuth } from "../store/auth";

const TOTAL_STEPS = 2;

export function EditProfilePage() {
  const { user, loading, signOut, updateDisplayName } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [savedFlash, setSavedFlash] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
    setStep(1);
    setErr(null);
  }, [user?.uid]);

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 2000);
    return () => clearTimeout(t);
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

  function goNext() {
    setErr(null);
    setStep(2);
  }

  async function saveDetails() {
    if (!user) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErr("Enter your name (at least 2 letters).");
      return;
    }
    if (phone.trim() && !isValidTzPhone(phone)) {
      setErr("Enter a Tanzania mobile number, e.g. 07XX XXX XXX.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await updateDisplayName(trimmed);
      const patch: { displayName: string; phone?: string } = {
        displayName: trimmed,
      };
      if (phone.trim()) patch.phone = normalizeTzPhone(phone);
      saveProfile(user.uid, patch);
      notifyAvatarChange();
      navigate("/you", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page profile-onboard">
      <Link to="/you" className="back-link">
        ← My Account
      </Link>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : !user ? (
        <>
          <h1 className="onboarding-title">Your buyer profile</h1>
          <p className="profile-notice">
            Sign in or create an account, then add a photo and phone number.
            Your orders and pickup codes stay on this account.
          </p>
          <SignInPanel
            title="Sign in with a new account"
            subtitle="Use Google or email. After you sign in you can change your avatar, add a profile photo, and save a phone number."
          />
        </>
      ) : (
        <>
          <div className="progress-wrap">
            <div className="progress-meta">
              <span>
                Step {step} of {TOTAL_STEPS}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
          <h1 className="onboarding-title">
            {step === 1 ? "Add a profile photo" : "Your name and phone"}
          </h1>
          <span
            className={`draft-saved${savedFlash ? " visible" : ""}`}
            aria-live="polite"
          >
            Saved
          </span>

          {step === 1 ? (
            <form
              className="onboarding-form"
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
            >
              <p className="profile-notice">
                Take a photo with the camera or pick one from your gallery. If
                you skip this, we show a coloured letter avatar instead.
              </p>
              <label className="lbl">Profile photo</label>
              <ProfilePhotoUpload
                previewUrl={photo}
                seed={user.uid || user.email || name}
                initial={userInitial({ ...user, displayName: name || user.displayName })}
                onChange={(url) => void persistPhoto(url)}
              />
              <button type="submit" className="btn profile-onboard-btn">
                Continue
              </button>
            </form>
          ) : (
            <form
              className="onboarding-form"
              onSubmit={(e) => {
                e.preventDefault();
                void saveDetails();
              }}
            >
              <p className="profile-notice">
                Stalls may use your name and number after you pay — for pickup
                at Kariakoo or delivery to your location.
              </p>
              <label className="lbl" htmlFor="buyer-name">
                Full name *
              </label>
              <input
                id="buyer-name"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />

              <label className="lbl" htmlFor="buyer-phone">
                Mobile number
              </label>
              <input
                id="buyer-phone"
                className="field"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255 7XX XXX XXX"
                autoComplete="tel"
              />
              {phone.trim() && isValidTzPhone(phone) && (
                <p className="hint">{formatTzPhoneDisplay(phone)}</p>
              )}
              <p className="hint">Used at checkout for mobile money and delivery.</p>

              {err && <p className="err">{err}</p>}
              <button
                type="submit"
                className="btn profile-onboard-btn"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save profile"}
              </button>
              <button
                type="button"
                className="btn ghost profile-onboard-btn"
                onClick={() => {
                  setErr(null);
                  setStep(1);
                }}
              >
                Back
              </button>
            </form>
          )}

          <p className="hint profile-signed-as">
            Signed in as {user.email || userDisplayName(user)}
          </p>
          <button
            type="button"
            className="text-link-btn profile-switch-account"
            onClick={() => void signOut()}
          >
            Sign in with a different account
          </button>
        </>
      )}
    </div>
  );
}
