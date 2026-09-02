import { Link } from "react-router-dom";
import { SellHeader } from "../components/SellHeader";
import { loadProfile } from "../storage";

export function PendingReviewPage() {
  const profile = loadProfile();

  return (
    <div className="sell-landing">
      <SellHeader becomeSellerTo="/pending" />
      <main className="page status-page">
        <span className="status-badge pending">Pending review</span>
        <h1>Application submitted</h1>
        <p className="muted">
          {profile?.step1.shopName
            ? `"${profile.step1.shopName}" is under review.`
            : "Your shop is under review."}{" "}
          We review every application within 24 hours. No auto-approval.
        </p>
        <div className="status-card">
          <p>
            <strong>Status:</strong> PENDING_REVIEW
          </p>
          {profile?.shopId && (
            <p>
              <strong>Shop ID:</strong> {profile.shopId}
            </p>
          )}
          {profile?.submittedAt && (
            <p className="hint">
              Submitted {new Date(profile.submittedAt).toLocaleString()}
            </p>
          )}
        </div>
        <p className="hint">
          You can close this page. We'll notify you when your shop is approved.
        </p>

        {/* Demo: simulate admin approval */}
        <details className="demo-panel">
          <summary>Demo: simulate admin action</summary>
          <div className="btn-row">
            <Link to="/demo/approve" className="btn">
              Approve shop
            </Link>
            <Link to="/demo/reject" className="btn ghost">
              Reject shop
            </Link>
          </div>
        </details>
      </main>
    </div>
  );
}
