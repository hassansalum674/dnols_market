import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListingDetail } from "../api/client";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { getSavedIds } from "../store/persist";
import type { PublicListing } from "../types";

export function SavedPage() {
  const [saved, setSaved] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    const ids = getSavedIds();
    if (!ids.length) {
      setSaved([]);
      return;
    }
    void Promise.all(ids.map((id) => fetchListingDetail(id))).then((rows) => {
      setSaved(
        rows
          .map((r) => r.detail)
          .filter((d): d is NonNullable<typeof d> => Boolean(d)),
      );
    });
  }, []);

  return (
    <div className="page account-page">
      <div className="account-top">
        <Link to="/you" className="back-link">
          ← My Account
        </Link>
        <h1 className="account-title">Saved items</h1>
      </div>
      <p className="section-desc account-saved-desc">
        Items you saved for later. Tap a product to view details or checkout.
      </p>
      {saved === null ? (
        <SkeletonGrid n={4} />
      ) : saved.length === 0 ? (
        <div className="center-state account-empty">
          <p>Nothing saved yet.</p>
          <Link className="btn" to="/">
            Browse products
          </Link>
        </div>
      ) : (
        <ProductGrid listings={saved} />
      )}
    </div>
  );
}
