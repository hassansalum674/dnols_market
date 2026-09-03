import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/stall", label: "Today", end: true, name: "Today" },
  { to: "/stall/dashboard", label: "Overview", end: false, name: "Overview" },
  { to: "/stall/stock", label: "Products", end: false, name: "Stock" },
  { to: "/stall/orders", label: "Orders", end: false, name: "Orders" },
  { to: "/stall/shop", label: "Shop", end: false, name: "Shop" },
] as const;

function NavIcon({ name }: { name: string }) {
  const emoji: Record<string, string> = {
    Today: "🏠",
    Overview: "📊",
    Stock: "🏷️",
    Orders: "📦",
    Shop: "🏪",
  };
  return <span aria-hidden>{emoji[name] ?? ""}</span>;
}

export function TabBar({ pickupCount }: { pickupCount: number }) {
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
            <NavIcon name={t.name} />
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
