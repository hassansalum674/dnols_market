import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCheckoutSheet } from "../store/checkoutSheet";
import { BillingCardTile } from "../components/BillingCardTile";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { UserAvatar } from "../components/UserAvatar";
import { deleteBillingCard, loadBillingCards } from "../lib/billingCards";
import { getSavedIds } from "../store/persist";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { loadProfile } from "../lib/profile";
import { providerLabel, userDisplayName } from "../lib/userDisplay";
import { formatTzPhoneDisplay } from "../lib/phone";
import { SELLER_URL } from "../lib/urls";

export function YouPage() {
  const { user, loading, signOut } = useAuth();
  const { t } = useI18n();
  const { openBasket } = useCheckoutSheet();
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [profileDelivery, setProfileDelivery] = useState<string | null>(null);
  const [billingCards, setBillingCards] = useState(() =>
    user?.uid ? loadBillingCards(user.uid) : [],
  );
  const savedCount = getSavedIds().length;

  const displayName = user ? userDisplayName(user) : t.guest;

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
    <div className="page account-page account-page--hub">
      <h1 className="account-title">{t.youTitle}</h1>

      {loading ? (
        <p className="muted">{t.loading}</p>
      ) : user ? (
        <div className="account-profile account-profile--signed-in account-profile--hero">
          <UserAvatar user={user} size="xl" />
          <div className="account-profile-body">
            <p className="account-name">{displayName}</p>
            {user.email && (
              <p className="account-detail">
                <span className="account-detail-label">{t.email}</span>
                <span>{user.email}</span>
              </p>
            )}
            {profilePhone && (
              <p className="account-detail">
                <span className="account-detail-label">{t.phone}</span>
                <span>{formatTzPhoneDisplay(profilePhone)}</span>
              </p>
            )}
            {profileDelivery && profileDelivery !== profilePhone && (
              <p className="account-detail">
                <span className="account-detail-label">{t.delivery}</span>
                <span>{formatTzPhoneDisplay(profileDelivery)}</span>
              </p>
            )}
            <p className="account-detail">
              <span className="account-detail-label">{t.signedInWith}</span>
              <span>{providerLabel(user.provider)}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="account-signin-card">
          <p className="section-desc">{t.signInToOrder}</p>
          <GoogleSignInButton label={t.continueGoogle} />
          <p className="auth-divider">
            <span>{t.or}</span>
          </p>
          <Link to="/signin" className="btn signin-email-btn">
            {t.signInEmail}
          </Link>
        </div>
      )}

      <div className="account-tiles account-tiles--3">
        <Link to="/orders" className="account-tile">
          <span className="account-tile-label">{t.ordersTile}</span>
          <span className="muted">
            {user ? t.ordersTileHint : t.ordersSignInHint}
          </span>
        </Link>
        <button type="button" className="account-tile" onClick={() => openBasket()}>
          <span className="account-tile-label">{t.cartTile}</span>
          <span className="muted">{t.cartTileHint}</span>
        </button>
        <Link to="/you/saved" className="account-tile">
          <span className="account-tile-label">{t.savedTile}</span>
          <span className="muted">
            {savedCount ? t.savedCount(savedCount) : t.savedForLater}
          </span>
        </Link>
      </div>

      {user && billingCards.length > 0 && (
        <section className="account-section billing-cards-section">
          <div className="account-section-head">
            <h2>{t.billingCards}</h2>
            <p className="hint">{t.billingHint}</p>
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

      <nav className="account-links" aria-label={t.accountShortcuts}>
        <Link to="/you/settings" className="account-links-item">
          <span>{t.settingsAppearance}</span>
          <span className="account-links-chevron" aria-hidden>
            ›
          </span>
        </Link>
        <a
          href={SELLER_URL}
          className="account-links-item"
          rel="noopener noreferrer"
        >
          <span>{t.becomeSeller}</span>
          <span className="account-links-chevron" aria-hidden>
            ›
          </span>
        </a>
      </nav>

      {user && (
        <button
          type="button"
          className="btn ghost account-signout-btn"
          onClick={() => void signOut()}
        >
          {t.signOut}
        </button>
      )}
    </div>
  );
}
