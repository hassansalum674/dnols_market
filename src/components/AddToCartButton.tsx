import { useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../store/cart";
import type { PublicListing } from "../types";
import { useI18n } from "../store/i18n";

export function AddToCartButton({
  listing,
  label,
  fly = true,
}: {
  listing: PublicListing;
  label?: string;
  fly?: boolean;
}) {
  const { add } = useCart();
  const { t } = useI18n();
  const [ok, setOk] = useState(false);
  const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
  const action = label ?? t.addToCart;

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!listing.inStock) return;
    const r = e.currentTarget.getBoundingClientRect();
    add(listing);
    setOk(true);
    window.setTimeout(() => setOk(false), 1400);
    if (fly) {
      setDot({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      window.setTimeout(() => setDot(null), 600);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`btn ${ok ? "check" : ""}`}
        disabled={!listing.inStock}
        onClick={onClick}
      >
        {ok ? (
          <svg className="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.5 10 17l9-10" />
          </svg>
        ) : listing.inStock ? (
          action
        ) : (
          t.soldOut
        )}
      </button>
      {dot &&
        createPortal(
          <span
            className="fly"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${dot.x}px, ${dot.y}px)`,
              animation: "none",
            }}
            ref={(el) => {
              if (!el) return;
              requestAnimationFrame(() => {
                const cart = document.querySelector(".tabbar a[href='/cart']");
                const cr = cart?.getBoundingClientRect();
                el.style.transform = cr
                  ? `translate(${cr.left + cr.width / 2}px, ${cr.top}px)`
                  : `translate(${window.innerWidth - 80}px, ${window.innerHeight - 40}px)`;
                el.style.opacity = "0.2";
              });
            }}
          />,
          document.body,
        )}
    </>
  );
}
