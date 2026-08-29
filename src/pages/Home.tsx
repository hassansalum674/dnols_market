import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings, fetchTrending } from "../api/client";
import { BrowseRail } from "../components/BrowseRail";
import { FilterSheet } from "../components/FilterSheet";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { SectionHead, Shelf } from "../components/Shelf";
import { StatusScreen } from "../components/EmptyState";
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
    <>
    <div className="page browse-page">
      <BrowseRail
        filters={filters}
        onChange={setFilters}
        onMore={() => setOpen(true)}
      />
      <div className="browse-results">
        {listings === null ? (
          <SkeletonGrid />
        ) : listings.length === 0 ? (
          <p className="muted">Nothing in this range. Widen the walk.</p>
        ) : isIdle ? (
          <>
            <Shelf
              title="Closest"
              hint="In stock, walk-up"
              listings={closest}
            />
            <Shelf title="Popular" listings={trending} />
            {recent.length > 0 && (
              <Shelf title="Recently viewed" listings={recent} />
            )}
            <section className="shelf">
              <SectionHead title="Products" />
              <ProductGrid listings={listings} />
            </section>
          </>
        ) : (
          <ProductGrid listings={listings} />
        )}
      </div>
    </div>
      <FilterSheet
        open={open}
        filters={draft}
        count={listings?.length ?? 0}
        onClose={() => setOpen(false)}
        onChange={setDraft}
        onApply={() => setFilters(draft)}
      />
    </>
  );
}
