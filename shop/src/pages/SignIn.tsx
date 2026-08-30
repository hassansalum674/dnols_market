import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { SellHeader } from "../components/SellHeader";
import { isValidTzPhone, normalizeTzPhone } from "../lib/validation";
import { loadDraft, loadProfile, saveSession } from "../storage";

export function SignInPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function afterAuth(identifier: string) {
    saveSession({
      phone: identifier,
      signedInAt: new Date().toISOString(),
    });
    routeAfterSignIn();
  }

  function routeAfterSignIn() {
    const profile = loadProfile();
    if (profile?.status === "active") {
      navigate("/dashboard");
    } else if (profile?.status === "pending_review") {
      navigate("/pending");
    } else if (profile?.status === "rejected") {
      navigate("/rejected");
    } else {
      const draft = loadDraft();
      navigate(draft ? `/onboarding/${draft.currentStep}` : "/onboarding");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidTzPhone(phone)) {
      setErr("Enter a valid +255 phone number.");
      return;
    }
    afterAuth(normalizeTzPhone(phone));
  }

  return (
    <div className="sell-landing">
      <SellHeader />
      <main className="page auth-page">
        <h1>Sign in</h1>
        <p className="muted">Use Google or the phone number you registered with.</p>

        <GoogleSignInButton
          label="Sign in with Google"
          onSuccess={(email) => afterAuth(email)}
        />

        <p className="auth-divider">or use phone</p>

        <form onSubmit={submit}>
          <label className="lbl">Phone number</label>
          <input
            className="field"
            type="tel"
            inputMode="tel"
            placeholder="+255 7XX XXX XXX"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErr(null);
            }}
          />
          {err && <p className="err">{err}</p>}
          <button type="submit" className="btn" style={{ marginTop: 20 }}>
            Continue with phone
          </button>
        </form>
        <p className="hint" style={{ marginTop: 24 }}>
          New seller?{" "}
          <Link to="/onboarding" className="text-link">
            Start onboarding
          </Link>
        </p>
      </main>
    </div>
  );
}
