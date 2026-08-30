import { Link, useNavigate } from "react-router-dom";
import { EmptyCart } from "../components/EmptyState";
import { PAY_METHODS } from "../lib/checkout";
import { formatTsh } from "../lib/format";
import { useCart } from "../store/cart";

export function CartPage() {
  const { items, remove, setQty, totalTzs } = useCart();
  const nav = useNavigate();

  if (items.length === 0) return <EmptyCart />;

  const subtotal = totalTzs;

  return (
    <div className="unified-checkout">
      <header className="uc-topbar">
        <h1 className="uc-topbar-title">Your basket</h1>
        <button
          type="button"
          className="uc-close"
          aria-label="Close basket"
          onClick={() => nav(-1)}
        >
          ×
        </button>
      </header>

      <ul className="uc-items">
        {items.map((line) => (
          <li key={line.listing.id} className="uc-item">
            <img
              className="uc-item-photo"
              src={line.listing.photoUrl}
              alt=""
            />
            <div className="uc-item-body">
              <p className="uc-item-title">{line.listing.title}</p>
              <p className="uc-item-price">{formatTsh(line.listing.priceTzs)}</p>
              <div className="uc-item-actions">
                <div className="uc-qty">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty(line.listing.id, line.qty - 1)}
                  >
                    −
                  </button>
                  <span>{line.qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty(line.listing.id, line.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="uc-trash"
                  aria-label="Remove item"
                  onClick={() => remove(line.listing.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section className="uc-totals" aria-label="Order totals">
        <div className="uc-totals-row">
          <span>Subtotal</span>
          <span>{formatTsh(subtotal)}</span>
        </div>
        <div className="uc-totals-row">
          <span>Pickup in Kariakoo</span>
          <span className="uc-free">FREE</span>
        </div>
        <div className="uc-totals-row uc-totals-total">
          <span>Total</span>
          <span>{formatTsh(subtotal)}</span>
        </div>
      </section>

      <section className="uc-pay-section" aria-label="Unified checkout">
        <p className="uc-pay-label">Unified checkout</p>
        <p className="uc-pay-hint">
          Funds held in escrow until you pick up. Seller paid only after
          handover.
        </p>
        <div className="uc-pay-buttons">
          {PAY_METHODS.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className={`uc-pay-btn ${i === PAY_METHODS.length - 1 ? "uc-pay-btn--dark" : ""}`}
              onClick={() => nav(`/checkout?method=${m.id}`)}
            >
              <span
                className="uc-pay-mark"
                style={{ background: m.accent }}
                aria-hidden
              >
                {m.label.charAt(0)}
              </span>
              {m.checkoutLabel}
            </button>
          ))}
        </div>
        <p className="uc-pay-foot">
          M-Pesa · Mix by Yas · Airtel Money ·{" "}
          <Link to="/terms">escrow terms</Link>
        </p>
      </section>
    </div>
  );
}
