import { Link } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";

type Props = {
  signInTo?: string;
  becomeSellerTo?: string;
};

export function SellHeader({ signInTo = "/signin", becomeSellerTo = "/onboarding" }: Props) {
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
          <Link to={becomeSellerTo} className="sell-nav-cta">
            Become a seller
          </Link>
        </nav>
      </div>
    </header>
  );
}
