import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchListingDetail } from "../api/client";
import { AddToCartButton } from "../components/AddToCartButton";
import { RoutePulse } from "../components/Splash";
import { formatDistance, formatTsh } from "../lib/format";
import { paths } from "../lib/paths";
import { getPaidTokens, toggleSaved, getSavedIds } from "../store/persist";
import type { PublicListingDetail } from "../types";
import { ServerErrorPage } from "./errors";
import { NotFoundPage } from "./NotFound";

export function ProductPage() {
  const { id = "" } = useParams();
  const [detail, setDetail] = useState<PublicListingDetail | null | undefined>(
    undefined,
  );
  const [fail, setFail] = useState<number | null>(null);
  const [saved, setSaved] = useState(() => getSavedIds().includes(id));

  useEffect(() => {
    const token = getPaidTokens()[id];
    void fetchListingDetail(id, token).then(({ detail: d, status }) => {
      setFail(status ?? null);
      setDetail(d);
    });
  }, [id]);

  if (detail === undefined) return <RoutePulse />;
  if (detail === null && fail === 500) return <ServerErrorPage />;
  if (detail === null) return <NotFoundPage soldOut />;

  return (
    <div>
      <img className="hero" src={detail.photoUrl} alt={detail.title} />
      <div className="product-body">
        <h1 className="product-title">{detail.title}</h1>
        <div className="product-row">
          <span className="price">{formatTsh(detail.priceTzs)}</span>
          <span className="muted">{formatDistance(detail.distanceMeters)}</span>
        </div>
        {detail.brand && <p className="muted">{detail.brand}</p>}
        <p>{detail.description}</p>
        {detail.sizes && (
          <p className="muted">Sizes · {detail.sizes.join(" · ")}</p>
        )}
        {detail.paid && detail.directions ? (
          <div className="you-block">
            <h2>Pickup</h2>
            <p>{detail.directions.shopName}</p>
            <p>{detail.directions.streetAddress}</p>
            <p className="hint">{detail.directions.mapsHint}</p>
          </div>
        ) : (
          <p className="hint">Pay, then we show the way. Address stays hidden until then.</p>
        )}
        <button
          type="button"
          className="chip on"
          onClick={() => setSaved(toggleSaved(id).includes(id))}
        >
          {saved ? "Saved" : "Save for later"}
        </button>
        <p className="hint">
          <Link to={paths.home}>Back to nearby</Link>
        </p>
      </div>
      <div className="sticky-pay">
        <AddToCartButton listing={detail} label="Pay / Reserve" />
      </div>
    </div>
  );
}
