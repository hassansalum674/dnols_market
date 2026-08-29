import type { Category, ListingFilters } from "../types";

const CATS: { id: Category | ""; label: string }[] = [
  { id: "", label: "All" },
  { id: "fashion", label: "Fashion" },
  { id: "electronics", label: "Electronics" },
];

const DISTS: { m: number | ""; label: string }[] = [
  { m: "", label: "Any" },
  { m: 200, label: "200m" },
  { m: 500, label: "500m" },
  { m: 1000, label: "1km" },
];

export function BrowseRail({
  filters,
  onChange,
  onMore,
}: {
  filters: ListingFilters;
  onChange: (next: ListingFilters) => void;
  onMore: () => void;
}) {
  return (
    <aside className="browse-rail" aria-label="Browse options">
      <div className="rail-group">
        <h2 className="rail-label">Category</h2>
        {CATS.map((c) => (
          <button
            key={c.label}
            type="button"
            className={`rail-option ${filters.category === c.id ? "on" : ""}`}
            onClick={() => onChange({ ...filters, category: c.id })}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="rail-group">
        <h2 className="rail-label">Distance</h2>
        {DISTS.map((d) => (
          <button
            key={d.label}
            type="button"
            className={`rail-option ${filters.maxDistance === d.m ? "on" : ""}`}
            onClick={() => onChange({ ...filters, maxDistance: d.m })}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="rail-group">
        <h2 className="rail-label">Stock</h2>
        <button
          type="button"
          className={`rail-option ${filters.inStock ? "on" : ""}`}
          onClick={() => onChange({ ...filters, inStock: !filters.inStock })}
        >
          In stock
        </button>
        <button type="button" className="rail-more" onClick={onMore}>
          Price & sort
        </button>
      </div>
    </aside>
  );
}
