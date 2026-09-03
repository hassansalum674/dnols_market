import { useCallback, useEffect, useState } from "react";
import { getOrder, handoverOrder, payOrder, rejectOrder } from "../api";
import { escrowLabel, shortOrderRef } from "../lib/orderLabels";
import { ShimmerList } from "../components/Splash";
import { useShopData } from "../shopData";
import { useI18n } from "../store/i18n";
import type { OrderView, SavedOrder } from "../types";
import { formatTzs } from "./errors";

const DEMO_LISTING = "lst_kitenge_maxi_01";

type Row = { saved: SavedOrder; live: OrderView | null; err?: string };

export function OrdersPage() {
  const { saved, remember, forget, refresh } = useShopData();
  const { t } = useI18n();
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
            err: e instanceof Error ? e.message : "unavailable",
          };
        }
      }),
    );
    setRows(next);
  }, [saved]);

  useEffect(() => {
    void load();
  }, [load]);

  async function trySampleOrder() {
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
        `Sample order ${shortOrderRef(pay.orderId)} is ready. Confirm pickup on Today.`,
      );
      refresh();
    } catch (e) {
      setDemoErr(
        e instanceof Error
          ? `${e.message}. Check your connection and try again.`
          : "Could not create sample order",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page stall-page">
      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">Orders</h1>
          <p className="muted stall-page-desc">
            Payments held in escrow until you confirm the buyer received the item.
          </p>
        </div>
      </header>

      <details className="demo-panel">
        <summary>Try a sample order (for testing)</summary>
        <p className="hint">
          Creates a practice order so you can see how pickup confirmation works.
        </p>
        <button className="btn" disabled={busy} onClick={() => void trySampleOrder()}>
          Create sample order
        </button>
        {demoErr && <p className="err">{demoErr}</p>}
        {demoMsg && <p className="ok">{demoMsg}</p>}
      </details>

      {rows === null ? (
        <ShimmerList rows={3} />
      ) : rows.length === 0 ? (
        <div className="center-state">
          <p>No orders yet. When a buyer pays, the order appears here.</p>
        </div>
      ) : (
        <div className="order-list">
          {rows.map((r) => (
            <EscrowCard
              key={r.saved.orderId}
              row={r}
              deleteLabel={t("deleteOrder")}
              confirmDelete={t("confirmDeleteOrder")}
              onDelete={() => forget(r.saved.orderId)}
              onChange={() => {
                refresh();
                void load();
              }}
            />
          ))}
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              if (!window.confirm(t("confirmDeleteAllOrders"))) return;
              for (const r of rows) forget(r.saved.orderId);
            }}
          >
            {t("deleteAllOrders")}
          </button>
        </div>
      )}
    </div>
  );
}

function EscrowCard({
  row,
  onChange,
  onDelete,
  deleteLabel,
  confirmDelete,
}: {
  row: Row;
  onChange: () => void;
  onDelete: () => void;
  deleteLabel: string;
  confirmDelete: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const live = row.live;
  const pin = row.saved.handoverPin;
  const status = live?.escrow ?? row.err ?? null;

  async function hand() {
    if (!live) return;
    setBusy(true);
    setErr(null);
    try {
      await handoverOrder(live.orderId, pin);
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not confirm handover");
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
      setErr(e instanceof Error ? e.message : "Could not process refund");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card order-card">
      <span className={live?.escrow === "paid_held" ? "pill live" : "pill"}>
        {escrowLabel(status)}
      </span>
      <h2>{shortOrderRef(row.saved.orderId)}</h2>
      <div className="card-meta">
        <span className="price">{formatTzs(row.saved.totalTzs)}</span>
        <span className="muted">
          {row.saved.listingIds.length} item
          {row.saved.listingIds.length === 1 ? "" : "s"}
        </span>
      </div>
      {!live && (
        <p className="hint">
          This order could not be loaded. It may have expired — try the sample
          order again if you were testing.
        </p>
      )}
      {live?.escrow === "paid_held" && (
        <div className="btn-row">
          <button className="btn" disabled={busy} onClick={() => void hand()}>
            Confirm handover
          </button>
          <button className="btn ghost" disabled={busy} onClick={() => void reject()}>
            Refund buyer
          </button>
        </div>
      )}
      {err && <p className="err">{err}</p>}
      <div className="order-card-actions">
        <button
          type="button"
          className="order-delete"
          disabled={busy}
          onClick={() => {
            if (!window.confirm(confirmDelete)) return;
            onDelete();
          }}
        >
          {deleteLabel}
        </button>
      </div>
    </article>
  );
}
