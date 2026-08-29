import { Link } from "react-router-dom";
import { SellHeader } from "../components/SellHeader";
import { isSignedIn, loadDraft, loadProfile } from "../storage";

export function SellLandingPage() {
  const profile = loadProfile();
  const draft = loadDraft();
  const signedIn = isSignedIn();

  let ctaPath = "/onboarding";
  let ctaLabel = "Become a seller";

  if (profile?.status === "active") {
    ctaPath = "/dashboard";
    ctaLabel = "Go to dashboard";
  } else if (profile?.status === "pending_review") {
    ctaPath = "/pending";
    ctaLabel = "View application";
  } else if (profile?.status === "rejected") {
    ctaPath = "/rejected";
    ctaLabel = "Resubmit application";
  } else if (draft) {
    ctaPath = `/onboarding/${draft.currentStep}`;
    ctaLabel = "Resume onboarding";
  }

  return (
    <div className="sell-landing">
      <SellHeader becomeSellerTo={ctaPath} />
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
          List your stall on Dnols. Buyers pay upfront, pick up in person, and
          you get paid after handover.
        </p>

        <div className="sell-features">
          <div className="sell-feature">
            <strong>6-step setup</strong>
            <span>Shop identity, location, ID verification & payout</span>
          </div>
          <div className="sell-feature">
            <strong>Auto-save drafts</strong>
            <span>Exit anytime — your progress is never lost</span>
          </div>
          <div className="sell-feature">
            <strong>Manual review</strong>
            <span>We verify every shop within 24 hours</span>
          </div>
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

        {signedIn && (
          <p className="sell-signin-hint muted">
            Signed in as seller
          </p>
        )}
      </main>
    </div>
  );
}
