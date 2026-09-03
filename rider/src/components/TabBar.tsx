import { NavLink } from "react-router-dom";
import { useI18n } from "../store/i18n";

export function RiderTabBar() {
  const { t } = useI18n();
  const tabs = [
    { to: "/", label: t("navDeliveries"), icon: "🏠", end: true },
    { to: "/history", label: t("navHistory"), icon: "📦", end: false },
    { to: "/profile", label: t("navProfile"), icon: "👤", end: false },
  ] as const;

  return (
    <nav className="rider-tabbar" aria-label={t("riderPortal")}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="tab-emoji" aria-hidden>
            {tab.icon}
          </span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
