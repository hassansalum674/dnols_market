import { formatDistance, formatTsh } from "../lib/format";
import { photoUrl } from "../lib/images";
import type { PublicListing } from "../types";
import { Link } from "react-router-dom";

export function ProductCard({
  listing,
  className = "",
  priority = false,
}: {
  listing: PublicListing;
  className?: string;
  priority?: boolean;
}) {
  const src = photoUrl(listing.photoUrl, "card");
  return (
    <Link to={`/product/${listing.id}`} className={`card ${className}`}>
      <img
        className="card-photo"
        src={src}
        alt={listing.title}
        width={400}
        height={400}
        sizes="(max-width: 600px) 50vw, 220px"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
      <p className="card-title">{listing.title}</p>
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
      {listings.map((l, i) => (
        <ProductCard key={l.id} listing={l} priority={i === 0} />
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
