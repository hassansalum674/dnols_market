import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { handoverOrder } from "../api";
import { escrowLabel, shortOrderRef } from "../lib/orderLabels";
import { loadShopOrderRows, type OrderRow } from "../lib/shopOrders";
import { ShimmerList } from "../components/Splash";
import { useShopData } from "../shopData";
import { formatTzs } from "./errors";

export function TodayPage() {
  const { saved, refresh } = useShopData();
  const [rows, setRows] = useState<OrderRow[] | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);

  const load = useCallback(async () => {
    setRows(await loadShopOrderRows(saved));
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
    const tick = window.setInterval(() => void load(), 12000);
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const incoming = (rows ?? []).filter((r) => r.live?.escrow === "paid_held");

  if (offline && !rows) {
    return (
      <div className="page stall-page">
        <div className="center-state">
          <img src="/brand/logo4_submark.svg" alt="" width={48} height={48} />
          <p>You&apos;re offline. Reconnect to see today&apos;s pickups.</p>
        </div>
      </div>
    );
  }

  if (rows === null) {
    return (
      <div className="page stall-page">
        <ShimmerList rows={3} />
      </div>
    );
  }

  if (incoming.length === 0) {
    return (
      <div className="page stall-page">
        <header className="stall-page-head">
          <div>
            <h1 className="stall-page-title">Today</h1>
            <p className="muted stall-page-desc">
              Buyers ready to pick up appear here after they pay.
            </p>
          </div>
        </header>
        <div className="center-state">
          <img src="/brand/logo4_submark.svg" alt="" width={48} height={48} />
          <p>No pickups waiting right now.</p>
          <Link className="btn" to="/stall/orders">
            View orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page stall-page">
      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">Today</h1>
          <p className="muted stall-page-desc">
            Confirm the buyer&apos;s code when they arrive — then escrow releases
            to you.
          </p>
        </div>
      </header>
      <div className="order-list">
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
    </div>
  );
}

function PickupCard({ row, onDone }: { row: OrderRow; onDone: () => void }) {
  const live = row.live!;
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pinFromPay = row.saved.handoverPin || live.handoverPin || "";

  async function confirm(useStored: boolean) {
    const value = useStored ? pinFromPay : pin.trim();
    if (!value) {
      setErr("Enter the code the buyer shows you.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await handoverOrder(live.orderId, value);
      setMsg(res.mock ?? "Handover confirmed.");
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not confirm handover");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card order-card">
      <span className="pill live">{escrowLabel(live.escrow)}</span>
      <h2>{shortOrderRef(live.orderId)}</h2>
      <div className="card-meta">
        <span className="price">{formatTzs(live.totalTzs)}</span>
        <span className="muted">
          {live.listingIds.length} item{live.listingIds.length === 1 ? "" : "s"}
        </span>
      </div>
      {live.listingTitles && live.listingTitles.length > 0 && (
        <p className="hint">{live.listingTitles.join(" · ")}</p>
      )}
      {(live.deliveryPhone || live.payPhone) && (
        <p className="hint">Buyer · {live.deliveryPhone || live.payPhone}</p>
      )}
      <p className="hint">Ask the buyer for their handover code or checkout code.</p>
      <input
        className="pin-input"
        inputMode="numeric"
        maxLength={8}
        placeholder="Enter code"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        aria-label="Handover code"
      />
      <div className="btn-row">
        <button
          className="btn"
          disabled={busy}
          onClick={() => void confirm(false)}
        >
          Confirm code
        </button>
        {pinFromPay && (
          <button
            className="btn ghost"
            disabled={busy}
            onClick={() => void confirm(true)}
          >
            Use saved code
          </button>
        )}
      </div>
      {err && <p className="err">{err}</p>}
      {msg && <p className="ok">{msg}</p>}
    </article>
  );
}
