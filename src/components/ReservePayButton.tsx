import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import type { PublicListing } from "../types";

type Props = {
  listing: PublicListing;
  label?: string;
};

/** Reserve a single item and go straight to checkout / payment. */
export function ReservePayButton({ listing, label = "Reserve & pay" }: Props) {
  const { replaceWith } = useCart();
  const navigate = useNavigate();

  function reserve() {
    if (!listing.inStock) return;
    replaceWith(listing);
    navigate("/cart");
  }

  return (
    <button
      type="button"
      className="btn reserve-btn"
      disabled={!listing.inStock}
      onClick={reserve}
    >
      {listing.inStock ? label : "Sold out"}
    </button>
  );
}
