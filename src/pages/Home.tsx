import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings, fetchTrending } from "../api/client";
import { FilterSheet } from "../components/FilterSheet";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { CategoryCards, SectionHead, Shelf } from "../components/Shelf";
import { StatusScreen } from "../components/EmptyState";
import { PLACE_LABEL } from "../lib/format";
import { getRecentProducts } from "../store/persist";
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
  const [err, setErr] = useState<"offline" | "500" | null>(null);
  const [trending, setTrending] = useState<PublicListing[]>([]);
  const [recent, setRecent] = useState<PublicListing[]>([]);

  const isIdle =
    !filters.category &&
    !filters.maxDistance &&
    !filters.inStock &&
    (filters.minPrice === "" || filters.minPrice == null) &&
    (filters.maxPrice === "" || filters.maxPrice == null);

  useEffect(() => setDraft(filters), [filters]);

  useEffect(() => {
    void fetchTrending().then(setTrending);
    setRecent(getRecentProducts());
  }, []);

  useEffect(() => {
    let live = true;
    setListings(null);
    setErr(null);
    if (!navigator.onLine) setErr("offline");
    void fetchListings(filters).then(({ listings: rows }) => {
      if (!live) return;
      setListings(rows);
    });
    return () => {
      live = false;
    };
  }, [filters]);

  const setFilters = (next: ListingFilters) => {
    setSp(toParams(next, sp), { replace: true });
  };

  const closest = useMemo(() => {
    if (!listings) return [];
    return [...listings]
      .filter((l) => l.inStock)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 8);
  }, [listings]);

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
      <p className="trust-strip">
        Pay now. Money is held. We then show the stall. You may refuse at the
        counter if it is not as listed.
      </p>
      <p className="place-line">Near {PLACE_LABEL()}</p>
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
        </button>
      </div>

      {listings === null ? (
        <SkeletonGrid />
      ) : listings.length === 0 ? (
        <p className="muted">Nothing in this range. Widen the walk.</p>
      ) : isIdle ? (
        <>
          <CategoryCards listings={listings} />
          <Shelf
            title="Closest to you"
            hint="In stock, walk-up"
            listings={closest}
          />
          <Shelf title="Popular in Kariakoo" listings={trending} />
          {recent.length > 0 && (
            <Shelf title="Recently viewed" listings={recent} />
          )}
          <section className="shelf">
            <SectionHead title="All nearby" />
            <ProductGrid listings={listings} />
          </section>
        </>
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
