import { Link, NavLink } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { BuyerPortalLink } from "./BuyerPortalLink";
import { PRODUCT_NEW_PATH } from "../lib/productRoutes";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";

const links = [
  { to: "/stall", label: "Today", end: true },
  { to: "/stall/dashboard", label: "Overview", end: false },
  { to: "/stall/stock", label: "Products", end: false },
  { to: "/stall/orders", label: "Orders", end: false },
  { to: "/stall/shop", label: "Shop settings", end: false },
] as const;

type Props = {
  pickupCount: number;
};

export function StallSidebar({ pickupCount }: Props) {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  return (
    <aside className="stall-sidebar" aria-label="Seller navigation">
      <div className="stall-sidebar-brand">
        <BrandLogo className="stall-sidebar-logo" height={32} />
        <p className="stall-sidebar-tag">{t("sellerPortal")}</p>
        {!loading && user && (
          <p className="stall-sidebar-user">
            {user.displayName || user.email || "Signed in"}
          </p>
        )}
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
        <Link to={PRODUCT_NEW_PATH} className="stall-sidebar-link stall-sidebar-link--add">
          + Add product
        </Link>
        <BuyerPortalLink className="stall-sidebar-link stall-sidebar-link--muted">
          {t("browseAsBuyer")}
        </BuyerPortalLink>
      </div>
    </aside>
  );
}
