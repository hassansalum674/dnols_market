import { useState } from "react";
import { authErrorMessage, consumeAuthError } from "../lib/authActions";
import { useAuth } from "../store/auth";

type Props = {
  label?: string;
  onSuccess?: (email: string, name: string | null) => void;
};

export function GoogleSignInButton({
  label = "Continue with Google",
  onSuccess,
}: Props) {
  const { signInWithGoogle, configured, loading, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(() => consumeAuthError());

  async function click() {
    setErr(null);
    setBusy(true);
    try {
      const method = await signInWithGoogle();
      if (method === "redirect") return;
      if (user?.email) onSuccess?.(user.email, user.displayName);
    } catch (e) {
      setErr(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="google-signin-wrap">
      <button
        type="button"
        className="btn-google"
        disabled={busy || loading || !configured}
        onClick={() => void click()}
      >
        {busy ? "Signing in…" : label}
      </button>
      {!configured && !loading && (
        <p className="hint">Add Firebase keys to enable Google sign-in.</p>
      )}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
