import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignInPanel } from "../components/SignInPanel";
import { SellHeader } from "../components/SellHeader";
import { TzPhoneField } from "../components/TzPhoneField";
import { isValidTzPhone, normalizeTzPhone } from "../lib/validation";
import { DASHBOARD_PATH } from "../lib/shopRoutes";
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
      navigate(DASHBOARD_PATH);
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
    afterAuth(user.email ?? user.uid);
  }, [user, loading]);

  if (!loading && user) {
    return (
      <div className="sell-landing">
        <SellHeader />
        <main className="page auth-page signin-page">
          <p className="muted">Signed in — taking you to your shop…</p>
        </main>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidTzPhone(phone)) {
      setErr("Enter a Tanzania number: +255 6XX XXX XXX or +255 7XX XXX XXX.");
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
          <label className="lbl" htmlFor="seller-phone">
            Phone number
          </label>
          <TzPhoneField
            id="seller-phone"
            className="field"
            value={phone}
            onChange={(next) => {
              setPhone(next);
              setErr(null);
            }}
            required
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
