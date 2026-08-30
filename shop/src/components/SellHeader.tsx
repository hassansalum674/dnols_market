import { Link, useLocation } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { loadDraft } from "../storage";

type Props = {
  signInTo?: string;
  becomeSellerTo?: string;
  hideSellerCta?: boolean;
};

export function SellHeader({
  signInTo = "/signin",
  becomeSellerTo = "/onboarding",
  hideSellerCta = false,
}: Props) {
  const { pathname } = useLocation();
  const inOnboarding = pathname.startsWith("/onboarding");
  const hasDraft = Boolean(loadDraft());
  const showSellerCta = !hideSellerCta && !inOnboarding && !hasDraft;

  return (
    <header className="sell-header">
      <div className="sell-header-row">
        <Link to="/" className="sell-logo">
          <BrandLogo variant="dark" className="sell-wordmark" height={34} />
        </Link>
        <nav className="sell-nav">
          <Link to={signInTo} className="sell-nav-link">
            Sign in
          </Link>
          {showSellerCta && (
            <Link to={becomeSellerTo} className="sell-nav-cta">
              Become a seller
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
