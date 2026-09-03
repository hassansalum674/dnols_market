import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import {
  deliveryTrackLabel,
  formatTzMobileTyping,
  isValidTzMobile,
  listenRiderOrders,
  RiderClaimError,
  type MarketOrderDoc,
} from "../lib/deliveryCloud";
import { getFirebaseDb, initFirebase } from "../lib/firebase";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { SignInPage } from "./SignIn";

function linkErrorMessage(
  e: unknown,
  t: (key: "notLinked" | "linkFailedOffline" | "linkFailedDenied") => string,
): string {
  if (e instanceof RiderClaimError) {
    if (e.reason === "offline") return t("linkFailedOffline");
    if (e.reason === "taken" || e.reason === "denied") return t("linkFailedDenied");
    return t("notLinked");
  }
  if (e instanceof Error && /offline/i.test(e.message)) return t("linkFailedOffline");
  return t("notLinked");
}

function LinkPhoneForm() {
  const { t, tf, lang, setLang } = useI18n();
  const { linkPhone, signOut } = useAuth();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const digits = phone.replace(/\D/g, "").replace(/^255/, "").replace(/^0/, "");
  const ready = isValidTzMobile(phone);

  async function save() {
    setErr(null);
    if (!ready) {
      setErr(t("badPhone"));
      return;
    }
    setBusy(true);
    try {
      const ok = await linkPhone(phone);
      if (!ok) setErr(t("notLinked"));
    } catch (e) {
      setErr(linkErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page rider-signin">
      <div className="rider-signin-card">
        <BrandLogo height={32} />
        <h1 className="stall-page-title">{t("linkPhoneTitle")}</h1>
        <p className="hint">{t("linkPhoneHint")}</p>
        <div className="chip-grid" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`chip ${lang === "en" ? "selected" : ""}`}
            onClick={() => setLang("en")}
          >
            {t("english")}
          </button>
          <button
            type="button"
            className={`chip ${lang === "sw" ? "selected" : ""}`}
            onClick={() => setLang("sw")}
          >
            {t("swahili")}
          </button>
        </div>
        <label className="lbl" htmlFor="link-phone">
          {t("phoneNumber")}
        </label>
        <input
          id="link-phone"
          className="field"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("phoneHint")}
          value={phone}
          onChange={(e) => setPhone(formatTzMobileTyping(e.target.value))}
        />
        <p className="hint">
          {digits.length === 0
            ? t("phoneHint")
            : ready
              ? null
              : tf("phoneCount", { n: digits.length })}
        </p>
        <button className="btn" disabled={busy} onClick={() => void save()}>
          {busy ? t("linking") : t("linkPhone")}
        </button>
        <button type="button" className="btn ghost" onClick={() => void signOut()}>
          {t("signOut")}
        </button>
        {err && <p className="err">{err}</p>}
      </div>
    </div>
  );
}

function badge(order: MarketOrderDoc) {
  if (order.deliveryStatus === "delivered") return "deliveredBadge";
  if (order.deliveryStatus === "picked_up") return "pickedUpBadge";
  return "assigned";
}

export function DeliveriesPage() {
  const { user, rider, loading, signOut } = useAuth();
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState<MarketOrderDoc[]>([]);

  useEffect(() => {
    if (!rider) {
      setOrders([]);
      return;
    }
    let stop: (() => void) | undefined;
    let cancelled = false;
    void initFirebase().then(() => {
      const db = getFirebaseDb();
      if (!db || cancelled) {
        setOrders([]);
        return;
      }
      stop = listenRiderOrders(db, rider.riderId, rider.authUid, setOrders);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [rider]);

  if (loading) {
    return (
      <div className="page stall-page">
        <p className="muted">{t("verifying")}</p>
      </div>
    );
  }

  if (!user) return <SignInPage />;

  return (
    <div className="page stall-page">
      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">{t("myDeliveries")}</h1>
          <p className="muted stall-page-desc">
            {user.phone || rider?.phone || ""}
          </p>
        </div>
        <button type="button" className="btn ghost" onClick={() => void signOut()}>
          {t("signOut")}
        </button>
      </header>

      {!rider ? (
        <LinkPhoneForm />
      ) : orders.length === 0 ? (
        <div className="center-state">
          <p>{t("noDeliveries")}</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <Link
              key={o.orderId}
              to={`/delivery/${encodeURIComponent(o.orderId)}`}
              className="card order-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="pill live">{t(badge(o))}</span>
              <h2>{o.buyerName}</h2>
              <p className="hint">{o.deliveryAddress}</p>
              <p className="muted">
                {deliveryTrackLabel(o.deliveryStatus, lang)}
              </p>
              <p className="price">
                {o.items.length} {t("items")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
