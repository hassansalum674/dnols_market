import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending } from "../api";
import { ShimmerList } from "../Splash";
import type { PublicListing } from "../types";
import { formatTzs } from "../format";
import { paths } from "../../lib/paths";

export function ShopNotFoundPage() {
  const [row, setRow] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    void getTrending()
      .then((r) => setRow(r.items))
      .catch(() => setRow([]));
  }, []);

  return (
    <div className="page">
      <h1 className="header-title" style={{ fontSize: 22, margin: "8px 0 12px" }}>
        Page missing.
      </h1>
      <p className="muted">Still in the stall app. Trending SKUs from GET /trending.</p>
      <Link
        className="btn"
        to={paths.shop}
        style={{ width: "auto", padding: "0 24px", margin: "16px 0" }}
      >
        Back to Today
      </Link>
      {row === null ? (
        <ShimmerList rows={2} />
      ) : row.length === 0 ? (
        <p className="hint">Nothing trending — is the API up?</p>
      ) : (
        <div className="row-scroll">
          {row.slice(0, 6).map((l) => (
            <div key={l.id} className="mini-card">
              <img src={l.photoUrl} alt="" />
              <p>{l.title}</p>
              <p className="price muted">{formatTzs(l.priceTzs)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
