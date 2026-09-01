import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteOrder, fetchOrders } from "../api/client";
import { useAuth } from "../store/auth";
import { PAY_METHODS } from "../lib/checkout";
import { formatTsh } from "../lib/format";
import { formatTzPhoneDisplay } from "../lib/phone";
import { deleteLocalOrder, getLocalOrders } from "../store/persist";
import { useI18n } from "../store/i18n";
import type { Order } from "../types";

export function OrdersPage() {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);

  const statusLabel: Record<Order["status"], string> = {
    reserved: t.statusReserved,
    paid_held: t.statusPaid,
    handed_over: t.statusDelivered,
    rejected_refund: t.statusRefunded,
  };

  useEffect(() => {
    const local = getLocalOrders<Order>();
    setOrders(local);
    void fetchOrders().then((remote) => {
      const map = new Map<string, Order>();
      [...local, ...remote].forEach((o) => map.set(o.id, o));
      setOrders(
        [...map.values()].sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : -1,
        ),
      );
    });
  }, []);

  async function removeOrder(id: string) {
    if (!window.confirm(t.deleteOrderConfirm)) return;
    deleteLocalOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    try {
      await deleteOrder(id);
    } catch {
      /* local removal is enough for now */
    }
  }

  function payMethodLabel(id?: string): string | null {
    if (!id) return null;
    return PAY_METHODS.find((m) => m.id === id)?.label ?? id;
  }

  if (!user) {
    return (
      <div className="center-state">
        <p>{t.signInForOrders}</p>
        <Link className="btn" to="/signin">
          {t.signIn}
        </Link>
        <Link className="btn ghost" to="/">
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="center-state">
        <p>{t.noOrders}</p>
        <Link className="btn" to="/">
          {t.startShopping}
        </Link>
      </div>
    );
  }

  const locale = language === "swahili" ? "sw-TZ" : "en-TZ";

  return (
    <div className="page">
      <h1 className="product-title">{t.ordersTitle}</h1>
      <p className="section-desc">{t.ordersDesc}</p>
      {orders.map((o) => (
        <article key={o.id} className="order-card">
          <div className="order-card-head">
            <p className="price">{formatTsh(o.totalTzs)}</p>
            <span className={`order-status order-status--${o.status}`}>
              {statusLabel[o.status] ?? o.status}
            </span>
          </div>

          {o.pickupCode && o.status === "paid_held" && (
            <div className="order-pickup">
              <span className="muted">{t.checkoutCode}</span>
              <span className="order-pickup-code">{o.pickupCode}</span>
            </div>
          )}

          {o.deliveryPhone && (
            <p className="hint">
              {t.deliveryContact} · {formatTzPhoneDisplay(o.deliveryPhone)}
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
                {t.viewItem}
              </Link>
            </p>
          )}
          {o.listingIds.length > 1 && (
            <p className="order-items-hint muted">{t.itemsCount(o.listingIds.length)}</p>
          )}

          <p className="hint">
            {new Date(o.paidAt ?? o.createdAt).toLocaleString(locale)}
          </p>

          <button
            type="button"
            className="btn ghost order-delete"
            onClick={() => void removeOrder(o.id)}
          >
            {t.deleteOrder}
          </button>
        </article>
      ))}
    </div>
  );
}
