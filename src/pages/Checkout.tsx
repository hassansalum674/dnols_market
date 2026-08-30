import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { payOrder } from "../api/client";
import { EmptyCart } from "../components/EmptyState";
import { formatTsh } from "../lib/format";
import {
  loadLastPayMethod,
  loadLastPayPhone,
  PAY_METHODS,
  saveCheckoutPrefs,
  type PayMethod,
} from "../lib/checkout";
import {
  formatTzPhoneDisplay,
  isValidTzPhone,
  normalizeTzPhone,
} from "../lib/phone";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";
import { markPaid, saveLocalOrder } from "../store/persist";
import type { DirectionsPayload, Order } from "../types";

type Step = "details" | "waiting" | "success";

const KARIAKOO = { lat: -6.8224, lng: 39.2739 };

function mapUrl(d?: DirectionsPayload): string {
  const lat = d?.lat ?? KARIAKOO.lat;
  const lng = d?.lng ?? KARIAKOO.lng;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=640x280&markers=${lat},${lng},red`;
}

function orderDisplayId(id: string): string {
  const tail = id.replace(/^ord_/, "").slice(-4).toUpperCase();
  return tail || id.slice(-4).toUpperCase();
}

export function CheckoutPage() {
  const { items, totalTzs, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const methodParam = params.get("method") as PayMethod | null;

  const [step, setStep] = useState<Step>("details");
  const [method, setMethod] = useState<PayMethod>("mpesa");
  const [phone, setPhone] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedMethod = loadLastPayMethod();
    const savedPhone = loadLastPayPhone();
    if (
      methodParam === "mpesa" ||
      methodParam === "tigo" ||
      methodParam === "airtel"
    ) {
      setMethod(methodParam);
    } else {
      setMethod(savedMethod);
    }
    setPhone(savedPhone);
  }, [methodParam]);

  if (items.length === 0 && step !== "success") return <EmptyCart />;

  const selectedMethod = PAY_METHODS.find((m) => m.id === method)!;
  const displayPhone = formatTzPhoneDisplay(phone);
  const savedPhone = loadLastPayPhone();
  const contactEmail = user?.email ?? "Add email when you sign in";
  const primaryDirection = order?.directions?.[0];

  const startPayment = async () => {
    setErr(null);
    if (!isValidTzPhone(phone)) {
      setErr("Enter a valid Tanzania mobile money number (+255 7XX XXX XXX).");
      return;
    }
    const normalized = normalizeTzPhone(phone);
    setStep("waiting");
    const listingIds = [...new Set(items.map((i) => i.listing.id))];
    try {
      await new Promise((r) => setTimeout(r, 2200));
      const paid = await payOrder({
        listingIds,
        payMethod: method,
        phone: normalized,
      });
      saveCheckoutPrefs(normalized, method);
      markPaid(paid.listingIds, paid.accessToken || "paid");
      saveLocalOrder(paid);
      clear();
      setOrder(paid);
      setStep("success");
    } catch (e) {
      setStep("details");
      setErr(e instanceof Error ? e.message : "Payment failed. Try again.");
    }
  };

  if (step === "waiting") {
    return (
      <div className="unified-checkout">
        <header className="uc-topbar">
          <span className="uc-topbar-spacer" />
          <h1 className="uc-topbar-title">Confirm payment</h1>
          <span className="uc-topbar-spacer" />
        </header>
        <div className="checkout-waiting">
          <div className="stk-pulse" aria-hidden />
          <h2 className="checkout-title">Check your phone</h2>
          <p className="section-desc">
            We sent a request to <strong>{displayPhone || phone}</strong> on{" "}
            {selectedMethod.label}.
          </p>
          <p className="hint">{selectedMethod.stkHint}</p>
          <p className="checkout-waiting-note">
            Do not close this screen until payment completes.
          </p>
        </div>
      </div>
    );
  }

  if (step === "success" && order) {
    const mapTarget = primaryDirection ?? {
      shopName: "Kariakoo Market",
      streetAddress: "Kariakoo, Dar es Salaam",
      lat: KARIAKOO.lat,
      lng: KARIAKOO.lng,
      mapsHint: "Show your pickup code at the stall",
    };

    return (
      <div className="unified-checkout unified-checkout--success">
        <header className="uc-success-header">
          <button
            type="button"
            className="uc-back"
            aria-label="Menu"
            onClick={() => nav("/")}
          >
            ☰
          </button>
          <span className="uc-brand">DNOLS</span>
          <Link to="/orders" className="uc-bag" aria-label="Orders">
            🛍
          </Link>
        </header>

        <div className="uc-success-body">
          <div className="checkout-success-badge" aria-hidden>
            ✓
          </div>
          <h1 className="uc-success-title">Thank you for shopping with us!</h1>
          <p className="uc-order-id">
            YOUR ORDER #{order.pickupCode ?? orderDisplayId(order.id)}
          </p>

          <section className="uc-panel">
            <h2 className="uc-panel-label">Pickup at</h2>
            <p className="uc-panel-strong">{mapTarget.shopName}</p>
            <p className="muted">{mapTarget.streetAddress}</p>
            <a
              className="uc-map"
              href={`https://www.google.com/maps?q=${mapTarget.lat},${mapTarget.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              <img src={mapUrl(mapTarget)} alt="Pickup location map" />
            </a>
            <p className="hint">{mapTarget.mapsHint}</p>
          </section>

          <section className="uc-panel">
            <h2 className="uc-panel-label">Payment method</h2>
            <div className="uc-paid-with">
              <span
                className="uc-pay-mark"
                style={{ background: selectedMethod.accent }}
                aria-hidden
              >
                {selectedMethod.label.charAt(0)}
              </span>
              <div>
                <p className="uc-panel-strong">{selectedMethod.label}</p>
                <p className="muted">
                  {order.payPhone
                    ? formatTzPhoneDisplay(order.payPhone)
                    : displayPhone}
                </p>
              </div>
            </div>
            <p className="hint">
              {formatTsh(order.totalTzs)} held in escrow until handover.
            </p>
          </section>

          <button
            type="button"
            className="uc-continue-link"
            onClick={() => nav("/")}
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-checkout">
      <header className="uc-topbar">
        <button
          type="button"
          className="uc-back"
          aria-label="Back to basket"
          onClick={() => nav("/cart")}
        >
          ←
        </button>
        <h1 className="uc-topbar-title uc-topbar-title--caps">Checkout</h1>
        <span className="uc-topbar-spacer" />
      </header>

      <section className="uc-panel">
        <div className="uc-panel-head">
          <h2 className="uc-panel-label">Contact details</h2>
          <button
            type="button"
            className="uc-edit"
            onClick={() => setEditingContact((v) => !v)}
          >
            {editingContact ? "Done" : "Edit"}
          </button>
        </div>
        {editingContact || !user ? (
          <div className="uc-contact-edit">
            {!user && (
              <p className="hint">
                <Link to="/signin">Sign in</Link> to save orders across devices.
              </p>
            )}
            <label className="field-label" htmlFor="checkout-phone">
              Mobile money number
            </label>
            <input
              id="checkout-phone"
              className="sheet-field"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+255 7XX XXX XXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErr(null);
              }}
            />
          </div>
        ) : (
          <div className="uc-contact">
            <p className="uc-panel-strong">{contactEmail}</p>
            <p className="muted">
              {displayPhone || "Add your mobile money number"}
            </p>
          </div>
        )}
      </section>

      <section className="uc-panel">
        <div className="uc-panel-head">
          <h2 className="uc-panel-label">Payment details</h2>
          <button
            type="button"
            className="uc-edit"
            onClick={() => nav("/cart")}
          >
            Switch
          </button>
        </div>

        <div className="uc-wallets">
          {PAY_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`uc-wallet ${method === m.id ? "on" : ""}`}
              onClick={() => setMethod(m.id)}
            >
              <span
                className="uc-pay-mark"
                style={{ background: m.accent }}
                aria-hidden
              >
                {m.label.charAt(0)}
              </span>
              <div className="uc-wallet-text">
                <p className="uc-panel-strong">{m.label}</p>
                <p className="muted">{m.network}</p>
              </div>
            </button>
          ))}
        </div>

        {savedPhone && savedPhone !== phone && (
          <button
            type="button"
            className="uc-use-saved"
            onClick={() => setPhone(savedPhone)}
          >
            Use saved number · {formatTzPhoneDisplay(savedPhone)}
          </button>
        )}

        <label className="field-label" htmlFor="pay-phone">
          Number to charge
        </label>
        <input
          id="pay-phone"
          className="sheet-field"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+255 7XX XXX XXX"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setErr(null);
          }}
        />
        <p className="hint">{selectedMethod.stkHint}</p>
      </section>

      <section className="uc-panel uc-panel--compact">
        <div className="uc-totals-row">
          <span>Total</span>
          <span className="price">{formatTsh(totalTzs)}</span>
        </div>
      </section>

      {err && <p className="err uc-err">{err}</p>}

      <div className="uc-sticky">
        <button type="button" className="btn" onClick={() => void startPayment()}>
          Continue
        </button>
      </div>
    </div>
  );
}
