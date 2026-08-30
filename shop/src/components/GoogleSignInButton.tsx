import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";

type Props = {
  label?: string;
  onSuccess?: (email: string, name: string | null) => void;
};

function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function GoogleSignInButton({
  label = "Continue with Google",
  onSuccess,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  async function click() {
    setErr(null);
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Google sign-in not configured. See docs/auth.md");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = isMobile()
        ? await signInWithRedirect(auth, provider).then(() => null)
        : await signInWithPopup(auth, provider);
      if (cred?.user?.email) {
        onSuccess?.(cred.user.email, cred.user.displayName);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="google-signin-wrap">
      <button
        type="button"
        className="btn-google"
        disabled={busy || !configured}
        onClick={() => void click()}
      >
        {busy ? "Signing in…" : label}
      </button>
      {!configured && (
        <p className="hint">Add Firebase keys to enable Google sign-in.</p>
      )}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
