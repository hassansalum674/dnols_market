import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings } from "../api/client";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import type { PublicListing } from "../types";

export function SearchPage() {
  const [sp] = useSearchParams();
  const q = sp.get("q") || "";
  const [listings, setListings] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    let live = true;
    setListings(null);
    void fetchListings({ q, sort: "nearest" }).then(({ listings: rows }) => {
      if (live) setListings(rows);
    });
    return () => {
      live = false;
    };
  }, [q]);

  return (
    <div className="page">
      <p className="place-line">{q ? `Results for “${q}”` : "Search"}</p>
      {listings === null ? (
        <SkeletonGrid />
      ) : listings.length === 0 ? (
        <p className="muted">No matches. Try a shorter word.</p>
      ) : (
        <ProductGrid listings={listings} />
      )}
    </div>
  );
}
