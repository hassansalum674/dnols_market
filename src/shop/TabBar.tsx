import { NavLink } from "react-router-dom";
import { paths } from "../lib/paths";

const tabs = [
  { to: paths.shop, label: "Today", end: true, name: "Today" },
  { to: paths.shopStock, label: "Stock", end: false, name: "Stock" },
  { to: paths.shopOrders, label: "Orders", end: false, name: "Orders" },
  { to: paths.shopProfile, label: "Shop", end: false, name: "Shop" },
] as const;

function Ico({ name }: { name: string }) {
  const s = {
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
  };
  if (name === "Today")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M4 11.5 12 5l8 6.5V20H4z" />
      </svg>
    );
  if (name === "Stock")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M4 7h16v12H4zM4 7l2-3h12l2 3" />
      </svg>
    );
  if (name === "Orders")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <rect x="5" y="4" width="14" height="16" rx="1" />
        <path d="M8 9h8M8 13h6" />
      </svg>
    );
  return (
    <svg {...s} viewBox="0 0 24 24">
      <circle cx="12" cy="9" r="3" />
      <path d="M6 19c1.2-3 3.2-4 6-4s4.8 1 6 4" />
    </svg>
  );
}

export function ShopTabBar({ pickupCount }: { pickupCount: number }) {
  return (
    <nav className="tabbar" aria-label="Shop">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="tab-ico">
            <Ico name={t.name} />
            {t.name === "Today" && pickupCount > 0 && (
              <span className="badge">{pickupCount}</span>
            )}
          </span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
