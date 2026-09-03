import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
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
  const { rider } = useAuth();
  const { t } = useI18n();
  const [order, setOrder] = useState<MarketOrderDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [callHint, setCallHint] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("updating"));
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <div className="page stall-page">
        <Link to="/" className="back-link">
          ← {t("back")}
        </Link>
        <p className="muted">{t("updating")}</p>
      </div>
    );
  }

  const maps = googleMapsUrl(order);

  return (
    <div className="page stall-page">
      <Link to="/" className="back-link">
        ← {t("back")}
      </Link>
      <h1 className="stall-page-title">{t("activeDelivery")}</h1>

      <section className="card" style={{ marginBottom: 16 }}>
        <p className="lbl">{t("buyer")}</p>
        <p className="uc-panel-strong">{order.buyerName}</p>
        <p className="lbl">{t("address")}</p>
        <p>{order.deliveryAddress || "Kariakoo"}</p>
        <a className="btn ghost" href={maps} target="_blank" rel="noreferrer">
          {t("openMaps")}
        </a>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <p className="lbl">{t("items")}</p>
        <ul>
          {order.items.map((item, i) => (
            <li key={`${item.title}-${i}`}>
              {item.title} × {item.qty}
            </li>
          ))}
        </ul>
      </section>

      {order.deliveryStatus !== "delivered" && (
        <div className="btn-row" style={{ flexDirection: "column", gap: 8 }}>
          {order.deliveryStatus === "assigned" && (
            <button className="btn" disabled={busy} onClick={() => void pickup()}>
              {busy ? t("updating") : t("pickedUp")}
            </button>
          )}
          {(order.deliveryStatus === "assigned" ||
            order.deliveryStatus === "picked_up") && (
            <button
              className="btn"
              disabled={busy}
              onClick={() => void delivered()}
            >
              {busy ? t("updating") : t("delivered")}
            </button>
          )}
          <button
            type="button"
            className="btn ghost"
            onClick={() => setCallHint(true)}
          >
            {t("callBuyer")}
          </button>
        </div>
      )}
      {callHint && <p className="hint">{t("comingSoon")}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
