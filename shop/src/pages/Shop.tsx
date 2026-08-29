import { useEffect, useMemo, useState } from "react";
import { getHealth, getOrder, getPlaces } from "../api";
import { addPayout, loadHours, loadPayouts, saveHours } from "../storage";
import { useShopData } from "../shopData";
import type { Place, PayoutMock, ShopHours } from "../types";
import { formatTzs } from "./errors";

const BUYER = "/app";

export function ShopPage() {
  const { saved } = useShopData();
  const [place, setPlace] = useState<Place | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [hours, setHours] = useState<ShopHours>(() => loadHours());
  const [payouts, setPayouts] = useState<PayoutMock[]>(() => loadPayouts());
  const [released, setReleased] = useState(0);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  useEffect(() => {
    void getPlaces()
      .then((r) => setPlace(r.places[0] ?? null))
      .catch(() => setPlace(null));
    void getHealth()
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(saved.map((s) => getOrder(s.orderId).catch(() => null))).then(
      (rows) => {
        if (cancelled) return;
        const sum = rows
          .filter((o) => o?.escrow === "handed_over")
          .reduce((n, o) => n + (o?.totalTzs ?? 0), 0);
        setReleased(sum);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [saved]);

  const paidOut = useMemo(
    () => payouts.reduce((n, p) => n + p.amountTzs, 0),
    [payouts],
  );
  const available = Math.max(0, released - paidOut);

  function mockPayout() {
    if (available <= 0) {
      setPayoutMsg("Nothing to pay out until a handover lands.");
      return;
    }
    const row: PayoutMock = {
      id: `po_${Date.now().toString(36)}`,
      amountTzs: available,
      at: new Date().toISOString(),
      note: "Mock mobile-money payout to stall wallet.",
    };
    setPayouts(addPayout(row));
    setPayoutMsg(`Sent ${formatTzs(row.amountTzs)} (stub).`);
  }

  function persistHours(next: ShopHours) {
    setHours(next);
    saveHours(next);
  }

  return (
    <div className="page">
      <section className="block">
        <h2>Place</h2>
        <p>
          {place?.name ?? "Kariakoo"}
          {place?.city ? `, ${place.city}` : " · Dar es Salaam"}
        </p>
        <p className="hint">
          {place?.hint ??
            "Shop-only cluster. Exact stall pin stays off buyer listings until they pay."}
        </p>
        <p className="hint">
          API {apiOk === null ? "…" : apiOk ? "up on :8787" : "down — start api/"}
        </p>
      </section>

      <section className="block">
        <h2>Hours</h2>
        <label className="lbl">Days</label>
        <input
          className="field"
          value={hours.days}
          onChange={(e) => persistHours({ ...hours, days: e.target.value })}
        />
        <label className="lbl">Open</label>
        <input
          className="field"
          type="time"
          value={hours.open}
          onChange={(e) => persistHours({ ...hours, open: e.target.value })}
        />
        <label className="lbl">Close</label>
        <input
          className="field"
          type="time"
          value={hours.close}
          onChange={(e) => persistHours({ ...hours, close: e.target.value })}
        />
        <p className="hint">Hours stay on this device only.</p>
      </section>

      <section className="block">
        <h2>Payout</h2>
        <p className="price" style={{ fontSize: 22, fontWeight: 700 }}>
          {formatTzs(available)}
        </p>
        <p className="muted">
          Released after handover: {formatTzs(released)}. Already mocked out:{" "}
          {formatTzs(paidOut)}.
        </p>
        <button className="btn" style={{ marginTop: 12 }} onClick={mockPayout}>
          Send payout
        </button>
        {payoutMsg && <p className="ok">{payoutMsg}</p>}
        {payouts.slice(0, 5).map((p) => (
          <div key={p.id} className="card">
            <div className="card-meta">
              <span className="price">{formatTzs(p.amountTzs)}</span>
              <span className="muted">{new Date(p.at).toLocaleString()}</span>
            </div>
            <p className="hint">{p.note}</p>
          </div>
        ))}
      </section>

      <a className="buy-link" href={BUYER}>
        Switch to buying
      </a>
      <p className="hint">Opens the buyer PWA on this same origin.</p>
    </div>
  );
}
