import { useEffect, useState } from "react";
import { fetchListings } from "../api/client";
import { Shelf } from "../components/Shelf";
import { SkeletonGrid } from "../components/ProductCard";
import { CATEGORIES, groupCollections } from "../data/categories";
import { PLACE_LABEL } from "../lib/format";
import { paths } from "../lib/paths";
import type { PublicListing } from "../types";

export function CategoriesPage() {
  const [listings, setListings] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    let live = true;
    void fetchListings({ sort: "nearest" }).then(({ listings: rows }) => {
      if (live) setListings(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="page">
      <p className="place-line">Browse {PLACE_LABEL()}</p>
      <p className="hint">Distance now · exact stall after you pay.</p>

      {listings === null ? (
        <SkeletonGrid />
      ) : (
        CATEGORIES.map((cat) => {
          const groups = groupCollections(cat, listings);
          const count = groups.reduce((n, g) => n + g.items.length, 0);
          if (count === 0) return null;
          return (
            <div key={cat.id} className="cat-block">
              <h1 className="cat-heading">{cat.label}</h1>
              {groups.map((g) => (
                <Shelf
                  key={g.collection.key}
                  title={g.collection.label}
                  listings={g.items}
                  to={paths.category(cat.id)}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
