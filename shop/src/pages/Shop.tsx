import { useEffect, useMemo, useState } from "react";
import { getHealth, getOrder, getPlaces } from "../api";
import { addPayout, loadHours, loadPayouts, saveHours } from "../storage";
import { useShopData } from "../shopData";
import { useLanguage } from "../store/language";
import type { Place, PayoutMock, ShopHours } from "../types";
import { PREFERRED_LANGUAGES } from "../types";
import { formatTzs } from "./errors";

const BUYER = "http://localhost:5173";

export function ShopPage() {
  const { saved } = useShopData();
  const { language, setLanguage, t, locale } = useLanguage();
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
      setPayoutMsg(t.nothingToPayout);
      return;
    }
    const row: PayoutMock = {
      id: `po_${Date.now().toString(36)}`,
      amountTzs: available,
      at: new Date().toISOString(),
      note: t.mockPayoutNote,
    };
    setPayouts(addPayout(row));
    setPayoutMsg(t.sentPayout(formatTzs(row.amountTzs)));
  }

  function persistHours(next: ShopHours) {
    setHours(next);
    saveHours(next);
  }

  return (
    <div className="page">
      <section className="block">
        <h2>{t.place}</h2>
        <p>
          {place?.name ?? "Kariakoo"}
          {place?.city ? `, ${place.city}` : ` · ${t.dar}`}
        </p>
        <p className="hint">{place?.hint ?? t.defaultPlaceHint}</p>
        <p className="hint">
          {apiOk === null ? t.apiChecking : apiOk ? t.apiUp : t.apiDown}
        </p>
      </section>

      <section className="block">
        <h2>{t.language}</h2>
        <div className="chip-grid language-chips" role="radiogroup" aria-label={t.language}>
          {PREFERRED_LANGUAGES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`chip ${language === opt.id ? "selected" : ""}`}
              aria-pressed={language === opt.id}
              onClick={() => setLanguage(opt.id)}
            >
              {opt.native}
            </button>
          ))}
        </div>
        <p className="hint">{t.languageHint}</p>
      </section>

      <section className="block">
        <h2>{t.hours}</h2>
        <label className="lbl">{t.days}</label>
        <input
          className="field"
          value={hours.days}
          onChange={(e) => persistHours({ ...hours, days: e.target.value })}
        />
        <label className="lbl">{t.open}</label>
        <input
          className="field"
          type="time"
          value={hours.open}
          onChange={(e) => persistHours({ ...hours, open: e.target.value })}
        />
        <label className="lbl">{t.close}</label>
        <input
          className="field"
          type="time"
          value={hours.close}
          onChange={(e) => persistHours({ ...hours, close: e.target.value })}
        />
        <p className="hint">{t.hoursHint}</p>
      </section>

      <section className="block">
        <h2>{t.payout}</h2>
        <p className="price" style={{ fontSize: 22, fontWeight: 700 }}>
          {formatTzs(available)}
        </p>
        <p className="muted">
          {t.releasedAfter}: {formatTzs(released)}. {t.alreadyMocked}:{" "}
          {formatTzs(paidOut)}.
        </p>
        <button className="btn" style={{ marginTop: 12 }} onClick={mockPayout}>
          {t.sendPayout}
        </button>
        {payoutMsg && <p className="ok">{payoutMsg}</p>}
        {payouts.slice(0, 5).map((p) => (
          <div key={p.id} className="card">
            <div className="card-meta">
              <span className="price">{formatTzs(p.amountTzs)}</span>
              <span className="muted">
                {new Date(p.at).toLocaleString(locale)}
              </span>
            </div>
            <p className="hint">{p.note}</p>
          </div>
        ))}
      </section>

      <a className="buy-link" href={BUYER}>
        {t.switchBuying}
      </a>
      <p className="hint">
        {t.buyerPwa} {BUYER}.
      </p>
    </div>
  );
}
