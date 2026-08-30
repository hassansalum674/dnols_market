import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignInDialog } from "../components/SignInDialog";
import { SellHeader } from "../components/SellHeader";
import { useAuth } from "../store/auth";
import { loadDraft, loadProfile } from "../storage";

export function SellLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = loadProfile();
  const draft = loadDraft();
  const [signInOpen, setSignInOpen] = useState(false);

  let ctaPath = "/onboarding";
  let ctaLabel = "Start";

  if (profile?.status === "active") {
    ctaPath = "/dashboard";
    ctaLabel = "Go to dashboard";
  } else if (profile?.status === "pending_review") {
    ctaPath = "/pending";
    ctaLabel = "View application";
  } else if (profile?.status === "rejected") {
    ctaPath = "/rejected";
    ctaLabel = "Resubmit";
  } else if (draft) {
    ctaPath = `/onboarding/${draft.currentStep}`;
    ctaLabel = "Continue";
  }

  function goNext() {
    navigate(ctaPath);
  }

  function onStartClick(e: React.MouseEvent) {
    if (user) {
      goNext();
      return;
    }
    e.preventDefault();
    setSignInOpen(true);
  }

  return (
    <div className="sell-landing">
      <SellHeader becomeSellerTo={ctaPath} hideSellerCta />
      <SignInDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignedIn={() => {
          setSignInOpen(false);
          goNext();
        }}
      />
      <main className="sell-hero">
        <img
          className="sell-hero-mark"
          src="/brand/logo4_submark.svg"
          alt=""
          width={72}
          height={72}
        />
        <h1>Sell from Kariakoo</h1>
        <p className="sell-hero-sub">
          List your stall on Dnols. Buyers pay upfront, pick up in person, and you
          get paid after handover.
        </p>

        <div className="sell-brief">
          <p>
            We verify every shop — you will need your <strong>NIDA or passport</strong>,
            stall location in Kariakoo, and a <strong>mobile money payout</strong> number.
            Review usually takes up to 24 hours.
          </p>
          <p className="muted">
            Your draft saves automatically if you leave. Sign in with Google or email
            to continue later on any device.
          </p>
        </div>

        <button type="button" className="btn sell-cta" onClick={onStartClick}>
          {ctaLabel}
        </button>

        {!user && (
          <p className="sell-signin-hint">
            Already a seller?{" "}
            <button
              type="button"
              className="text-link-btn"
              onClick={() => setSignInOpen(true)}
            >
              Sign in
            </button>
          </p>
        )}
      </main>
    </div>
  );
}
