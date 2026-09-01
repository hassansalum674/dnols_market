import { Link, useLocation } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { loadDraft, loadProfile } from "../storage";
import { useAuth } from "../store/auth";

type Props = {
  signInTo?: string;
  becomeSellerTo?: string;
  hideSellerCta?: boolean;
};

function sellerNavLabel(email: string | null, displayName: string | null): string {
  if (displayName?.trim()) return displayName.trim();
  if (email) return email.split("@")[0] ?? "My shop";
  return "My shop";
}

export function SellHeader({
  signInTo = "/signin",
  becomeSellerTo = "/onboarding",
  hideSellerCta = false,
}: Props) {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const profile = loadProfile();
  const inOnboarding = pathname.startsWith("/onboarding");
  const hasDraft = Boolean(loadDraft());
  const showSellerCta = !hideSellerCta && !inOnboarding && !hasDraft;
  const signedIn = Boolean(user);
  const shopHome = profile?.status === "active" ? "/dashboard" : "/stall/stock";

  return (
    <header className="sell-header">
      <div className="sell-header-row">
        <Link to="/" className="sell-logo">
          <BrandLogo variant="dark" className="sell-wordmark" height={34} />
        </Link>
        <nav className="sell-nav">
          {loading ? (
            <span className="sell-nav-link sell-nav-muted">Loading…</span>
          ) : signedIn ? (
            <Link to={shopHome} className="sell-nav-link sell-nav-signed">
              {sellerNavLabel(user!.email, user!.displayName)}
            </Link>
          ) : (
            <Link to={signInTo} className="sell-nav-link">
              Sign in
            </Link>
          )}
          {showSellerCta && !signedIn && (
            <Link to={becomeSellerTo} className="sell-nav-cta">
              Become a seller
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
