import { useState } from "react";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";

type Mode = "signin" | "signup" | "reset";

type Props = {
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
};

export function SignInPanel({
  title,
  subtitle,
  onSuccess,
}: Props) {
  const {
    configured,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth();
  const { t } = useI18n();
  const heading = title ?? t.signInTitle;
  const sub = subtitle ?? t.signInSubtitle;

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(provider: string, fn: () => Promise<void>) {
    setErr(null);
    setMsg(null);
    setBusy(provider);
    try {
      await fn();
      onSuccess?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.signInFailed);
    } finally {
      setBusy(null);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setErr("Enter your email.");
      return;
    }
    if (mode === "reset") {
      await run("reset", async () => {
        await resetPassword(email);
        setMsg("Password reset email sent. Check your inbox.");
        setMode("signin");
      });
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup") {
      await run("email", () => signUpWithEmail(email, password, name));
    } else {
      await run("email", () => signInWithEmail(email, password));
    }
  }

  return (
    <div className="signin-panel">
      <h2 className="signin-title">{heading}</h2>
      <p className="section-desc">{sub}</p>

      {!loading && !configured && (
        <p className="hint auth-setup-hint">
          Sign-in could not start. Check Firebase setup in <strong>docs/auth.md</strong>.
        </p>
      )}

      <button
        type="button"
        className="btn-oauth btn-google"
        disabled={!configured || Boolean(busy) || loading}
        onClick={() => void run("google", signInWithGoogle)}
      >
        <GoogleIcon />
        {busy === "google" ? t.signingIn : t.continueGoogle}
      </button>

      <p className="auth-divider">
        <span>{t.or}</span>
      </p>

      <div className="signin-tabs" role="tablist" aria-label="Sign-in mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={mode === "signin" ? "on" : ""}
          onClick={() => {
            setMode("signin");
            setErr(null);
            setMsg(null);
          }}
        >
          {t.signIn}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "on" : ""}
          onClick={() => {
            setMode("signup");
            setErr(null);
            setMsg(null);
          }}
        >
          {t.createAccount}
        </button>
      </div>

      <form className="signin-form" onSubmit={(e) => void submitEmail(e)}>
        {mode === "signup" && (
          <div className="signin-field">
            <label className="field-label" htmlFor="auth-name">
              Full name
            </label>
            <input
              id="auth-name"
              className="sheet-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        )}
        <div className="signin-field">
          <label className="field-label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            className="sheet-field"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {mode !== "reset" && (
          <div className="signin-field">
            <label className="field-label" htmlFor="auth-pass">
              Password
            </label>
            <input
              id="auth-pass"
              className="sheet-field"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
        )}
        {err && <p className="err">{err}</p>}
        {msg && <p className="ok">{msg}</p>}
        <button type="submit" className="btn signin-submit" disabled={Boolean(busy)}>
          {busy === "email"
            ? t.loading
            : mode === "signup"
              ? t.createAccount
              : mode === "reset"
                ? t.continue
                : t.signInEmail}
        </button>
      </form>

      {mode === "signin" && (
        <button
          type="button"
          className="text-link-btn signin-forgot"
          onClick={() => {
            setMode("reset");
            setErr(null);
            setMsg(null);
          }}
        >
          Forgot password?
        </button>
      )}
      {mode === "reset" && (
        <button
          type="button"
          className="text-link-btn signin-forgot"
          onClick={() => setMode("signin")}
        >
          Back to sign in
        </button>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
