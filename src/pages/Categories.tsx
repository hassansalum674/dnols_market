import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings } from "../api/client";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { CATEGORIES, groupCollections } from "../data/categories";
import type { PublicListing } from "../types";

export function CategoriesPage() {
  const [listings, setListings] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    void fetchListings({ sort: "nearest" }).then(({ listings: rows }) =>
      setListings(rows),
    );
  }, []);

  if (!listings) {
    return (
      <div className="page">
        <h1 className="section-title">Categories</h1>
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="section-title">Shop Kariakoo</h1>
      <p className="section-hint">Fashion and electronics in one market.</p>
      {CATEGORIES.map((cat) => {
        const groups = groupCollections(cat, listings);
        return (
          <section key={cat.id} className="cat-block">
            <h2 className="cat-heading">{cat.label}</h2>
            <p className="section-hint">{cat.blurb}</p>
            {groups.map(({ collection, items }) => (
              <div key={collection.key}>
                <div className="section-head">
                  <h3 className="section-title">{collection.label}</h3>
                  <Link className="section-link" to={`/?cat=${cat.id}`}>
                    See all
                  </Link>
                </div>
                <ProductGrid listings={items.slice(0, 4)} />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
