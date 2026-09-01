import type { MouseEvent, ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../store/cart";
import { useCheckoutSheet } from "../store/checkoutSheet";
import { useAuth } from "../store/auth";
import { UserAvatar } from "./UserAvatar";
import { userDisplayName } from "../lib/userDisplay";
import { BrandLogo } from "./BrandLogo";
import { SELLER_URL } from "../lib/urls";
import { useI18n } from "../store/i18n";

const buyer = [
  { to: "/", end: true, key: "home" as const },
  { to: "/cart", end: false, key: "cart" as const },
  { to: "/orders", end: false, key: "orders" as const },
  { to: "/you", end: false, key: "myAccount" as const },
];

const shop = [
  { to: "/shop", label: "Today", end: true },
  { to: "/shop/stock", label: "Stock", end: false },
  { to: "/shop/orders", label: "Orders", end: false },
  { to: "/shop/profile", label: "Shop", end: false },
];

function Ico({ name }: { name: string }) {
  const s = { width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.4 };
  if (name === "Home" || name === "Today")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M4 11.5 12 5l8 6.5V20H4z" />
      </svg>
    );
  if (name === "Cart")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M6 7h15l-1.5 9H8L6 7zm0 0L5 4H2" />
      </svg>
    );
  if (name === "Orders")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <rect x="5" y="4" width="14" height="16" rx="1" />
        <path d="M8 9h8M8 13h6" />
      </svg>
    );
  if (name === "Stock")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M4 7h16v12H4zM4 7l2-3h12l2 3" />
      </svg>
    );
  if (name === "My Account")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <circle cx="12" cy="9" r="3" />
        <path d="M6 19c1.2-3 3.2-4 6-4s4.8 1 6 4" />
      </svg>
    );
  return (
    <svg {...s} viewBox="0 0 24 24">
      <circle cx="12" cy="9" r="3" />
      <path d="M6 19c1.2-3 3.2-4 6-4s4.8 1 6 4" />
    </svg>
  );
}

export function TabBar() {
  const { pathname } = useLocation();
  const shopMode = pathname.startsWith("/shop");
  const tabs = shopMode ? shop : buyer;
  const { count } = useCart();
  const { user } = useAuth();
  const { openBasket } = useCheckoutSheet();
  const { t } = useI18n();

  const openCart = (e: MouseEvent) => {
    e.preventDefault();
    openBasket();
  };

  function labelFor(tab: (typeof buyer)[number] | (typeof shop)[number]) {
    if ("label" in tab) return tab.label;
    return t[tab.key];
  }

  function icoName(tab: (typeof buyer)[number] | (typeof shop)[number]) {
    if ("label" in tab) return tab.label;
    if (tab.key === "home") return "Home";
    if (tab.key === "cart") return "Cart";
    if (tab.key === "orders") return "Orders";
    return "My Account";
  }

  return (
    <nav className="tabbar" aria-label={t.primaryNav}>
      <div className="tabbar-inner">
        {tabs.map((tab) => {
          const label = labelFor(tab);
          const isCart = !shopMode && "key" in tab && tab.key === "cart";
          const isAccount = !shopMode && "key" in tab && tab.key === "myAccount";
          if (isCart) {
            return (
              <button
                key={tab.to}
                type="button"
                className="tabbar-cart-btn"
                onClick={openCart}
              >
                <span className="tab-ico">
                  <Ico name="Cart" />
                  {count > 0 && <span className="badge">{count}</span>}
                </span>
                <span className="tab-label">{label}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="tab-ico">
                {isAccount && user ? (
                  <UserAvatar user={user} size="sm" className="tab-user-avatar" />
                ) : (
                  <Ico name={icoName(tab)} />
                )}
                {"label" in tab && tab.label === "Cart" && count > 0 && (
                  <span className="badge">{count}</span>
                )}
              </span>
              <span className="tab-label">{label}</span>
            </NavLink>
          );
        })}
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
          <BrandLogo variant="dark" className="header-wordmark" height={36} />
        </Link>
        {children}
        <nav className="header-utils" aria-label={t.accountShortcuts}>
          {!loading && user ? (
            <NavLink to="/you" className="header-util-signed">
              <UserAvatar user={user} size="md" />
              <span className="header-util-name">{displayName}</span>
            </NavLink>
          ) : (
            <>
              <NavLink to="/signin" className="header-util-link">
                {t.signIn}
              </NavLink>
              <NavLink to="/signin" className="header-util-cta">
                {t.createAccount}
              </NavLink>
            </>
          )}
        </nav>
        <a className="header-seller" href={SELLER_URL} rel="noopener noreferrer">
          {t.becomeSeller}
        </a>
        <nav className="header-nav" aria-label={t.account}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            {t.home}
          </NavLink>
          <button
            type="button"
            className="header-nav-cart"
            onClick={() => openBasket()}
          >
            {t.cart}
            {count > 0 && <span className="header-badge">{count}</span>}
          </button>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            {t.orders}
          </NavLink>
          <NavLink to="/you" className={({ isActive }) => (isActive ? "active" : "")}>
            {t.myAccount}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
