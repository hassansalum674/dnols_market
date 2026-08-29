import { formatDistance, formatTsh } from "../lib/format";
import type { PublicListing } from "../types";
import { Link } from "react-router-dom";

export function ProductCard({
  listing,
  className = "",
}: {
  listing: PublicListing;
  className?: string;
}) {
  return (
    <Link to={`/product/${listing.id}`} className={`card ${className}`}>
      <img
        className="card-photo"
        src={listing.photoUrl}
        alt={listing.title}
        loading="lazy"
      />
      <div className="card-meta">
        <span className="price">{formatTsh(listing.priceTzs)}</span>
        <span className="dist">{formatDistance(listing.distanceMeters)}</span>
      </div>
    </Link>
  );
}

export function ProductGrid({ listings }: { listings: PublicListing[] }) {
  return (
    <div className="grid">
      {listings.map((l) => (
        <ProductCard key={l.id} listing={l} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ n = 6 }: { n?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card">
          <div className="skel skel-photo" />
          <div className="skel skel-line" />
          <div className="skel skel-line short" />
        </div>
      ))}
    </div>
  );
}
