import type { MouseEvent, ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../store/cart";
import { useCheckoutSheet } from "../store/checkoutSheet";
import { useAuth } from "../store/auth";
import { UserAvatar } from "./UserAvatar";
import { userDisplayName } from "../lib/userDisplay";
import { BrandLogo } from "./BrandLogo";
import { SellerPortalLink } from "./SellerPortalLink";
import { useI18n } from "../store/i18n";

const buyer = [
  { to: "/", label: "Home", end: true },
  { to: "/cart", label: "Cart", end: false },
  { to: "/orders", label: "Orders", end: false },
  { to: "/you", label: "My Account", end: false },
];

const shop = [
  { to: "/shop", label: "Today", end: true },
  { to: "/shop/stock", label: "Stock", end: false },
  { to: "/shop/orders", label: "Orders", end: false },
  { to: "/shop/profile", label: "Shop", end: false },
];

function NavIcon({ name }: { name: string }) {
  const emoji: Record<string, string> = {
    Home: "🏠",
    Today: "🏠",
    Cart: "🛒",
    Orders: "📦",
    "My Account": "👤",
    Stock: "🏷️",
    Shop: "🏪",
  };
  return <span aria-hidden>{emoji[name] ?? ""}</span>;
}

export function TabBar() {
  const { pathname } = useLocation();
  const shopMode = pathname.startsWith("/shop");
  const tabs = shopMode ? shop : buyer;
  const { count } = useCart();
  const { user } = useAuth();
  const { openBasket } = useCheckoutSheet();

  const openCart = (e: MouseEvent) => {
    e.preventDefault();
    openBasket();
  };

  return (
    <nav className="tabbar" aria-label="Primary">
      <div className="tabbar-inner">
        {tabs.map((t) =>
          t.label === "Cart" && !shopMode ? (
            <button
              key={t.to}
              type="button"
              className="tabbar-cart-btn"
              onClick={openCart}
            >
              <span className="tab-ico">
                <NavIcon name={t.label} />
                {count > 0 && <span className="badge">{count}</span>}
              </span>
              <span className="tab-label">{t.label}</span>
            </button>
          ) : (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="tab-ico">
                {t.label === "My Account" && user && !shopMode ? (
                  <UserAvatar user={user} size="sm" className="tab-user-avatar" />
                ) : (
                  <NavIcon name={t.label} />
                )}
                {t.label === "Cart" && count > 0 && (
                  <span className="badge">{count}</span>
                )}
              </span>
              <span className="tab-label">{t.label}</span>
            </NavLink>
          ),
        )}
      </div>
    </nav>
  );
}

export function BuyerHeader({ children }: { children?: ReactNode }) {
  const { count } = useCart();
  const { user, loading } = useAuth();
  const { openBasket } = useCheckoutSheet();
  const { t } = useI18n();
  const displayName = userDisplayName(user);

  return (
    <header className="header">
      <div className="shell-inner header-row">
        <Link to="/" className="header-logo" aria-label="Dnols home">
          <BrandLogo className="header-wordmark" height={36} />
        </Link>
        {children}
        <nav className="header-utils" aria-label="Account shortcuts">
          {!loading && user ? (
            <NavLink to="/you" className="header-util-signed">
              <UserAvatar user={user} size="md" />
              <span className="header-util-name">{displayName}</span>
            </NavLink>
          ) : (
            <>
              <NavLink to="/signin" className="header-util-link">
                Sign in
              </NavLink>
              <NavLink to="/signin" className="header-util-cta">
                Create account
              </NavLink>
            </>
          )}
        </nav>
        <SellerPortalLink className="header-seller">
          {t("becomeASeller")}
        </SellerPortalLink>
        <nav className="header-nav" aria-label="Account">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <span aria-hidden>🏠</span> Home
          </NavLink>
          <button
            type="button"
            className="header-nav-cart"
            onClick={() => openBasket()}
          >
            <span aria-hidden>🛒</span> Cart
            {count > 0 && <span className="header-badge">{count}</span>}
          </button>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            <span aria-hidden>📦</span> Orders
          </NavLink>
          <NavLink to="/you" className={({ isActive }) => (isActive ? "active" : "")}>
            <span aria-hidden>👤</span> My Account
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
