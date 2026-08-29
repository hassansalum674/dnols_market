import { Link } from "react-router-dom";
import { formatDistance, formatTsh } from "../lib/format";
import { paths } from "../lib/paths";
import type { PublicListing } from "../types";
import { CATEGORIES, categoryTileImage } from "../data/categories";

/** Section header with an optional "See all" link. */
export function SectionHead({
  title,
  to,
  hint,
}: {
  title: string;
  to?: string;
  hint?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <h2 className="section-title">{title}</h2>
        {hint && <p className="section-hint">{hint}</p>}
      </div>
      {to && (
        <Link to={to} className="section-link">
          See all
        </Link>
      )}
    </div>
  );
}

/** Horizontal scroller of product cards (reuses .row-scroll / .row-card). */
export function Shelf({
  title,
  listings,
  to,
  hint,
}: {
  title: string;
  listings: PublicListing[];
  to?: string;
  hint?: string;
}) {
  if (!listings.length) return null;
  return (
    <section className="shelf">
      <SectionHead title={title} to={to} hint={hint} />
      <div className="row-scroll">
        {listings.map((l) => (
          <Link
            key={l.id}
            to={paths.product(l.id)}
            className="card row-card"
          >
            <img
              className="card-photo"
              src={l.photoUrl}
              alt={l.title}
              loading="lazy"
            />
            <div className="card-meta">
              <span className="price">{formatTsh(l.priceTzs)}</span>
              <span className="dist">{formatDistance(l.distanceMeters)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Alibaba-style "shop by category" tiles, scoped to the two real catalogs. */
export function CategoryCards({ listings }: { listings: PublicListing[] }) {
  return (
    <section className="shelf">
      <SectionHead title="Shop by category" to={paths.categories} />
      <div className="cat-cards">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={paths.category(c.id)} className="cat-card">
            <img
              className="cat-card-img"
              src={categoryTileImage(c, listings)}
              alt={c.label}
              loading="lazy"
            />
            <div className="cat-card-body">
              <span className="cat-card-title">{c.label}</span>
              <span className="cat-card-blurb">{c.blurb}</span>
            </div>
          </Link>
        ))}
        <Link to={paths.categories} className="cat-card cat-card-all">
          <div className="cat-card-body">
            <span className="cat-card-title">All categories</span>
            <span className="cat-card-blurb">Browse the market</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
