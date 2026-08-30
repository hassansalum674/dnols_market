import { Link } from "react-router-dom";
import { SellHeader } from "../components/SellHeader";
import { isSignedIn, loadDraft, loadProfile } from "../storage";

export function SellLandingPage() {
  const profile = loadProfile();
  const draft = loadDraft();
  const signedIn = isSignedIn();

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

  return (
    <div className="sell-landing">
      <SellHeader becomeSellerTo={ctaPath} hideSellerCta />
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

        <Link to={ctaPath} className="btn sell-cta">
          {ctaLabel}
        </Link>

        {!signedIn && (
          <p className="sell-signin-hint">
            Already a seller?{" "}
            <Link to="/signin" className="text-link">
              Sign in
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
