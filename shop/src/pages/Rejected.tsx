import { useEffect, useState } from "react";
import { SellHeader } from "../components/SellHeader";
import { TOTAL_STEPS } from "../lib/onboarding";
import { syncAllProductsToApi, syncShopToApi } from "../lib/shopSync";
import { DASHBOARD_PATH } from "../lib/shopRoutes";
import { loadProfile, saveDraft, updateProfileStatus } from "../storage";

export function RejectedPage() {
  const profile = loadProfile();

  function resubmit() {
    if (!profile) return;
    const draft = {
      ...profile,
      currentStep: 1,
      submittedAt: null,
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
    window.location.href = "/onboarding/1";
  }

  return (
    <div className="sell-landing">
      <SellHeader becomeSellerTo="/rejected" />
      <main className="page status-page">
        <span className="status-badge rejected">Rejected</span>
        <h1>Application not approved</h1>
        <p className="muted">
          {profile?.step1.shopName
            ? `"${profile.step1.shopName}" was not approved.`
            : "Your application was not approved."}
        </p>
        {profile?.rejectionReason && (
          <div className="status-card reject-reason">
            <strong>Reason</strong>
            <p>{profile.rejectionReason}</p>
          </div>
        )}
        <button type="button" className="btn" onClick={resubmit}>
          Fix & resubmit
        </button>
        <p className="hint">
          Your previous answers are saved. Review each of the {TOTAL_STEPS}{" "}
          steps and submit again.
        </p>
      </main>
    </div>
  );
}

/** Demo route handlers */
export function DemoApprovePage() {
  const [msg] = useState("Publishing your stall to dnols.com…");

  useEffect(() => {
    const profile = updateProfileStatus("active");
    void (async () => {
      if (profile) {
        try {
          await syncShopToApi(profile);
          await syncAllProductsToApi(profile);
        } catch {
          /* Dashboard will retry unsynced listings. */
        }
      }
      window.location.href = DASHBOARD_PATH;
    })();
  }, []);

  return (
    <div className="sell-landing">
      <main className="page status-page">
        <p className="muted">{msg}</p>
      </main>
    </div>
  );
}

export function DemoRejectPage() {
  updateProfileStatus(
    "rejected",
    "ID photo was blurry. Please retake a clear photo of both sides of your NIDA card.",
  );
  window.location.href = "/rejected";
  return null;
}
