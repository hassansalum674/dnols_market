import { Link, Navigate, useSearchParams } from "react-router-dom";
import { paths } from "../lib/paths";

const THESIS =
  "Pay, then we show the way — escrowed walk-up to Kariakoo shops.";

export function LandingPage() {
  const [sp] = useSearchParams();
  if (sp.has("place")) {
    return <Navigate to={`${paths.home}?${sp.toString()}`} replace />;
  }

  return (
    <div className="landing">
      <img className="landing-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p className="landing-thesis">{THESIS}</p>
      <Link className="btn" to={paths.home}>
        Open app
      </Link>
      <Link className="landing-sell" to={paths.shop} reloadDocument>
        Sell on Dnols
      </Link>
    </div>
  );
}

/** Branded 404 for unknown URLs on the marketing site — no PWA chrome or grid. */
export function MarketingNotFoundPage() {
  return (
    <div className="landing">
      <img className="landing-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p className="landing-thesis">This page is not on Dnols.</p>
      <Link className="btn" to={paths.home}>
        Open app
      </Link>
    </div>
  );
}
