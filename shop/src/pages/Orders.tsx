import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrder, handoverOrder, payOrder, rejectOrder } from "../api";
import { escrowLabel, shortOrderRef } from "../lib/orderLabels";
import { shopIdFromUid } from "../lib/accountId";
import {
  assignRider,
  listenSellerOrders,
  listenSellerRiders,
  publishMarketOrder,
  type MarketOrderDoc,
  type RiderDoc,
} from "../lib/deliveryCloud";
import { getFirebaseDb } from "../lib/firebase";
import { ShimmerList } from "../components/Splash";
import { useShopData } from "../shopData";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import type { OrderView, SavedOrder } from "../types";
import { formatTzs } from "./errors";

const DEMO_LISTING = "lst_kitenge_maxi_01";

type Row = { saved: SavedOrder; live: OrderView | null; err?: string };

export function OrdersPage() {
  const { saved, remember, forget, refresh } = useShopData();
  const { user } = useAuth();
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [market, setMarket] = useState<MarketOrderDoc[]>([]);
  const [riders, setRiders] = useState<RiderDoc[]>([]);
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

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db || !user?.uid) return;
    const shopId = shopIdFromUid(user.uid);
    const stopOrders = listenSellerOrders(db, user.uid, shopId, setMarket);
    const stopRiders = listenSellerRiders(db, user.uid, setRiders);
    return () => {
      stopOrders();
      stopRiders();
    };
  }, [user?.uid]);

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
      const db = getFirebaseDb();
      if (db && user?.uid) {
        await publishMarketOrder(db, {
          orderId: pay.orderId,
          buyerUid: user.uid,
          buyerName: "Sample buyer",
          sellerIds: [user.uid],
          shopIds: [shopIdFromUid(user.uid)],
          listingIds: pay.listingIds,
          items: [{ title: "Sample kitenge", qty: 1 }],
          totalTzs: pay.totalTzs,
          fulfillment: "delivery",
          deliveryAddress: "Kariakoo sample drop-off",
          deliveryPhone: "",
          deliveryLat: null,
          deliveryLng: null,
          pickupCode: pay.pickupCode,
          deliveryStatus: "unassigned",
          riderId: null,
          riderName: null,
          riderAuthUid: null,
          riderAssignedAt: null,
          pickedUpAt: null,
          deliveredAt: null,
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          callStatus: "idle",
          callInitiatedBy: null,
          callStartedAt: null,
        });
      }
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
        <Link to="/stall/riders" className="btn ghost">
          {t("myRiders")}
        </Link>
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
      ) : rows.length === 0 && market.length === 0 ? (
        <div className="center-state">
          <p>No orders yet. When a buyer pays, the order appears here.</p>
        </div>
      ) : (
        <div className="order-list">
          {rows.map((r) => (
            <EscrowCard
              key={r.saved.orderId}
              row={r}
              market={market.find((m) => m.orderId === r.saved.orderId)}
              riders={riders}
              deleteLabel={t("deleteOrder")}
              confirmDelete={t("confirmDeleteOrder")}
              onDelete={() => forget(r.saved.orderId)}
              onChange={() => {
                refresh();
                void load();
              }}
            />
          ))}
          {market
            .filter((m) => !rows.some((r) => r.saved.orderId === m.orderId))
            .map((m) => (
              <article key={m.orderId} className="card order-card">
                <span className="pill live">{m.deliveryStatus}</span>
                <h2>{shortOrderRef(m.orderId)}</h2>
                <p className="hint">
                  {m.buyerName} · {m.deliveryAddress}
                </p>
                <div className="card-meta">
                  <span className="price">{formatTzs(m.totalTzs)}</span>
                </div>
                {m.deliveryStatus !== "delivered" && (
                  <AssignRiderBlock order={m} riders={riders} />
                )}
              </article>
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
  market,
  riders,
}: {
  row: Row;
  onChange: () => void;
  onDelete: () => void;
  deleteLabel: string;
  confirmDelete: string;
  market?: MarketOrderDoc;
  riders: RiderDoc[];
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
      {market && (
        <p className="hint">
          {market.deliveryStatus}
          {market.riderName ? ` · ${market.riderName}` : ""}
        </p>
      )}
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
      {market?.fulfillment === "delivery" &&
        market.deliveryStatus !== "delivered" && (
          <AssignRiderBlock order={market} riders={riders} />
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

function AssignRiderBlock({
  order,
  riders,
}: {
  order: MarketOrderDoc;
  riders: RiderDoc[];
}) {
  const { t } = useI18n();
  const [riderId, setRiderId] = useState(order.riderId ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const idle = riders.filter((r) => r.status === "idle" || r.riderId === order.riderId);

  async function assign() {
    const rider = riders.find((r) => r.riderId === riderId);
    const db = getFirebaseDb();
    if (!db || !rider) return;
    setBusy(true);
    setErr(null);
    try {
      await assignRider(db, order.orderId, rider);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("riderFail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="assign-rider">
      <p className="hint">{t("assignRiderHint")}</p>
      {order.riderName && (
        <p className="muted">
          {t("assignedTo")}: {order.riderName}
        </p>
      )}
      {idle.length === 0 ? (
        <p className="hint">
          {t("noIdleRiders")}{" "}
          <Link to="/stall/riders">{t("myRiders")}</Link>
        </p>
      ) : (
        <div className="btn-row">
          <select
            className="field"
            value={riderId}
            onChange={(e) => setRiderId(e.target.value)}
          >
            <option value="">{t("assignRider")}</option>
            {idle.map((r) => (
              <option key={r.riderId} value={r.riderId}>
                {r.name} ({r.status === "idle" ? t("riderIdle") : t("riderBusy")})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            disabled={busy || !riderId}
            onClick={() => void assign()}
          >
            {t("assignRider")}
          </button>
        </div>
      )}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
