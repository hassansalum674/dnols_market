import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrder, handoverOrder } from "../api/client";
import { formatTsh } from "../lib/format";
import { getLocalOrders } from "../store/persist";
import type { Order } from "../types";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pin, setPin] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = async () => {
    const local = getLocalOrders<Order>();
    const merged: Order[] = [];
    for (const o of local) {
      const remote = await fetchOrder(o.id);
      merged.push(remote ?? o);
    }
    setOrders(
      merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    );
  };

  useEffect(() => {
    void refresh();
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

  const active = orders.filter(
    (o) => o.status === "paid_held" || o.status === "reserved",
  );
  const rest = orders.filter((o) => !active.includes(o));

  const confirm = async (o: Order) => {
    const res = await handoverOrder(o.id, pin[o.id] || o.pickupCode, "confirm");
    setMsg(res ? `Escrow ${res.escrow}` : "Could not confirm — check PIN or API.");
    await refresh();
  };

  const reject = async (o: Order) => {
    const res = await handoverOrder(o.id, undefined, "reject");
    setMsg(res ? `Escrow ${res.escrow}` : "Reject failed.");
    await refresh();
  };

  const card = (o: Order) => (
    <div key={o.id} className="order-card">
      <p className="price">{formatTsh(o.totalTzs)}</p>
      <p className="muted">{o.status.replaceAll("_", " ")}</p>
      {o.pickupCode && <p>Pickup code · {o.pickupCode}</p>}
      {o.handoverPin && o.status === "paid_held" && (
        <p className="hint">Handover PIN · {o.handoverPin}</p>
      )}
      {o.status === "paid_held" && o.directions?.map((d) => (
        <div key={d.shopName} className="you-block">
          <p>{d.shopName}</p>
          <p>{d.streetAddress}</p>
          <p className="hint">{d.mapsHint}</p>
          <a
            className="btn"
            href={`https://maps.google.com/?q=${d.lat},${d.lng}`}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: 8 }}
          >
            Open map
          </a>
        </div>
      ))}
      {o.status === "paid_held" && (
        <>
          <input
            className="search-input"
            placeholder="PIN at the stall"
            value={pin[o.id] ?? ""}
            onChange={(e) => setPin((p) => ({ ...p, [o.id]: e.target.value }))}
          />
          <button type="button" className="btn" onClick={() => void confirm(o)}>
            Confirm handover
          </button>
          <button type="button" className="chip on" onClick={() => void reject(o)}>
            Refuse at counter
          </button>
        </>
      )}
      <p className="hint">{new Date(o.createdAt).toLocaleString()}</p>
    </div>
  );

  return (
    <div className="page">
      <h1 className="product-title">Orders</h1>
      {msg && <p className="hint">{msg}</p>}
      {active.length > 0 && <h2 className="muted">Active pickups</h2>}
      {active.map(card)}
      {rest.length > 0 && <h2 className="muted">History</h2>}
      {rest.map(card)}
    </div>
  );
}
