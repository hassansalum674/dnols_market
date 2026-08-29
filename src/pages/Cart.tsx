import { Link } from "react-router-dom";
import { EmptyCart } from "../components/EmptyState";
import { formatTsh } from "../lib/format";
import { useCart } from "../store/cart";

export function CartPage() {
  const { items, setQty, totalTzs } = useCart();
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      {items.map((line) => (
        <div key={line.listing.id} className="order-card" style={{ display: "flex", gap: 12 }}>
          <img
            src={line.listing.photoUrl}
            alt=""
            style={{ width: 72, height: 72, objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 6px" }}>{line.listing.title}</p>
            <p className="price" style={{ margin: 0 }}>
              {formatTsh(line.listing.priceTzs)}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="button" onClick={() => setQty(line.listing.id, line.qty - 1)}>
                −
              </button>
              <span className="price">{line.qty}</span>
              <button type="button" onClick={() => setQty(line.listing.id, line.qty + 1)}>
                +
              </button>
            </div>
          </div>
        </div>
      ))}
      <p className="price" style={{ fontSize: 18, fontWeight: 700, marginTop: 16 }}>
        {formatTsh(totalTzs)}
      </p>
      <div className="sticky-pay">
        <Link className="btn" to="/checkout">
          Checkout
        </Link>
      </div>
    </div>
  );
}
