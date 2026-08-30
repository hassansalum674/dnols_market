import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { payOrder } from "../api/client";
import { EmptyCart } from "../components/EmptyState";
import { formatTsh } from "../lib/format";
import { useCart } from "../store/cart";
import { markPaid, saveLocalOrder } from "../store/persist";

type PayMethod = "mpesa" | "tigo" | "airtel";

const METHODS: { id: PayMethod; label: string; hint: string }[] = [
  { id: "mpesa", label: "M-Pesa", hint: "Vodacom" },
  { id: "tigo", label: "Mix by Yas", hint: "Tigo Pesa" },
  { id: "airtel", label: "Airtel Money", hint: "Airtel" },
];

export function CheckoutPage() {
  const { items, totalTzs, clear } = useCart();
  const nav = useNavigate();
  const [method, setMethod] = useState<PayMethod>("mpesa");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (items.length === 0) return <EmptyCart />;

  const pay = async () => {
    setErr(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setErr("Enter the mobile money number that will pay.");
      return;
    }
    setBusy(true);
    try {
      const unique = [...new Set(items.map((i) => i.listing.id))];
      const order = await payOrder(unique);
      markPaid(order.listingIds, order.accessToken || "paid");
      saveLocalOrder({ ...order, payMethod: method, payPhone: phone });
      clear();
      nav("/orders");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page checkout-flow">
      <h1 className="checkout-title">Pay & reserve</h1>
      <p className="section-desc">
        Money is held in escrow until you pick up at the stall in Kariakoo.
      </p>

      <section className="checkout-card">
        <h2>Your order</h2>
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

      <section className="checkout-card">
        <h2>Pickup</h2>
        <p className="muted">
          After payment you get a pickup code. The stall address unlocks in your
          order — walk to Kariakoo and show the code to the seller.
        </p>
      </section>

      <section className="checkout-card">
        <h2>How you pay</h2>
        <div className="pay-methods">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`pay-method ${method === m.id ? "on" : ""}`}
              onClick={() => setMethod(m.id)}
            >
              <span className="pay-method-label">{m.label}</span>
              <span className="pay-method-hint">{m.hint}</span>
            </button>
          ))}
        </div>

        <label className="field-label" htmlFor="pay-phone">
          Mobile money number
        </label>
        <input
          id="pay-phone"
          className="sheet-field"
          type="tel"
          inputMode="tel"
          placeholder="+255 7XX XXX XXX"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setErr(null);
          }}
        />
        <p className="hint">
          You will confirm on your phone (STK push / USSD). Card payments coming
          soon.
        </p>
      </section>

      {err && <p className="err">{err}</p>}

      <p className="hint checkout-back">
        <Link to="/cart">← Back to cart</Link>
      </p>

      <div className="sticky-buy">
        <button type="button" className="btn" disabled={busy} onClick={() => void pay()}>
          {busy ? "Processing…" : `Pay ${formatTsh(totalTzs)}`}
        </button>
      </div>
    </div>
  );
}
