import type { Category, ListingFilters, Sort } from "../types";

type Props = {
  open: boolean;
  filters: ListingFilters;
  count: number;
  onClose: () => void;
  onChange: (next: ListingFilters) => void;
  onApply: () => void;
};

const CATEGORIES: { value: Category | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "fashion", label: "Fashion" },
  { value: "electronics", label: "Electronics" },
];

const DISTANCES: { value: number | ""; label: string }[] = [
  { value: "", label: "Any distance" },
  { value: 200, label: "200m walk" },
  { value: 500, label: "500m walk" },
  { value: 1000, label: "1km walk" },
];

const SORTS: { value: Sort; label: string }[] = [
  { value: "nearest", label: "Nearest" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price · low" },
  { value: "price_desc", label: "Price · high" },
];

export function FilterSheet({
  open,
  filters,
  count,
  onClose,
  onChange,
  onApply,
}: Props) {
  if (!open) return null;

  const set = (patch: Partial<ListingFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden />
      <div className="sheet" role="dialog" aria-label="Filters" aria-modal="true">
        <div className="sheet-head">
          <h3>Filters</h3>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="sheet-section-label" id="filter-category">Category</p>
        <div className="sheet-options" role="radiogroup" aria-labelledby="filter-category">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              type="button"
              role="radio"
              aria-checked={filters.category === c.value}
              className={`sheet-chip ${filters.category === c.value ? "on" : ""}`}
              onClick={() => set({ category: c.value })}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="sheet-section-label" id="filter-distance">Walking distance</p>
        <div className="sheet-options" role="radiogroup" aria-labelledby="filter-distance">
          {DISTANCES.map((d) => (
            <button
              key={d.label}
              type="button"
              role="radio"
              aria-checked={filters.maxDistance === d.value}
              className={`sheet-chip ${filters.maxDistance === d.value ? "on" : ""}`}
              onClick={() => set({ maxDistance: d.value })}
            >
              {d.label}
            </button>
          ))}
        </div>

        <p className="sheet-section-label" id="filter-sort">Sort by</p>
        <div className="sheet-options" role="radiogroup" aria-labelledby="filter-sort">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={(filters.sort ?? "nearest") === s.value}
              className={`sheet-chip ${(filters.sort ?? "nearest") === s.value ? "on" : ""}`}
              onClick={() => set({ sort: s.value })}
            >
              {s.label}
            </button>
          ))}
        </div>

        <p className="sheet-section-label">Price range (TSh)</p>
        <div className="sheet-price-row">
          <input
            className="sheet-field"
            inputMode="numeric"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              set({ minPrice: e.target.value === "" ? "" : Number(e.target.value) })
            }
          />
          <span className="sheet-price-sep">–</span>
          <input
            className="sheet-field"
            inputMode="numeric"
            placeholder="Max"
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
          In stock only
        </button>

        <button
          type="button"
          className="btn sheet-apply"
          onClick={() => {
            onApply();
            onClose();
          }}
        >
          Show {count} results
        </button>
      </div>
    </>
  );
}
