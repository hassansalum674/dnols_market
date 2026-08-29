import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTrending } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import { paths } from "../lib/paths";
import { OfflinePage } from "./errors";
import type { PublicListing } from "../types";

export function NotFoundPage({ soldOut = false }: { soldOut?: boolean }) {
  const [row, setRow] = useState<PublicListing[]>([]);

  useEffect(() => {
    void fetchTrending().then(setRow);
  }, []);

  if (!navigator.onLine) return <OfflinePage />;

  return (
    <div className="page">
      <h1 className="product-title">
        {soldOut
          ? "This item sold out, but these are trending right now."
          : "This page is not on Dnols — here is what is trending."}
      </h1>
      <Link className="btn" to={paths.home} style={{ width: "auto", padding: "0 24px", margin: "12px 0 20px" }}>
        Start shopping
      </Link>
      <div className="row-scroll">
        {row.slice(0, 6).map((l) => (
          <ProductCard key={l.id} listing={l} className="row-card" />
        ))}
      </div>
    </div>
  );
}
