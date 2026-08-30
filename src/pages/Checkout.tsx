import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import type { Order } from "../types";

type Step = "review" | "pay" | "waiting" | "success";

const STEPS: { id: Step; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "pay", label: "Pay" },
  { id: "waiting", label: "Confirm" },
  { id: "success", label: "Done" },
];

function stepIndex(step: Step): number {
  return STEPS.findIndex((s) => s.id === step);
}

export function CheckoutPage() {
  const { items, totalTzs, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("review");
  const [method, setMethod] = useState<PayMethod>("mpesa");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMethod(loadLastPayMethod());
    setPhone(loadLastPayPhone());
  }, []);

  if (items.length === 0 && step !== "success") return <EmptyCart />;

  const selectedMethod = PAY_METHODS.find((m) => m.id === method)!;
  const displayPhone = formatTzPhoneDisplay(phone);
  const current = stepIndex(step);

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
      setStep("pay");
      setErr(e instanceof Error ? e.message : "Payment failed. Try again.");
    }
  };

  return (
    <div className="page checkout-flow">
      <nav className="checkout-progress" aria-label="Checkout steps">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`checkout-progress-step ${i <= current ? "on" : ""} ${i === current ? "current" : ""}`}
          >
            {s.label}
          </span>
        ))}
      </nav>

      {step === "review" && (
        <>
          <h1 className="checkout-title">Review order</h1>
          <p className="section-desc">
            Your payment is held in escrow until you pick up in Kariakoo and
            confirm you received the item. The seller is paid only after
            handover.
          </p>

          {!user && (
            <p className="checkout-signin-hint">
              <Link to="/signin">Sign in</Link> to save orders across devices.
            </p>
          )}

          <section className="checkout-card">
            <h2>Items</h2>
            <ul className="checkout-items">
              {items.map((i) => (
                <li key={i.listing.id}>
                  <img src={i.listing.photoUrl} alt="" />
                  <div>
                    <p>{i.listing.title}</p>
                    <p className="muted">
                      {formatTsh(i.listing.priceTzs)}
                      {i.qty > 1 ? ` × ${i.qty}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="checkout-total">
              Total <span className="price">{formatTsh(totalTzs)}</span>
            </p>
          </section>

          <section className="checkout-card checkout-escrow">
            <h2>How escrow works</h2>
            <ol className="checkout-escrow-steps">
              <li>You pay with M-Pesa, Mix by Yas, or Airtel Money.</li>
              <li>Funds are held safely until pickup.</li>
              <li>You walk to the stall and show your pickup code.</li>
              <li>After you confirm receipt, the seller gets paid.</li>
            </ol>
          </section>

          <p className="hint checkout-back">
            <Link to="/cart">← Back to cart</Link>
          </p>

          <div className="sticky-buy">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setErr(null);
                setStep("pay");
              }}
            >
              Continue to pay
            </button>
          </div>
        </>
      )}

      {step === "pay" && (
        <>
          <h1 className="checkout-title">Pay with mobile money</h1>
          <p className="section-desc">
            Choose your wallet. We send a payment prompt to your phone — you
            confirm with your PIN on the {selectedMethod.network} screen.
          </p>

          <section className="checkout-card">
            <p className="checkout-total">
              Amount <span className="price">{formatTsh(totalTzs)}</span>
            </p>
          </section>

          <section className="checkout-card">
            <h2>Wallet</h2>
            <div className="pay-methods">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`pay-method ${method === m.id ? "on" : ""}`}
                  onClick={() => setMethod(m.id)}
                >
                  <span className="pay-method-label">{m.label}</span>
                  <span className="pay-method-hint">{m.network}</span>
                </button>
              ))}
            </div>

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

          {err && <p className="err">{err}</p>}

          <p className="hint checkout-back">
            <button
              type="button"
              className="text-link-btn"
              onClick={() => {
                setErr(null);
                setStep("review");
              }}
            >
              ← Back
            </button>
          </p>

          <div className="sticky-buy">
            <button
              type="button"
              className="btn"
              onClick={() => void startPayment()}
            >
              Send payment request
            </button>
          </div>
        </>
      )}

      {step === "waiting" && (
        <div className="checkout-waiting">
          <div className="stk-pulse" aria-hidden />
          <h1 className="checkout-title">Check your phone</h1>
          <p className="section-desc">
            We sent a payment request to{" "}
            <strong>{displayPhone || phone}</strong> on {selectedMethod.label}.
          </p>
          <p className="hint">{selectedMethod.stkHint}</p>
          <p className="checkout-waiting-note">
            Do not close this screen until payment completes.
          </p>
        </div>
      )}

      {step === "success" && order && (
        <div className="checkout-success">
          <div className="checkout-success-badge" aria-hidden>
            ✓
          </div>
          <h1 className="checkout-title">Payment received</h1>
          <p className="section-desc">
            {formatTsh(order.totalTzs)} is held in escrow. Walk to Kariakoo and
            show this code at the stall.
          </p>

          <section className="checkout-card checkout-pickup-code">
            <p className="muted">Pickup code</p>
            <p className="pickup-code-value">{order.pickupCode}</p>
            {order.payMethod && (
              <p className="hint">
                Paid via{" "}
                {PAY_METHODS.find((m) => m.id === order.payMethod)?.label ??
                  order.payMethod}
                {order.payPhone ? ` · ${formatTzPhoneDisplay(order.payPhone)}` : ""}
              </p>
            )}
          </section>

          {order.directions && order.directions.length > 0 && (
            <section className="checkout-card">
              <h2>Where to go</h2>
              {order.directions.map((d) => (
                <div key={d.shopName} className="checkout-direction">
                  <p className="checkout-direction-name">{d.shopName}</p>
                  <p className="muted">{d.streetAddress}</p>
                  <p className="hint">{d.mapsHint}</p>
                </div>
              ))}
            </section>
          )}

          <div className="sticky-buy">
            <button
              type="button"
              className="btn"
              onClick={() => nav("/orders")}
            >
              View my orders
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/")}
            >
              Keep shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
