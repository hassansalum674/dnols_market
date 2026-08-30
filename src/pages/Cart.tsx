import { Link } from "react-router-dom";
import { EmptyCart } from "../components/EmptyState";
import { formatTsh } from "../lib/format";
import { useCart } from "../store/cart";

export function CartPage() {
  const { items, remove, clear, totalTzs } = useCart();
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="page cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Your cart</h1>
        <button type="button" className="cart-clear-btn" onClick={clear}>
          Clear cart
        </button>
      </div>

      <ul className="cart-list">
        {items.map((line) => (
          <li key={line.listing.id} className="cart-line">
            <img className="cart-line-photo" src={line.listing.photoUrl} alt="" />
            <div className="cart-line-body">
              <p className="cart-line-title">{line.listing.title}</p>
              <p className="price cart-line-price">
                {formatTsh(line.listing.priceTzs)}
                {line.qty > 1 && (
                  <span className="muted"> × {line.qty}</span>
                )}
              </p>
              <button
                type="button"
                className="cart-remove-btn"
                onClick={() => remove(line.listing.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <p className="cart-total-label">Total</p>
        <p className="price cart-total">{formatTsh(totalTzs)}</p>
      </div>

      <div className="sticky-pay">
        <Link className="btn" to="/checkout">
          Continue to payment
        </Link>
      </div>
    </div>
  );
}
