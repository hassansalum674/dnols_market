import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistance, formatTsh } from "../lib/format";
import type { PublicListing } from "../types";

function Photo({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div className="card-photo card-photo-fallback" aria-hidden>
        {title}
      </div>
    );
  }
  return (
    <img
      className="card-photo"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

export function ProductCard({
  listing,
  className = "",
}: {
  listing: PublicListing;
  className?: string;
}) {
  return (
    <Link to={`/product/${listing.id}`} className={`card ${className}`}>
      <Photo src={listing.photoUrl} alt={listing.title} title={listing.title} />
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
