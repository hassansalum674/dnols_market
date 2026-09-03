import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHealth, getOrder, getPlaces } from "../api";
import { BuyerPortalLink } from "../components/BuyerPortalLink";
import { InstallAppSettings } from "../components/InstallApp";
import { addPayout, loadHours, loadPayouts, saveHours } from "../storage";
import { useShopData } from "../shopData";
import { useI18n } from "../store/i18n";
import type { Place, PayoutMock, ShopHours } from "../types";
import { formatTzs } from "./errors";

export function ShopPage() {
  const { t } = useI18n();
  const { saved } = useShopData();
  const [place, setPlace] = useState<Place | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [hours, setHours] = useState<ShopHours>(() => loadHours());
  const [payouts, setPayouts] = useState<PayoutMock[]>(() => loadPayouts());
  const [released, setReleased] = useState(0);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  useEffect(() => {
    void getPlaces()
      .then((r) => setPlace(r.places[0] ?? null))
      .catch(() => setPlace(null));
    void getHealth()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
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

  function sendPayout() {
    if (available <= 0) {
      setPayoutMsg("Nothing to pay out until a handover is confirmed.");
      return;
    }
    const row: PayoutMock = {
      id: `po_${Date.now().toString(36)}`,
      amountTzs: available,
      at: new Date().toISOString(),
      note: "Sent to your mobile money wallet.",
    };
    setPayouts(addPayout(row));
    setPayoutMsg(`Sent ${formatTzs(row.amountTzs)} to your wallet.`);
  }

  function persistHours(next: ShopHours) {
    setHours(next);
    saveHours(next);
  }

  return (
    <div className="page stall-page">
      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">Shop settings</h1>
          <p className="muted stall-page-desc">
            Your stall details, opening hours, and payouts.
          </p>
        </div>
      </header>

      <div className="shop-settings-grid">
        <section className="block shop-panel">
          <h2>{t("myRiders")}</h2>
          <p className="muted">{t("myRidersHint")}</p>
          <Link to="/stall/riders" className="btn">
            {t("myRiders")}
          </Link>
        </section>

        <section className="block shop-panel">
          <h2>Stall location</h2>
          <p>
            {place?.name ?? "Kariakoo"}
            {place?.city ? `, ${place.city}` : " · Dar es Salaam"}
          </p>
          <p className="hint">
            {place?.hint ??
              "Your exact stall pin is shared with buyers only after they pay."}
          </p>
          <p className="hint">
            {online === null
              ? "Checking connection…"
              : online
                ? "Connected to Dnols"
                : "Offline — some features may be limited"}
          </p>
        </section>

        <section className="block shop-panel">
          <h2>Opening hours</h2>
          <label className="lbl">Days open</label>
          <input
            className="field"
            value={hours.days}
            onChange={(e) => persistHours({ ...hours, days: e.target.value })}
          />
          <label className="lbl">Opens</label>
          <input
            className="field"
            type="time"
            value={hours.open}
            onChange={(e) => persistHours({ ...hours, open: e.target.value })}
          />
          <label className="lbl">Closes</label>
          <input
            className="field"
            type="time"
            value={hours.close}
            onChange={(e) => persistHours({ ...hours, close: e.target.value })}
          />
          <p className="hint">Hours are saved on this device.</p>
        </section>

        <section className="block shop-panel">
          <h2>Payouts</h2>
          <p className="price shop-payout-amount">{formatTzs(available)}</p>
          <p className="muted">
            Available after confirmed handovers: {formatTzs(released)}. Already
            sent: {formatTzs(paidOut)}.
          </p>
          <button className="btn shop-payout-btn" type="button" onClick={sendPayout}>
            Send to mobile money
          </button>
          {payoutMsg && <p className="ok">{payoutMsg}</p>}
          {payouts.slice(0, 5).map((p) => (
            <div key={p.id} className="card payout-card">
              <div className="card-meta">
                <span className="price">{formatTzs(p.amountTzs)}</span>
                <span className="muted">{new Date(p.at).toLocaleString()}</span>
              </div>
              <p className="hint">{p.note}</p>
            </div>
          ))}
        </section>
        <InstallAppSettings />
      </div>

      <BuyerPortalLink className="buy-link">
        {t("switchToShopping")}
      </BuyerPortalLink>
    </div>
  );
}
