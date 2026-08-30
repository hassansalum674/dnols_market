import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCheckoutSheet } from "../store/checkoutSheet";
import { fetchListingDetail } from "../api/client";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { BillingCardTile } from "../components/BillingCardTile";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { UserAvatar } from "../components/UserAvatar";
import { deleteBillingCard, loadBillingCards } from "../lib/billingCards";
import { getSavedIds } from "../store/persist";
import { useAuth } from "../store/auth";
import { loadProfile } from "../lib/profile";
import { providerLabel, userDisplayName } from "../lib/userDisplay";
import { formatTzPhoneDisplay } from "../lib/phone";
import { SELLER_URL } from "../lib/urls";
import type { PublicListing } from "../types";

export function YouPage() {
  const { user, loading, signOut } = useAuth();
  const { openBasket } = useCheckoutSheet();
  const [saved, setSaved] = useState<PublicListing[] | null>(null);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [profileDelivery, setProfileDelivery] = useState<string | null>(null);
  const [billingCards, setBillingCards] = useState(() =>
    user?.uid ? loadBillingCards(user.uid) : [],
  );

  const displayName = userDisplayName(user);

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

  useEffect(() => {
    if (!user?.uid) {
      setProfilePhone(null);
      setProfileDelivery(null);
      setBillingCards([]);
      return;
    }
    const p = loadProfile(user.uid);
    setProfilePhone(p.phone ?? null);
    setProfileDelivery(p.deliveryPhone ?? null);
    setBillingCards(loadBillingCards(user.uid));
  }, [user?.uid]);

  return (
    <div className="page account-page">
      <h1 className="account-title">My Account</h1>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : user ? (
        <div className="account-profile account-profile--signed-in">
          <UserAvatar user={user} size="lg" />
          <div className="account-profile-body">
            <p className="account-name">{displayName}</p>
            {user.email && (
              <p className="account-detail">
                <span className="account-detail-label">Email</span>
                <span>{user.email}</span>
              </p>
            )}
            {profilePhone && (
              <p className="account-detail">
                <span className="account-detail-label">Phone</span>
                <span>{formatTzPhoneDisplay(profilePhone)}</span>
              </p>
            )}
            {profileDelivery && profileDelivery !== profilePhone && (
              <p className="account-detail">
                <span className="account-detail-label">Delivery</span>
                <span>{formatTzPhoneDisplay(profileDelivery)}</span>
              </p>
            )}
            <p className="account-detail">
              <span className="account-detail-label">Signed in with</span>
              <span>{providerLabel(user.provider)}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="account-signin-card">
          <p className="section-desc">
            Sign in to place orders, save billing cards, and track delivery across
            devices.
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
          <span className="muted">
            {user ? "Track delivery & escrow" : "Sign in to view orders"}
          </span>
        </Link>
        <button type="button" className="account-tile" onClick={() => openBasket()}>
          <span className="account-tile-label">Cart</span>
          <span className="muted">Items to pay for</span>
        </button>
      </div>

      {user && (
        <section className="account-section billing-cards-section">
          <h2>Billing cards</h2>
          <p className="hint">
            Saved mobile money wallets for faster checkout. Cards are added when
            you pay, or remove them below.
          </p>
          {billingCards.length === 0 ? (
            <p className="muted">No billing cards yet — one saves after your first order.</p>
          ) : (
            <div className="billing-cards-grid">
              {billingCards.map((card) => (
                <BillingCardTile
                  key={card.id}
                  card={card}
                  onRemove={() => {
                    deleteBillingCard(user.uid, card.id);
                    setBillingCards(loadBillingCards(user.uid));
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="account-section escrow-card">
        <h2>How escrow works</h2>
        <ol className="escrow-steps">
          <li>You pay upfront — money is held safely</li>
          <li>Dnols notifies the seller and coordinates delivery</li>
          <li>You receive the item at your delivery contact number</li>
          <li>Seller is paid only after handover is confirmed</li>
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
