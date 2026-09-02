import { Link, useLocation } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { DASHBOARD_PATH, PRODUCTS_PATH } from "../lib/shopRoutes";
import { publicAccountId } from "../lib/accountId";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { loadDraft, loadProfile } from "../storage";

type Props = {
  signInTo?: string;
  becomeSellerTo?: string;
  hideSellerCta?: boolean;
};

function sellerNavLabel(
  email: string | null,
  displayName: string | null,
  fallback: string,
): string {
  if (displayName?.trim()) return displayName.trim();
  if (email) return email.split("@")[0] ?? fallback;
  return fallback;
}

export function SellHeader({
  signInTo = "/signin",
  becomeSellerTo = "/onboarding",
  hideSellerCta = false,
}: Props) {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const profile = loadProfile();
  const inOnboarding = pathname.startsWith("/onboarding");
  const hasDraft = Boolean(loadDraft());
  const showSellerCta = !hideSellerCta && !inOnboarding && !hasDraft;
  const signedIn = Boolean(user);
  const shopHome = profile?.status === "active" ? DASHBOARD_PATH : PRODUCTS_PATH;

  return (
    <header className="sell-header">
      <div className="sell-header-row">
        <Link to="/" className="sell-logo">
          <BrandLogo className="sell-wordmark" height={34} />
        </Link>
        <nav className="sell-nav">
          {loading ? (
            <span className="sell-nav-link sell-nav-muted">{t("loading")}</span>
          ) : signedIn ? (
            <Link to={shopHome} className="sell-nav-link sell-nav-signed">
              {sellerNavLabel(user!.email, user!.displayName, t("myShop"))}
            </Link>
          ) : (
            <Link to={signInTo} className="sell-nav-link">
              {t("signIn")}
            </Link>
          )}
          {showSellerCta && !signedIn && (
            <Link to={becomeSellerTo} className="sell-nav-cta">
              {t("becomeASeller")}
            </Link>
          )}
        </nav>
      </div>
      {signedIn && user && (
        <p className="sell-header-account">
          {t("signedInAs")} {user.email || user.displayName} ·{" "}
          {publicAccountId(user.uid)}
        </p>
      )}
    </header>
  );
}
