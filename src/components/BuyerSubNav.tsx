import { Link, useLocation, useSearchParams } from "react-router-dom";
import { SellerPortalLink } from "./SellerPortalLink";
import { useI18n } from "../store/i18n";

export function BuyerSubNav() {
  const { pathname } = useLocation();
  const [sp] = useSearchParams();
  const { t } = useI18n();
  const cat = sp.get("cat") || "";
  const onHome = pathname === "/";

  function tabClass(active: boolean) {
    return active ? "active" : "";
  }

  return (
    <nav className="subnav" aria-label="Browse">
      <div className="shell-inner subnav-row">
        <Link to="/" className={tabClass(onHome && !cat)}>
          Products
        </Link>
        <Link to="/?cat=fashion" className={tabClass(onHome && cat === "fashion")}>
          Fashion
        </Link>
        <Link
          to="/?cat=electronics"
          className={tabClass(onHome && cat === "electronics")}
        >
          Electronics
        </Link>
        <Link to="/orders" className={tabClass(pathname === "/orders")}>
          Orders
        </Link>
        <SellerPortalLink className="subnav-seller">
          {t("becomeASeller")}
        </SellerPortalLink>
      </div>
    </nav>
  );
}
