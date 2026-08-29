import { useCallback, useEffect, useState } from "react";
import { getOrder, handoverOrder, payOrder, rejectOrder } from "../api";
import { ShimmerList } from "../Splash";
import { useShopData } from "../shopData";
import type { OrderView, SavedOrder } from "../types";
import { formatTzs } from "../format";

const DEMO_LISTING = "lst_kitenge_maxi_01";

type Row = { saved: SavedOrder; live: OrderView | null; err?: string };

export function OrdersPage() {
  const { saved, remember, refresh } = useShopData();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [demoMsg, setDemoMsg] = useState<string | null>(null);
  const [demoErr, setDemoErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const next = await Promise.all(
      saved.map(async (s) => {
        try {
          return { saved: s, live: await getOrder(s.orderId) };
        } catch (e) {
          return {
            saved: s,
            live: null,
            err: e instanceof Error ? e.message : "not_found",
          };
        }
      }),
    );
    setRows(next);
  }, [saved]);

  useEffect(() => {
    void load();
  }, [load]);

  async function demoIncoming() {
    setBusy(true);
    setDemoErr(null);
    setDemoMsg(null);
    try {
      const pay = await payOrder([DEMO_LISTING]);
      remember({
        orderId: pay.orderId,
        listingIds: pay.listingIds,
        handoverPin: pay.handoverPin,
        pickupCode: pay.pickupCode,
        accessToken: pay.accessToken,
        totalTzs: pay.totalTzs,
        createdAt: new Date().toISOString(),
      });
      setDemoMsg(
        `Paid & held ${pay.orderId}. PIN ${pay.handoverPin} (also pickup ${pay.pickupCode}). Confirm on Today or below.`,
      );
      refresh();
    } catch (e) {
      setDemoErr(
        e instanceof Error
          ? `${e.message}. Is the API running? Use npm run dev from the repo root.`
          : "pay failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <p className="muted">
        Escrow is per-order. The API has no list-all; we GET /orders/:id for
        ids saved after pay (and this demo).
      </p>
      <button className="btn" disabled={busy} onClick={() => void demoIncoming()}>
        Demo incoming order
      </button>
      <p className="hint">
        POST /orders/pay with {DEMO_LISTING}, then you can POST handover with
        the PIN from that response.
      </p>
      {demoErr && <p className="err">{demoErr}</p>}
      {demoMsg && <p className="ok">{demoMsg}</p>}

      {rows === null ? (
        <ShimmerList rows={3} />
      ) : rows.length === 0 ? (
        <div className="center-state">
          <p>No escrow yet. Run the demo, or pay from the buyer app and we
            still need the order id here — demo is the path until a seller
            inbox exists.</p>
        </div>
      ) : (
        rows.map((r) => (
          <EscrowCard
            key={r.saved.orderId}
            row={r}
            onChange={() => {
              refresh();
              void load();
            }}
          />
        ))
      )}
    </div>
  );
}

function EscrowCard({ row, onChange }: { row: Row; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const live = row.live;
  const pin = row.saved.handoverPin;

  async function hand() {
    if (!live) return;
    setBusy(true);
    setErr(null);
    try {
      await handoverOrder(live.orderId, pin);
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!live) return;
    setBusy(true);
    setErr(null);
    try {
      await rejectOrder(live.orderId);
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="shop-card">
      <span className={live?.escrow === "paid_held" ? "pill live" : "pill"}>
        {live?.escrow ?? row.err ?? "unknown"}
      </span>
      <h2>{row.saved.orderId}</h2>
      <div className="shop-card-meta">
        <span className="price">{formatTzs(row.saved.totalTzs)}</span>
        <span className="muted">{row.saved.listingIds.join(", ")}</span>
      </div>
      {!live && (
        <p className="hint">
          GET /orders/:id failed — API restart wipes in-memory orders. Demo
          again.
        </p>
      )}
      {live?.escrow === "paid_held" && (
        <div className="btn-row">
          <button className="btn" disabled={busy} onClick={() => void hand()}>
            Handover
          </button>
          <button className="btn ghost" disabled={busy} onClick={() => void reject()}>
            Reject refund
          </button>
        </div>
      )}
      {err && <p className="err">{err}</p>}
    </article>
  );
}
