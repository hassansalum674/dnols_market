import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/client";
import { formatTsh } from "../lib/format";
import { getLocalOrders } from "../store/persist";
import type { Order } from "../types";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const local = getLocalOrders<Order>();
    void fetchOrders().then((remote) => {
      const map = new Map<string, Order>();
      [...local, ...remote].forEach((o) => map.set(o.id, o));
      setOrders([...map.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
    });
    setOrders(local);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="center-state">
        <p>No orders yet. Pay nearby, then walk.</p>
        <Link className="btn" to="/">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="product-title">Orders</h1>
      {orders.map((o) => (
        <div key={o.id} className="order-card">
          <p className="price">{formatTsh(o.totalTzs)}</p>
          <p className="muted">{o.status.replace("_", " ")}</p>
          {o.pickupCode && <p>Pickup code · {o.pickupCode}</p>}
          <p className="hint">{new Date(o.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
