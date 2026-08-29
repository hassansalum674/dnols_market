import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SellHeader } from "../components/SellHeader";
import { isValidTzPhone, normalizeTzPhone } from "../lib/validation";
import { loadDraft, loadProfile, saveSession } from "../storage";

export function SignInPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidTzPhone(phone)) {
      setErr("Enter a valid +255 phone number.");
      return;
    }
    saveSession({
      phone: normalizeTzPhone(phone),
      signedInAt: new Date().toISOString(),
    });

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

  return (
    <div className="sell-landing">
      <SellHeader />
      <main className="page auth-page">
        <h1>Sign in</h1>
        <p className="muted">Use the phone number you registered with.</p>
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
            autoFocus
          />
          {err && <p className="err">{err}</p>}
          <button type="submit" className="btn" style={{ marginTop: 20 }}>
            Continue
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
