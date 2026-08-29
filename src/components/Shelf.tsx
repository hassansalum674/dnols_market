import { Link } from "react-router-dom";
import { CATEGORIES, categoryTileImage } from "../data/categories";
import type { PublicListing } from "../types";
import { ProductCard } from "./ProductCard";

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
          <ProductCard key={l.id} listing={l} className="row-card" />
        ))}
      </div>
    </section>
  );
}

export function CategoryCards({ listings }: { listings: PublicListing[] }) {
  return (
    <section className="shelf">
      <SectionHead title="Shop by category" to="/categories" />
      <div className="cat-cards">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`/?cat=${c.id}`} className="cat-card">
            <img
              className="cat-card-img"
              src={categoryTileImage(c, listings)}
              alt=""
              loading="lazy"
            />
            <div className="cat-card-body">
              <span className="cat-card-title">{c.label}</span>
              <span className="cat-card-blurb">{c.blurb}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
