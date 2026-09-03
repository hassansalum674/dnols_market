import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useVoiceCall } from "../components/CallSessionProvider";
import {
  canPlaceVoiceCall,
  firstNameOf,
  googleMapsUrl,
  listenOrder,
  markDelivered,
  markPickedUp,
  type MarketOrderDoc,
} from "../lib/deliveryCloud";
import { getFirebaseDb } from "../lib/firebase";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";

export function ActiveDeliveryPage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const { rider } = useAuth();
  const { t } = useI18n();
  const { startCall } = useVoiceCall();
  const [order, setOrder] = useState<MarketOrderDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState(false);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db || !orderId) return;
    return listenOrder(db, orderId, setOrder);
  }, [orderId]);

  async function pickup() {
    const db = getFirebaseDb();
    if (!db || !order) return;
    setBusy(true);
    setErr(null);
    try {
      await markPickedUp(db, order.orderId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("updating"));
    } finally {
      setBusy(false);
    }
  }

  async function delivered() {
    const db = getFirebaseDb();
    if (!db || !order) return;
    setBusy(true);
    setErr(null);
    try {
      await markDelivered(db, order.orderId, rider?.riderId ?? order.riderId);
      setDoneMsg(true);
      window.setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("updating"));
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <div className="rider-page">
        <Link to="/" className="rider-back" aria-label={t("back")}>
          ←
        </Link>
        <p className="rider-meta">{t("verifying")}</p>
      </div>
    );
  }

  const maps = googleMapsUrl(order);
  const showCall = canPlaceVoiceCall(order);
  const isAssigned = order.deliveryStatus === "assigned";
  const isDelivered = order.deliveryStatus === "delivered";
  const orderLabel = order.orderId.slice(-6).toUpperCase();

  return (
    <div className="rider-page">
      <div className="rider-active-head">
        <Link to="/" className="rider-back" aria-label={t("back")}>
          ←
        </Link>
        <h1 className="rider-active-title">
          {t("orderNum")} {orderLabel}
        </h1>
      </div>

      <p className="rider-section-label">{t("buyer")}</p>
      <p className="rider-hero-name">{firstNameOf(order.buyerName, t("buyer"))}</p>
      <p className="rider-hero-address">{order.deliveryAddress || "Kariakoo, Dar es Salaam"}</p>

      <a
        className="rider-btn rider-btn--primary"
        href={maps}
        target="_blank"
        rel="noreferrer"
      >
        📍 {t("openMaps")}
      </a>

      <p className="rider-section-label" style={{ marginTop: 24 }}>
        {t("items")}
      </p>
      <ul className="rider-items">
        {order.items.map((item, i) => (
          <li key={`${item.title}-${i}`}>
            {item.title}
            {item.qty > 1 ? ` × ${item.qty}` : ""}
          </li>
        ))}
      </ul>

      {doneMsg && <p className="rider-ok">{t("deliveredConfirm")}</p>}

      {!isDelivered && (
        <div className="rider-btn-stack">
          {showCall && (
            <button
              type="button"
              className="rider-btn rider-btn--primary"
              disabled={busy}
              onClick={() => void startCall(order)}
            >
              📞 {t("callBuyer")}
            </button>
          )}
          {isAssigned && (
            <button
              type="button"
              className="rider-btn rider-btn--yellow"
              disabled={busy}
              onClick={() => void pickup()}
            >
              {busy ? t("updating") : t("pickedUpBtn")}
            </button>
          )}
          <button
            type="button"
            className="rider-btn rider-btn--green"
            disabled={busy || isAssigned}
            onClick={() => void delivered()}
          >
            {busy ? t("updating") : t("deliveredBtn")}
          </button>
          {isAssigned && (
            <p className="rider-meta" style={{ textAlign: "center", margin: 0 }}>
              {t("deliverAfterPickup")}
            </p>
          )}
        </div>
      )}

      {isDelivered && <p className="rider-ok">{t("deliveryComplete")}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
