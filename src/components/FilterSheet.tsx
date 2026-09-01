import type { Category, ListingFilters, Sort } from "../types";
import { useI18n } from "../store/i18n";

type Props = {
  open: boolean;
  filters: ListingFilters;
  count: number;
  onClose: () => void;
  onChange: (next: ListingFilters) => void;
  onApply: () => void;
};

export function FilterSheet({
  open,
  filters,
  count,
  onClose,
  onChange,
  onApply,
}: Props) {
  const { t } = useI18n();
  if (!open) return null;

  const set = (patch: Partial<ListingFilters>) =>
    onChange({ ...filters, ...patch });

  const categories: { value: Category | ""; label: string }[] = [
    { value: "", label: t.all },
    { value: "fashion", label: t.fashion },
    { value: "electronics", label: t.electronics },
  ];
  const distances: { value: number | ""; label: string }[] = [
    { value: "", label: t.anyDistance },
    { value: 200, label: t.walk200 },
    { value: 500, label: t.walk500 },
    { value: 1000, label: t.walk1km },
  ];
  const sorts: { value: Sort; label: string }[] = [
    { value: "nearest", label: t.nearest },
    { value: "newest", label: t.newest },
    { value: "price_asc", label: t.priceLow },
    { value: "price_desc", label: t.priceHigh },
  ];

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden />
      <div className="sheet" role="dialog" aria-label={t.filters} aria-modal="true">
        <div className="sheet-head">
          <h3>{t.filters}</h3>
          <button type="button" className="sheet-close" onClick={onClose} aria-label={t.close}>
            ×
          </button>
        </div>

        <p className="sheet-section-label">{t.category}</p>
        <div className="sheet-options">
          {categories.map((c) => (
            <button
              key={c.label}
              type="button"
              className={`sheet-chip ${filters.category === c.value ? "on" : ""}`}
              onClick={() => set({ category: c.value })}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="sheet-section-label">{t.walkingDistance}</p>
        <div className="sheet-options">
          {distances.map((d) => (
            <button
              key={d.label}
              type="button"
              className={`sheet-chip ${filters.maxDistance === d.value ? "on" : ""}`}
              onClick={() => set({ maxDistance: d.value })}
            >
              {d.label}
            </button>
          ))}
        </div>

        <p className="sheet-section-label">{t.sortBy}</p>
        <div className="sheet-options">
          {sorts.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`sheet-chip ${(filters.sort ?? "nearest") === s.value ? "on" : ""}`}
              onClick={() => set({ sort: s.value })}
            >
              {s.label}
            </button>
          ))}
        </div>

        <p className="sheet-section-label">{t.priceRange}</p>
        <div className="sheet-price-row">
          <input
            className="sheet-field"
            inputMode="numeric"
            placeholder={t.min}
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              set({ minPrice: e.target.value === "" ? "" : Number(e.target.value) })
            }
          />
          <span className="sheet-price-sep">–</span>
          <input
            className="sheet-field"
            inputMode="numeric"
            placeholder={t.max}
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              set({ maxPrice: e.target.value === "" ? "" : Number(e.target.value) })
            }
          />
        </div>

        <button
          type="button"
          className={`sheet-chip sheet-chip-wide ${filters.inStock ? "on" : ""}`}
          onClick={() => set({ inStock: !filters.inStock })}
        >
          {t.inStockOnly}
        </button>

        <button
          type="button"
          className="btn sheet-apply"
          onClick={() => {
            onApply();
            onClose();
          }}
        >
          {t.showResults(count)}
        </button>
      </div>
    </>
  );
}
