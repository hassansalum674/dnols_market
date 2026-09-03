import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/client";
import { useAuth } from "../store/auth";
import { PAY_METHODS } from "../lib/checkout";
import {
  canPlaceVoiceCall,
  deliveryTrackLabel,
  listenBuyerOrders,
} from "../lib/deliveryCloud";
import { getFirebaseDb } from "../lib/firebase";
import { formatTsh } from "../lib/format";
import { formatTzPhoneDisplay } from "../lib/phone";
import { useI18n } from "../store/i18n";
import { useVoiceCall } from "../components/CallSessionProvider";
import {
  clearLocalOrders,
  getLocalOrders,
  hiddenOrderIds,
  removeLocalOrder,
} from "../store/persist";
import type { Order } from "../types";

const STATUS_LABEL: Record<Order["status"], string> = {
  reserved: "Reserved — pay to confirm",
  paid_held: "Paid · held in escrow",
  handed_over: "Received",
  rejected_refund: "Refunded",
};

function fulfillmentLabel(order: Order): string | null {
  if (order.fulfillment === "pickup") return "Self pickup";
  if (order.fulfillment === "delivery") return "Delivery";
  return null;
}

function payMethodLabel(id?: string): string | null {
  if (!id) return null;
  return PAY_METHODS.find((m) => m.id === id)?.label ?? id;
}

function mergeOrders(local: Order[], remote: Order[]): Order[] {
  const hidden = new Set(hiddenOrderIds());
  const map = new Map<string, Order>();
  [...local, ...remote].forEach((o) => {
    if (!hidden.has(o.id)) map.set(o.id, o);
  });
  return [...map.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function OrdersPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const { startCall } = useVoiceCall();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    function reload() {
      const local = getLocalOrders<Order>();
      setOrders(mergeOrders(local, []));
      void fetchOrders().then((remote) => {
        setOrders(mergeOrders(getLocalOrders<Order>(), remote));
      });
    }
    reload();
    window.addEventListener("dnols-account-sync", reload);
    const db = getFirebaseDb();
    const stop =
      db && user?.uid
        ? listenBuyerOrders(db, user.uid, (live) => {
            setOrders((cur) => {
              const map = new Map(cur.map((o) => [o.id, o]));
              for (const m of live) {
                const prev = map.get(m.orderId);
                map.set(m.orderId, {
                  ...(prev ?? {
                    id: m.orderId,
                    listingIds: m.listingIds,
                    status: "paid_held",
                    totalTzs: m.totalTzs,
                    createdAt: m.createdAt,
                    paidAt: m.paidAt,
                  }),
                  fulfillment: m.fulfillment,
                  deliveryAddress: m.deliveryAddress,
                  deliveryPhone: m.deliveryPhone,
                  deliveryStatus: m.deliveryStatus,
                  riderName: m.riderName,
                  riderId: m.riderId,
                  callStatus: m.callStatus,
                  callInitiatedBy: m.callInitiatedBy,
                });
              }
              return [...map.values()].sort((a, b) =>
                a.createdAt < b.createdAt ? 1 : -1,
              );
            });
          })
        : undefined;
    return () => {
      window.removeEventListener("dnols-account-sync", reload);
      stop?.();
    };
  }, [user?.uid]);

  function deleteOne(id: string) {
    if (!window.confirm(t("confirmDeleteOrder"))) return;
    removeLocalOrder(id);
    setOrders((cur) => cur.filter((o) => o.id !== id));
  }

  function deleteAll() {
    if (!window.confirm(t("confirmDeleteAllOrders"))) return;
    for (const o of orders) removeLocalOrder(o.id);
    clearLocalOrders();
    setOrders([]);
  }

  if (!user) {
    return (
      <div className="center-state">
        <p>Sign in to place orders and see your delivery history here.</p>
        <Link className="btn" to="/signin">
          Sign in
        </Link>
        <Link className="btn ghost" to="/">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="center-state">
        <p>No orders yet. Browse Kariakoo deals and pay when ready.</p>
        <Link className="btn" to="/">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="product-title">Orders</h1>
      <p className="section-desc">
        Checkout codes, pickup, and delivery status appear here after you pay.
      </p>
      {orders.map((o) => (
        <article key={o.id} className="order-card">
          <div className="order-card-head">
            <p className="price">{formatTsh(o.totalTzs)}</p>
            <span className={`order-status order-status--${o.status}`}>
              {STATUS_LABEL[o.status] ?? o.status}
            </span>
          </div>

          {o.pickupCode && o.status === "paid_held" && (
            <div className="order-pickup">
              <span className="muted">Checkout code</span>
              <span className="order-pickup-code">{o.pickupCode}</span>
            </div>
          )}

          {fulfillmentLabel(o) && (
            <p className="hint">
              {fulfillmentLabel(o)}
              {o.fulfillment === "delivery" && o.deliveryAddress
                ? ` · ${o.deliveryAddress}`
                : ""}
            </p>
          )}

          {o.fulfillment === "delivery" && (
            <ol className="delivery-track">
              {(
                [
                  "unassigned",
                  "assigned",
                  "picked_up",
                  "delivered",
                ] as const
              ).map((step) => {
                const current = o.deliveryStatus ?? "unassigned";
                const order = [
                  "unassigned",
                  "assigned",
                  "picked_up",
                  "delivered",
                ] as const;
                const on = order.indexOf(current) >= order.indexOf(step);
                return (
                  <li
                    key={step}
                    className={`delivery-step ${on ? "on" : ""}`}
                  >
                    {deliveryTrackLabel(step, lang)}
                  </li>
                );
              })}
            </ol>
          )}
          {o.fulfillment === "delivery" && o.riderName && (
            <p className="hint">
              {o.riderName}
            </p>
          )}

          {o.fulfillment === "delivery" &&
            canPlaceVoiceCall(o) &&
            o.deliveryStatus !== "delivered" && (
              <button
                type="button"
                className="btn voice-call-order-btn"
                style={{ marginTop: 12, width: "100%" }}
                onClick={() => {
                  void startCall({
                    orderId: o.id,
                    buyerUid: user?.uid ?? "",
                    buyerName: user?.displayName || "Buyer",
                    sellerIds: [],
                    shopIds: o.shopIds ?? [],
                    listingIds: o.listingIds,
                    items: [],
                    totalTzs: o.totalTzs,
                    fulfillment: "delivery",
                    deliveryAddress: o.deliveryAddress ?? "",
                    deliveryPhone: o.deliveryPhone ?? "",
                    deliveryLat: null,
                    deliveryLng: null,
                    deliveryStatus: o.deliveryStatus ?? "assigned",
                    riderId: o.riderId ?? null,
                    riderName: o.riderName ?? null,
                    riderAuthUid: null,
                    riderAssignedAt: null,
                    pickedUpAt: null,
                    deliveredAt: null,
                    createdAt: o.createdAt,
                    paidAt: o.paidAt,
                    callStatus: o.callStatus ?? "idle",
                    callInitiatedBy: o.callInitiatedBy ?? null,
                    callStartedAt: null,
                  });
                }}
              >
                {t("callRider")}
              </button>
            )}

          {o.fulfillment === "delivery" && o.deliveryStatus === "delivered" && (
            <p className="hint" style={{ marginTop: 8 }}>
              {t("deliveryComplete")}
            </p>
          )}

          {o.deliveryPhone && (
            <p className="hint">
              {o.fulfillment === "pickup" ? "Contact" : "Delivery contact"} ·{" "}
              {formatTzPhoneDisplay(o.deliveryPhone)}
            </p>
          )}

          {(o.payMethod || o.payPhone) && (
            <p className="hint">
              {payMethodLabel(o.payMethod)}
              {o.payPhone ? ` · ${formatTzPhoneDisplay(o.payPhone)}` : ""}
            </p>
          )}

          {o.directions?.map((d) => (
            <div key={d.shopName} className="order-direction">
              <p className="order-direction-name">{d.shopName}</p>
              <p className="muted">{d.streetAddress}</p>
            </div>
          ))}

          {o.listingIds.length === 1 && (
            <p className="order-items-hint">
              <Link to={`/product/${o.listingIds[0]}`} className="order-item-link">
                View item
              </Link>
            </p>
          )}
          {o.listingIds.length > 1 && (
            <p className="order-items-hint muted">{o.listingIds.length} items</p>
          )}

          <p className="hint">
            {new Date(o.paidAt ?? o.createdAt).toLocaleString()}
          </p>

          <div className="order-card-actions">
            <button
              type="button"
              className="order-delete"
              onClick={() => deleteOne(o.id)}
            >
              {t("deleteOrder")}
            </button>
          </div>
        </article>
      ))}
      <button type="button" className="btn ghost" onClick={deleteAll}>
        {t("deleteAllOrders")}
      </button>
    </div>
  );
}
