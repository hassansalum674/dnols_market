import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/client";
import { useAuth } from "../store/auth";
import { PAY_METHODS } from "../lib/checkout";
import { formatTsh } from "../lib/format";
import { formatTzPhoneDisplay } from "../lib/phone";
import { getLocalOrders } from "../store/persist";
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

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

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
        </article>
      ))}
    </div>
  );
}
