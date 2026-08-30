import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../store/cart";

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

  return (
    <nav className="tabbar" aria-label="Primary">
      <div className="tabbar-inner">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="tab-ico">
              <Ico name={t.label} />
              {t.label === "Cart" && count > 0 && (
                <span className="badge">{count}</span>
              )}
            </span>
            <span className="tab-label">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function BuyerHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="header">
      <div className="shell-inner header-row">
        <Link to="/" className="header-logo" aria-label="Dnols home">
          <span className="header-logo-d">D</span>
          <span className="header-logo-nols">NOLS</span>
        </Link>
        {children}
      </div>
    </header>
  );
}
