import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrder, handoverOrder } from "../api";
import { ShimmerList } from "../components/Splash";
import { useShopData } from "../shopData";
import type { OrderView, SavedOrder } from "../types";
import { formatTzs } from "./errors";

type Row = { saved: SavedOrder; live: OrderView | null; err?: string };

export function TodayPage() {
  const { saved, refresh } = useShopData();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);

  const load = useCallback(async () => {
    const next = await Promise.all(
      saved.map(async (s) => {
        try {
          const live = await getOrder(s.orderId);
          return { saved: s, live };
        } catch (e) {
          return {
            saved: s,
            live: null,
            err: e instanceof Error ? e.message : "missing",
          };
        }
      }),
    );
    setRows(next);
  }, [saved]);

  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const incoming = (rows ?? []).filter((r) => r.live?.escrow === "paid_held");

  if (offline && !rows) {
    return (
      <div className="page">
        <div className="center-state">
          <img src="/brand/logo4_submark.svg" alt="" width={48} height={48} />
          <p>You're offline. Pickups need the API.</p>
        </div>
      </div>
    );
  }

  if (rows === null) {
    return (
      <div className="page">
        <ShimmerList rows={3} />
      </div>
    );
  }

  if (incoming.length === 0) {
    return (
      <div className="page">
        <div className="center-state">
          <img src="/brand/logo4_submark.svg" alt="" width={48} height={48} />
          <p>No pickups waiting. Demo an incoming order from Orders.</p>
          <Link className="btn" to="/orders">
            Open Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <p className="muted">
        Buyer walks up. Confirm the handover PIN from pay — escrow then
        releases.
      </p>
      {incoming.map((r) => (
        <PickupCard
          key={r.saved.orderId}
          row={r}
          onDone={() => {
            refresh();
            void load();
          }}
        />
      ))}
    </div>
  );
}

function PickupCard({ row, onDone }: { row: Row; onDone: () => void }) {
  const live = row.live!;
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pinFromPay = row.saved.handoverPin || live.handoverPin || "";

  async function confirm(useStored: boolean) {
    const value = useStored ? pinFromPay : pin.trim();
    if (!value) {
      setErr("Enter the PIN the buyer shows, or use Confirm from pay.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await handoverOrder(live.orderId, value);
      setMsg(res.mock ?? "Handed over.");
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "handover failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card">
      <span className="pill live">pickup · {live.escrow}</span>
      <h2>{live.orderId}</h2>
      <div className="card-meta">
        <span className="price">{formatTzs(live.totalTzs)}</span>
        <span className="muted">{live.listingIds.length} SKU</span>
      </div>
      <p className="hint">Ask the buyer for the handover PIN (or pickup code).</p>
      <input
        className="pin-input"
        inputMode="numeric"
        maxLength={8}
        placeholder="••••"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        aria-label="Handover PIN"
      />
      <div className="btn-row">
        <button
          className="btn"
          disabled={busy}
          onClick={() => void confirm(false)}
        >
          Confirm PIN
        </button>
        <button
          className="btn ghost"
          disabled={busy || !pinFromPay}
          onClick={() => void confirm(true)}
        >
          Seller confirm
        </button>
      </div>
      <p className="hint">
        Seller confirm posts the PIN stored from POST /orders/pay (the mock
        has no separate seller PIN).
      </p>
      {err && <p className="err">{err}</p>}
      {msg && <p className="ok">{msg}</p>}
    </article>
  );
}
