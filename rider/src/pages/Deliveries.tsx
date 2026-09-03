import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deliveryTrackLabel,
  listenRiderOrders,
  type MarketOrderDoc,
} from "../lib/deliveryCloud";
import { getFirebaseDb } from "../lib/firebase";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { SignInPage } from "./SignIn";

function badge(order: MarketOrderDoc) {
  if (order.deliveryStatus === "delivered") return "deliveredBadge";
  if (order.deliveryStatus === "picked_up") return "pickedUpBadge";
  return "assigned";
}

export function DeliveriesPage() {
  const { user, rider, loading, signOut } = useAuth();
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState<MarketOrderDoc[]>([]);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db || !rider) {
      setOrders([]);
      return;
    }
    return listenRiderOrders(db, rider.riderId, rider.authUid, setOrders);
  }, [rider]);

  if (loading) {
    return (
      <div className="page stall-page">
        <p className="muted">{t("verifying")}</p>
      </div>
    );
  }

  if (!user) return <SignInPage />;

  return (
    <div className="page stall-page">
      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">{t("myDeliveries")}</h1>
          <p className="muted stall-page-desc">
            {user.phone || rider?.phone || ""}
          </p>
        </div>
        <button type="button" className="btn ghost" onClick={() => void signOut()}>
          {t("signOut")}
        </button>
      </header>

      {!rider ? (
        <div className="center-state">
          <p>{t("notLinked")}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="center-state">
          <p>{t("noDeliveries")}</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <Link
              key={o.orderId}
              to={`/delivery/${encodeURIComponent(o.orderId)}`}
              className="card order-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="pill live">{t(badge(o))}</span>
              <h2>{o.buyerName}</h2>
              <p className="hint">{o.deliveryAddress}</p>
              <p className="muted">
                {deliveryTrackLabel(o.deliveryStatus, lang)}
              </p>
              <p className="price">
                {o.items.length} {t("items")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
