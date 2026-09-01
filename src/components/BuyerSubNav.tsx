import { Link, useLocation, useSearchParams } from "react-router-dom";
import { SELLER_URL } from "../lib/urls";
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
    <nav className="subnav" aria-label={t.browse}>
      <div className="shell-inner subnav-row">
        <Link to="/" className={tabClass(onHome && !cat)}>
          {t.products}
        </Link>
        <Link to="/?cat=fashion" className={tabClass(onHome && cat === "fashion")}>
          {t.fashion}
        </Link>
        <Link
          to="/?cat=electronics"
          className={tabClass(onHome && cat === "electronics")}
        >
          {t.electronics}
        </Link>
        <Link to="/orders" className={tabClass(pathname === "/orders")}>
          {t.orders}
        </Link>
        <a href={SELLER_URL} className="subnav-seller" rel="noopener noreferrer">
          {t.becomeSeller}
        </a>
      </div>
    </nav>
  );
}
