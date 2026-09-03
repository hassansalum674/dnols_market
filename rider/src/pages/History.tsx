import { firstNameOf } from "../lib/deliveryCloud";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { useRiderOrders } from "../hooks/useRiderOrders";

function formatDate(iso: string | null | undefined, lang: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-TZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function HistoryPage() {
  const { rider } = useAuth();
  const { t, lang } = useI18n();
  const { history, ready } = useRiderOrders(rider);

  if (!ready) {
    return (
      <div className="rider-page">
        <p className="rider-meta">{t("verifying")}</p>
      </div>
    );
  }

  return (
    <div className="rider-page">
      <h1 className="rider-page-title">{t("navHistory")}</h1>
      <p className="rider-meta">{t("historyHint")}</p>

      {history.length === 0 ? (
        <div className="rider-empty">
          <div className="rider-empty-icon" aria-hidden>
            📦
          </div>
          <p>{t("noHistory")}</p>
        </div>
      ) : (
        <div>
          {history.map((o) => (
            <article key={o.orderId} className="rider-history-row">
              <h3>
                {t("orderNum")} {o.orderId.slice(-6).toUpperCase()}
              </h3>
              <p className="rider-buyer-name" style={{ fontSize: "1rem" }}>
                {firstNameOf(o.buyerName, t("buyer"))}
              </p>
              <p className="rider-meta">
                {formatDate(o.deliveredAt, lang)} · {o.items.length} {t("items")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
