import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCheckoutSheet } from "../store/checkoutSheet";
import { BillingCardTile } from "../components/BillingCardTile";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { UserAvatar } from "../components/UserAvatar";
import { deleteBillingCard, loadBillingCards } from "../lib/billingCards";
import { getSavedIds } from "../store/persist";
import { useAuth } from "../store/auth";
import { loadProfile } from "../lib/profile";
import { providerLabel, userDisplayName } from "../lib/userDisplay";
import { formatTzPhoneDisplay } from "../lib/phone";
import { publicAccountId } from "../lib/accountId";
import { SellerPortalLink } from "../components/SellerPortalLink";
import { useI18n } from "../store/i18n";
import { ACCOUNT_SYNC_EVENT } from "../lib/syncBus";

export function YouPage() {
  const { user, loading, signOut } = useAuth();
  const { t } = useI18n();
  const { openBasket } = useCheckoutSheet();
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [profileDelivery, setProfileDelivery] = useState<string | null>(null);
  const [billingCards, setBillingCards] = useState(() =>
    user?.uid ? loadBillingCards(user.uid) : [],
  );
  const [savedCount, setSavedCount] = useState(() => getSavedIds().length);

  const displayName = userDisplayName(user);

  useEffect(() => {
    function load() {
      if (!user?.uid) {
        setProfilePhone(null);
        setProfileDelivery(null);
        setBillingCards([]);
        setSavedCount(0);
        return;
      }
      const p = loadProfile(user.uid);
      setProfilePhone(p.phone ?? null);
      setProfileDelivery(p.deliveryPhone ?? null);
      setBillingCards(loadBillingCards(user.uid));
      setSavedCount(getSavedIds().length);
    }
    load();
    window.addEventListener(ACCOUNT_SYNC_EVENT, load);
    return () => window.removeEventListener(ACCOUNT_SYNC_EVENT, load);
  }, [user?.uid]);

  return (
    <div className="page account-page account-page--hub">
      <h1 className="account-title">{t("myAccount")}</h1>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : user ? (
        <div className="account-profile account-profile--signed-in">
          <Link to="/you/profile" className="account-avatar-link" aria-label={t("editProfile")}>
            <UserAvatar user={user} size="xl" />
            <span className="user-avatar-camera" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 8.5h3.2l1.3-2.2h7L16.8 8.5H20v10H4V8.5z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="13.2" r="3.2" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
          </Link>
          <div className="account-profile-body">
            <p className="account-name">{displayName}</p>
            {user.email && (
              <p className="account-detail">
                <span className="account-detail-label">{t("email")}</span>
                <span>{user.email}</span>
              </p>
            )}
            <p className="account-detail">
              <span className="account-detail-label">{t("yourId")}</span>
              <span className="account-id">{publicAccountId(user.uid)}</span>
            </p>
            {profilePhone && (
              <p className="account-detail">
                <span className="account-detail-label">{t("mobileNumber")}</span>
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
            <div className="account-profile-actions">
              <Link to="/you/profile" className="btn account-edit-btn">
                {t("editProfile")}
              </Link>
              <button
                type="button"
                className="text-link-btn"
                onClick={() => void signOut()}
              >
                {t("signOut")}
              </button>
            </div>
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

      <div className="account-tiles account-tiles--3">
        <Link to="/orders" className="account-tile">
          <span className="account-tile-label">Orders</span>
          <span className="muted">
            {user ? "Pickup, delivery & escrow" : "Sign in to view"}
          </span>
        </Link>
        <button type="button" className="account-tile" onClick={() => openBasket()}>
          <span className="account-tile-label">Cart</span>
          <span className="muted">Ready to pay</span>
        </button>
        <Link to="/you/saved" className="account-tile">
          <span className="account-tile-label">Saved</span>
          <span className="muted">
            {savedCount ? `${savedCount} item${savedCount === 1 ? "" : "s"}` : "For later"}
          </span>
        </Link>
      </div>

      {user && billingCards.length > 0 && (
        <section className="account-section billing-cards-section">
          <div className="account-section-head">
            <h2>Billing cards</h2>
            <p className="hint">Tap a saved wallet at checkout</p>
          </div>
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
        </section>
      )}

      <nav className="account-links" aria-label="Account shortcuts">
        <Link to="/you/settings" className="account-links-item">
          <span>Settings & appearance</span>
          <span className="account-links-chevron" aria-hidden>
            ›
          </span>
        </Link>
        <SellerPortalLink className="account-links-item">
          <span>{t("becomeASeller")}</span>
          <span className="account-links-chevron" aria-hidden>
            ›
          </span>
        </SellerPortalLink>
      </nav>
      <p className="hint">{t("sameAccountHint")}</p>

      {user && (
        <button
          type="button"
          className="btn ghost account-signout-btn"
          onClick={() => void signOut()}
        >
          {t("signOut")}
        </button>
      )}
    </div>
  );
}
