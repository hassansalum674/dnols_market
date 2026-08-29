import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings } from "../api/client";
import { FilterSheet } from "../components/FilterSheet";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { StatusScreen } from "../components/EmptyState";
import { PLACE_LABEL } from "../lib/format";
import type { Category, ListingFilters, PublicListing, Sort } from "../types";

function fromParams(sp: URLSearchParams): ListingFilters {
  const cat = sp.get("cat") || "";
  const max = sp.get("max") || "";
  const sort = (sp.get("sort") as Sort) || "nearest";
  const inStock = sp.get("stock") === "1";
  const minPrice = sp.get("min") || "";
  const maxPrice = sp.get("maxp") || "";
  return {
    category: (cat as Category) || "",
    maxDistance: max ? Number(max) : "",
    sort,
    inStock,
    minPrice: minPrice ? Number(minPrice) : "",
    maxPrice: maxPrice ? Number(maxPrice) : "",
  };
}

function toParams(f: ListingFilters, sp: URLSearchParams) {
  const next = new URLSearchParams(sp);
  if (f.category) next.set("cat", f.category);
  else next.delete("cat");
  if (f.maxDistance) next.set("max", String(f.maxDistance));
  else next.delete("max");
  if (f.sort && f.sort !== "nearest") next.set("sort", f.sort);
  else next.delete("sort");
  if (f.inStock) next.set("stock", "1");
  else next.delete("stock");
  if (f.minPrice !== "" && f.minPrice != null) next.set("min", String(f.minPrice));
  else next.delete("min");
  if (f.maxPrice !== "" && f.maxPrice != null) next.set("maxp", String(f.maxPrice));
  else next.delete("maxp");
  return next;
}

export function HomePage() {
  const [sp, setSp] = useSearchParams();
  const filters = useMemo(() => fromParams(sp), [sp]);
  const [draft, setDraft] = useState(filters);
  const [open, setOpen] = useState(false);
  const [listings, setListings] = useState<PublicListing[] | null>(null);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [err, setErr] = useState<"offline" | "500" | null>(null);

  useEffect(() => setDraft(filters), [filters]);

  useEffect(() => {
    let live = true;
    setListings(null);
    setErr(null);
    if (!navigator.onLine) {
      setErr("offline");
    }
    void fetchListings(filters).then(({ listings: rows, source: src }) => {
      if (!live) return;
      setListings(rows);
      setSource(src);
    });
    return () => {
      live = false;
    };
  }, [filters]);

  const setFilters = (next: ListingFilters) => {
    setSp(toParams(next, sp), { replace: true });
  };

  const chips: { key: string; label: string; on: boolean; clear: () => void }[] =
    [];
  if (filters.category)
    chips.push({
      key: "cat",
      label: filters.category === "fashion" ? "Fashion" : "Electronics",
      on: true,
      clear: () => setFilters({ ...filters, category: "" }),
    });
  if (filters.maxDistance)
    chips.push({
      key: "max",
      label:
        Number(filters.maxDistance) >= 1000
          ? "1km"
          : `${filters.maxDistance}m`,
      on: true,
      clear: () => setFilters({ ...filters, maxDistance: "" }),
    });
  if (filters.inStock)
    chips.push({
      key: "stock",
      label: "In stock",
      on: true,
      clear: () => setFilters({ ...filters, inStock: false }),
    });
  if (filters.minPrice !== "" && filters.minPrice != null)
    chips.push({
      key: "min",
      label: `From TSh ${filters.minPrice}`,
      on: true,
      clear: () => setFilters({ ...filters, minPrice: "" }),
    });

  if (err === "offline") {
    return (
      <StatusScreen
        line="You're offline. We'll show nearby shops when you're back."
        action="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="page">
      <p className="place-line">
        Near {PLACE_LABEL()}
        {sp.get("place") ? ` · ${sp.get("place")}` : ""}
      </p>
      <div className="filters-bar">
        <div className="chips">
          {(["fashion", "electronics"] as const).map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${filters.category === c ? "on" : ""}`}
              onClick={() =>
                setFilters({
                  ...filters,
                  category: filters.category === c ? "" : c,
                })
              }
            >
              {c === "fashion" ? "Fashion" : "Electronics"}
            </button>
          ))}
          {[200, 500, 1000].map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${filters.maxDistance === m ? "on" : ""}`}
              onClick={() =>
                setFilters({
                  ...filters,
                  maxDistance: filters.maxDistance === m ? "" : m,
                })
              }
            >
              {m === 1000 ? "1km" : `${m}m`}
            </button>
          ))}
          <button
            type="button"
            className={`chip ${filters.inStock ? "on" : ""}`}
            onClick={() => setFilters({ ...filters, inStock: !filters.inStock })}
          >
            In stock
          </button>
        </div>
        <button type="button" className="chip on" onClick={() => setOpen(true)}>
          Filters
          {chips.length > 0 ? ` (${chips.length})` : ""}
        </button>
      </div>
      {chips.length > 0 && (
        <div className="chips">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              className="chip on removable"
              onClick={c.clear}
            >
              {c.label} ×
            </button>
          ))}
        </div>
      )}
      {source === "mock" && listings && (
        <p className="hint">Showing nearby mock listings — API at :8787 is optional.</p>
      )}
      {listings === null ? (
        <SkeletonGrid />
      ) : listings.length === 0 ? (
        <div className="center-state">
          <p>Nothing in this range. Clear filters or walk a little further.</p>
          <button
            type="button"
            className="btn"
            onClick={() =>
              setFilters({
                category: "",
                maxDistance: "",
                sort: "nearest",
                inStock: false,
                minPrice: "",
                maxPrice: "",
              })
            }
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ProductGrid listings={listings} />
      )}
      <FilterSheet
        open={open}
        filters={draft}
        count={listings?.length ?? 0}
        onClose={() => setOpen(false)}
        onChange={setDraft}
        onApply={() => setFilters(draft)}
      />
    </div>
  );
}
