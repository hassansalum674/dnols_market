import type { BillingCard } from "../lib/billingCards";
import { payMethodMeta } from "../lib/billingCards";
import { formatTzPhoneDisplay } from "../lib/phone";

type Props = {
  card: BillingCard;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  compact?: boolean;
};

export function BillingCardTile({
  card,
  selected,
  onSelect,
  onRemove,
  compact,
}: Props) {
  const meta = payMethodMeta(card.method);

  return (
    <div
      className={`billing-card billing-card--${card.method} ${selected ? "on" : ""} ${compact ? "billing-card--compact" : ""}`.trim()}
    >
      <button
        type="button"
        className="billing-card-body"
        onClick={onSelect}
        disabled={!onSelect}
      >
        <div className="billing-card-top">
          <span
            className="billing-card-logo"
            style={{ background: meta.accent }}
            aria-hidden
          >
            {meta.label.charAt(0)}
          </span>
          <span className="billing-card-brand">{meta.label}</span>
        </div>
        <p className="billing-card-phone">{formatTzPhoneDisplay(card.phone)}</p>
        {!compact && (
          <p className="billing-card-network">{meta.network}</p>
        )}
        {card.label && (
          <p className="billing-card-label">{card.label}</p>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          className="billing-card-remove"
          aria-label="Remove billing card"
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}
