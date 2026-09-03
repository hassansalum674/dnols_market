import { useState } from "react";
import { Link } from "react-router-dom";
import {
  firstNameOf,
  formatTzMobile,
  isValidTzMobile,
  riderCloudErrorKey,
} from "../lib/deliveryCloud";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { useRiderOrders } from "../hooks/useRiderOrders";
import { SignInPage } from "./SignIn";

function LinkPhoneForm() {
  const { t, tf } = useI18n();
  const { linkPhone, user } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const digits = phone.replace(/\D/g, "").replace(/^255/, "").replace(/^0/, "");
  const ready = isValidTzMobile(phone);

  async function save() {
    setErr(null);
    if (!ready) {
      setErr(t("badPhone"));
      return;
    }
    setBusy(true);
    try {
      const ok = await linkPhone(phone);
      if (!ok) setErr(t("notLinked"));
    } catch (e) {
      const key = riderCloudErrorKey(e);
      setErr(key ? t(key) : t("cloudOffline"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rider-signin-card rider-link-card">
      <p>{t("linkPhoneHint")}</p>
      <label className="lbl" htmlFor="link-phone">
        {t("phoneNumber")}
      </label>
      <input
        id="link-phone"
        className="field"
        inputMode="tel"
        autoComplete="tel"
        placeholder={t("phoneHint")}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <p className="hint">
        {digits.length === 0
          ? t("phoneHint")
          : ready
            ? formatTzMobile(phone)
            : tf("phoneCount", { n: digits.length })}
      </p>
      <button className="rider-btn rider-btn--primary" disabled={busy} onClick={() => void save()}>
        {busy ? t("linking") : t("linkPhone")}
      </button>
      {err && <p className="err">{err}</p>}
    </div>
  );
}

function statusBadgeClass(status: string): string {
  if (status === "picked_up") return "rider-badge--picked_up";
  if (status === "delivered") return "rider-badge--delivered";
  return "rider-badge--assigned";
}

function statusLabel(
  status: string,
  t: (k: "assigned" | "pickedUpBadge" | "deliveredBadge") => string,
): string {
  if (status === "picked_up") return t("pickedUpBadge");
  if (status === "delivered") return t("deliveredBadge");
  return t("assigned");
}

export function DeliveriesPage() {
  const { user, rider, loading } = useAuth();
  const { t } = useI18n();
  const { active, ready } = useRiderOrders(rider);

  if (loading) {
    return (
      <div className="rider-page">
        <p className="rider-meta">{t("verifying")}</p>
      </div>
    );
  }

  if (!user) return <SignInPage />;

  return (
    <div className="rider-page">
      <h1 className="rider-page-title">{t("myDeliveries")}</h1>

      {!rider ? (
        <div className="rider-link-wrap">
          <LinkPhoneForm />
        </div>
      ) : !ready ? (
        <p className="rider-meta">{t("verifying")}</p>
      ) : active.length === 0 ? (
        <div className="rider-empty">
          <div className="rider-empty-icon" aria-hidden>
            🛵
          </div>
          <p>{t("noDeliveries")}</p>
        </div>
      ) : (
        <div>
          {active.map((o) => (
            <Link
              key={o.orderId}
              to={`/delivery/${encodeURIComponent(o.orderId)}`}
              className="rider-delivery-card"
            >
              <div className="rider-card-top">
                <span className="rider-order-num">
                  {t("orderNum")} {o.orderId.slice(-6).toUpperCase()}
                </span>
                <span className={`rider-badge ${statusBadgeClass(o.deliveryStatus)}`}>
                  {statusLabel(o.deliveryStatus, t)}
                </span>
              </div>
              <p className="rider-buyer-name">{firstNameOf(o.buyerName, t("buyer"))}</p>
              <p className="rider-address-line">{o.deliveryAddress || "Kariakoo"}</p>
              <p className="rider-meta">
                {o.items.length} {t("items")}
              </p>
              <span className="rider-btn rider-btn--primary" style={{ pointerEvents: "none" }}>
                {t("viewOrder")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
