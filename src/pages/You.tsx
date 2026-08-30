import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListingDetail } from "../api/client";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { getSavedIds } from "../store/persist";
import { useAuth } from "../store/auth";
import { SELLER_URL } from "../lib/urls";
import type { PublicListing } from "../types";

export function YouPage() {
  const { user, loading, signOut } = useAuth();
  const [saved, setSaved] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    const ids = getSavedIds();
    if (!ids.length) {
      setSaved([]);
      return;
    }
    void Promise.all(ids.map((id) => fetchListingDetail(id))).then((rows) => {
      setSaved(
        rows
          .map((r) => r.detail)
          .filter((d): d is NonNullable<typeof d> => Boolean(d)),
      );
    });
  }, []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest";

  return (
    <div className="page account-page">
      <h1 className="account-title">My Account</h1>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : user ? (
        <div className="account-profile">
          {user.photoURL ? (
            <img className="account-avatar" src={user.photoURL} alt="" />
          ) : (
            <div className="account-avatar account-avatar-fallback">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="account-name">{displayName}</p>
            <p className="muted account-email">{user.email}</p>
          </div>
        </div>
      ) : (
        <div className="account-signin-card">
          <p className="section-desc">
            Sign in with Google or email to save orders and track escrow pickups.
          </p>
          <GoogleSignInButton label="Continue with Google" />
          <p className="auth-divider">
            <span>or</span>
          </p>
          <Link to="/signin" className="btn signin-email-btn">
            Sign in with email
          </Link>
        </div>
      )}

      <div className="account-tiles">
        <Link to="/orders" className="account-tile">
          <span className="account-tile-label">Orders</span>
          <span className="muted">Track pickups & escrow</span>
        </Link>
        <Link to="/cart" className="account-tile">
          <span className="account-tile-label">Cart</span>
          <span className="muted">Items to pay for</span>
        </Link>
      </div>

      <section className="account-section escrow-card">
        <h2>How escrow works</h2>
        <ol className="escrow-steps">
          <li>You pay upfront — money is held safely</li>
          <li>Walk to the stall in Kariakoo</li>
          <li>Show your pickup code to the seller</li>
          <li>Seller confirms handover — then they get paid</li>
        </ol>
      </section>

      <nav className="account-menu" aria-label="Account menu">
        <Link to="/you/settings" className="account-menu-item">
          Settings & appearance
        </Link>
        <Link to="/terms" className="account-menu-item">
          Terms of Use
        </Link>
        <Link to="/privacy" className="account-menu-item">
          Privacy Policy
        </Link>
        <a href={SELLER_URL} className="account-menu-item" rel="noopener noreferrer">
          Become a seller
        </a>
        <Link to="/orders" className="account-menu-item">
          Order history
        </Link>
      </nav>

      {user && (
        <button type="button" className="btn ghost account-menu-btn" onClick={() => void signOut()}>
          Sign out
        </button>
      )}

      <section className="account-section">
        <h2>Saved items</h2>
        {saved === null ? (
          <SkeletonGrid n={2} />
        ) : saved.length === 0 ? (
          <p className="muted">Nothing saved yet. Tap Save on a product page.</p>
        ) : (
          <ProductGrid listings={saved} />
        )}
      </section>
    </div>
  );
}
