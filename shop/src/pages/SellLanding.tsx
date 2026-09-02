import { Link } from "react-router-dom";
import { DASHBOARD_PATH } from "../lib/shopRoutes";
import { publicAccountId } from "../lib/accountId";
import { SellHeader } from "../components/SellHeader";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { loadDraft, loadProfile } from "../storage";

export function SellLandingPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const profile = loadProfile();
  const draft = loadDraft();
  const signedIn = Boolean(user);

  let ctaPath = "/onboarding";
  let ctaLabel = t("start");

  if (profile?.status === "active") {
    ctaPath = DASHBOARD_PATH;
    ctaLabel = t("goToShop");
  } else if (profile?.status === "pending_review") {
    ctaPath = "/pending";
    ctaLabel = t("viewApplication");
  } else if (profile?.status === "rejected") {
    ctaPath = "/rejected";
    ctaLabel = t("resubmit");
  } else if (draft) {
    ctaPath = `/onboarding/${draft.currentStep}`;
    ctaLabel = t("continue");
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
        <h1>{t("sellHeroTitle")}</h1>
        <p className="sell-hero-sub">{t("sellHeroSub")}</p>

        <div className="sell-brief">
          <p>
            {t("sellBrief")}
          </p>
          <p className="muted">{t("sellDraftHint")}</p>
          {signedIn && user && (
            <p className="muted">
              {t("signedInAs")} {user.email || user.displayName}
              {" · "}
              {publicAccountId(user.uid)}
            </p>
          )}
        </div>

        <Link to={ctaPath} className="btn sell-cta">
          {ctaLabel}
        </Link>

        {!loading && !signedIn && (
          <p className="sell-signin-hint">
            {t("alreadySeller")}{" "}
            <Link to="/signin" className="text-link">
              {t("signIn")}
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
