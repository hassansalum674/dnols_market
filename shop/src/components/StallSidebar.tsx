import { NavLink } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";

const links = [
  { to: "/stall", label: "Today", end: true },
  { to: "/stall/stock", label: "Products", end: false },
  { to: "/stall/orders", label: "Orders", end: false },
  { to: "/stall/shop", label: "Shop settings", end: false },
] as const;

type Props = {
  pickupCount: number;
};

export function StallSidebar({ pickupCount }: Props) {
  return (
    <aside className="stall-sidebar" aria-label="Seller navigation">
      <div className="stall-sidebar-brand">
        <BrandLogo variant="dark" className="stall-sidebar-logo" height={32} />
        <p className="stall-sidebar-tag">Seller portal</p>
      </div>
      <nav className="stall-sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `stall-sidebar-link ${isActive ? "active" : ""}`.trim()
            }
          >
            <span>{link.label}</span>
            {link.label === "Today" && pickupCount > 0 && (
              <span className="stall-sidebar-badge">{pickupCount}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="stall-sidebar-foot">
        <NavLink to="/dashboard" className="stall-sidebar-link stall-sidebar-link--muted">
          Dashboard
        </NavLink>
        <a
          href="https://dnols.com"
          className="stall-sidebar-link stall-sidebar-link--muted"
          rel="noopener noreferrer"
        >
          Browse as buyer
        </a>
      </div>
    </aside>
  );
}
