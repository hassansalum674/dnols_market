import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { payOrder } from "../api/client";
import { EmptyCart } from "../components/EmptyState";
import { formatTsh } from "../lib/format";
import { useCart } from "../store/cart";
import { markPaid, saveLocalOrder } from "../store/persist";

const STEPS = ["Pickup", "Payment", "Review"] as const;

export function CheckoutPage() {
  const { items, totalTzs, clear } = useCart();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState(
    () => localStorage.getItem("dnols.phone") || "2557",
  );

  if (items.length === 0) return <EmptyCart />;

  const pay = async () => {
    setBusy(true);
    const ids = items.flatMap((i) => Array.from({ length: i.qty }, () => i.listing.id));
    const unique = [...new Set(items.map((i) => i.listing.id))];
    const order = await payOrder(unique.length ? unique : ids, phone);
    markPaid(order.listingIds, order.accessToken || "paid");
    saveLocalOrder(order);
    clear();
    setBusy(false);
    nav("/orders");
  };

  return (
    <div>
      <div className="progress">
        {STEPS.map((s, i) => (
          <span key={s} className={i <= step ? "on" : ""}>
            {i + 1} {s}
          </span>
        ))}
      </div>
      <div className="checkout-page">
        {step === 0 && (
          <>
            <h1 className="product-title">Pickup in Kariakoo</h1>
            <p className="muted">
              Walk-up after payment. We keep the stall address until you pay.
            </p>
            <p className="hint">Same-day collection. Bring your pickup code.</p>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="product-title">Payment</h1>
            <p className="muted">
              Full price is held in escrow. You may refuse at the stall if it is
              not as listed. STK push (M-Pesa / Mixx / Airtel) is stubbed.
            </p>
            <label className="muted" htmlFor="mm">
              Mobile money number
            </label>
            <input
              id="mm"
              className="search-input"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                localStorage.setItem("dnols.phone", e.target.value);
              }}
            />
            <p className="price" style={{ fontSize: 22, fontWeight: 700 }}>
              {formatTsh(totalTzs)}
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="product-title">Review</h1>
            {items.map((i) => (
              <p key={i.listing.id}>
                {i.listing.title} · {formatTsh(i.listing.priceTzs)}
              </p>
            ))}
            <p className="price" style={{ fontWeight: 700 }}>
              {formatTsh(totalTzs)}
            </p>
          </>
        )}
        <p className="hint">
          <Link to="/cart">Back to bag</Link>
        </p>
      </div>
      <div className="sticky-buy">
        {step < 2 ? (
          <button type="button" className="btn" onClick={() => setStep((s) => s + 1)}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn" disabled={busy} onClick={() => void pay()}>
            Pay to reserve
          </button>
        )}
      </div>
    </div>
  );
}
