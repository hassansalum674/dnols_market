import { useCart } from "../store/cart";
import { useCheckoutSheet } from "../store/checkoutSheet";
import type { PublicListing } from "../types";
import { useI18n } from "../store/i18n";

type Props = {
  listing: PublicListing;
  label?: string;
};

/** Reserve a single item and open checkout sheet from the bottom. */
export function ReservePayButton({ listing, label }: Props) {
  const { replaceWith } = useCart();
  const { openBasket } = useCheckoutSheet();
  const { t } = useI18n();

  function reserve() {
    if (!listing.inStock) return;
    replaceWith(listing);
    openBasket();
  }

  return (
    <button
      type="button"
      className="btn reserve-btn"
      disabled={!listing.inStock}
      onClick={reserve}
    >
      {listing.inStock ? (label ?? t.reservePay) : t.soldOut}
    </button>
  );
}
