import { InstallAppSettings } from "../components/InstallApp";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { useRiderOrders } from "../hooks/useRiderOrders";
import { formatTzMobile } from "../lib/deliveryCloud";

export function ProfilePage() {
  const { user, rider, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { history, deliveredToday, ready } = useRiderOrders(rider);

  const name = rider?.name || user?.displayName || t("riderPortal");
  const initial = name.trim().charAt(0).toUpperCase() || "R";
  const phone = rider?.phone || user?.phone || "";
  const linkedCount = rider?.linkedSellers?.length ?? 0;

  if (!ready) {
    return (
      <div className="rider-page">
        <p className="rider-meta">{t("verifying")}</p>
      </div>
    );
  }

  return (
    <div className="rider-page">
      <h1 className="rider-page-title">{t("navProfile")}</h1>

      <div className="rider-profile-card">
        <div className="rider-avatar" aria-hidden>
          {initial}
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: "1.25rem" }}>{name}</h2>
        {phone && (
          <p className="rider-meta" style={{ margin: 0 }}>
            {formatTzMobile(phone)}
          </p>
        )}
        {linkedCount > 0 && (
          <p className="rider-meta" style={{ marginTop: 8 }}>
            {t("linkedTo")}: {t("defaultShop")}
            {linkedCount > 1 ? ` (+${linkedCount - 1})` : ""}
          </p>
        )}
      </div>

      <div className="rider-stat-grid">
        <div className="rider-stat">
          <strong>{deliveredToday}</strong>
          <span>{t("todayDeliveries")}</span>
        </div>
        <div className="rider-stat">
          <strong>{history.length}</strong>
          <span>{t("totalDeliveries")}</span>
        </div>
      </div>

      <p className="rider-section-label">{t("chooseLanguage")}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          type="button"
          className={`rider-btn rider-btn--primary${lang === "en" ? "" : ""}`}
          style={{
            flex: 1,
            opacity: lang === "en" ? 1 : 0.5,
            minHeight: 44,
          }}
          onClick={() => setLang("en")}
        >
          {t("english")}
        </button>
        <button
          type="button"
          className="rider-btn rider-btn--primary"
          style={{
            flex: 1,
            opacity: lang === "sw" ? 1 : 0.5,
            minHeight: 44,
          }}
          onClick={() => setLang("sw")}
        >
          {t("swahili")}
        </button>
      </div>

      <InstallAppSettings />

      <div className="rider-btn-stack">
        <button
          type="button"
          className="rider-btn rider-btn--outline"
          onClick={() => void signOut()}
        >
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}
