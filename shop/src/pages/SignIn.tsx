import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignInPanel } from "../components/SignInPanel";
import { SellHeader } from "../components/SellHeader";
import { isValidTzPhone, normalizeTzPhone } from "../lib/validation";
import { useAuth } from "../store/auth";
import { loadDraft, loadProfile, saveSession } from "../storage";

export function SignInPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
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

  useEffect(() => {
    if (loading || !user) return;
    const identifier = user.email ?? user.uid;
    afterAuth(identifier);
  }, [user, loading]);

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
      <main className="page auth-page signin-page">
        <SignInPanel
          title="Seller sign in"
          subtitle="Use Google or email. You can also continue with the phone number you registered with."
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
