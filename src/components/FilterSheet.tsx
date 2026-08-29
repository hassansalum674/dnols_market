import { useEffect } from "react";
import type { Category, ListingFilters, Sort } from "../types";

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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (patch: Partial<ListingFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="Filters">
        <h3>Filters</h3>
        <label htmlFor="cat">Category</label>
        <select
          id="cat"
          value={filters.category ?? ""}
          onChange={(e) =>
            set({ category: (e.target.value || "") as Category | "" })
          }
        >
          <option value="">All</option>
          <option value="fashion">Fashion</option>
          <option value="electronics">Electronics</option>
        </select>
        <label htmlFor="dist">Walking distance</label>
        <select
          id="dist"
          value={filters.maxDistance ?? ""}
          onChange={(e) =>
            set({
              maxDistance: e.target.value ? Number(e.target.value) : "",
            })
          }
        >
          <option value="">Any</option>
          <option value="200">200m</option>
          <option value="500">500m</option>
          <option value="1000">1km</option>
        </select>
        <label htmlFor="sort">Sort</label>
        <select
          id="sort"
          value={filters.sort ?? "nearest"}
          onChange={(e) => set({ sort: e.target.value as Sort })}
        >
          <option value="nearest">Nearest</option>
          <option value="price_asc">Price · low</option>
          <option value="price_desc">Price · high</option>
          <option value="newest">Newest</option>
        </select>
        <label htmlFor="min">Min price (TSh)</label>
        <input
          id="min"
          inputMode="numeric"
          value={filters.minPrice ?? ""}
          onChange={(e) =>
            set({ minPrice: e.target.value === "" ? "" : Number(e.target.value) })
          }
        />
        <label htmlFor="max">Max price (TSh)</label>
        <input
          id="max"
          inputMode="numeric"
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            set({ maxPrice: e.target.value === "" ? "" : Number(e.target.value) })
          }
        />
        <label>
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) => set({ inStock: e.target.checked })}
          />{" "}
          In stock
        </label>
        <div style={{ height: 16 }} />
        <button
          type="button"
          className="btn"
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
