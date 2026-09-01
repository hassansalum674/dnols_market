import { NavLink } from "react-router-dom";
import { DASHBOARD_PATH, PRODUCTS_PATH } from "../lib/shopRoutes";

const tabs = [
  { to: DASHBOARD_PATH, label: "Overview" },
  { to: PRODUCTS_PATH, label: "Products" },
] as const;

export function ShopCatalogNav() {
  return (
    <nav className="shop-catalog-nav" aria-label="Shop overview and products">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `shop-catalog-nav-link ${isActive ? "active" : ""}`.trim()
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
