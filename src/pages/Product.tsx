import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchListingDetail } from "../api/client";
import { ReservePayButton } from "../components/ReservePayButton";
import { AddToCartButton } from "../components/AddToCartButton";
import { RoutePulse } from "../components/Splash";
import { formatDistance, formatTsh } from "../lib/format";
import { photoUrl } from "../lib/images";
import { getPaidTokens, toggleSaved, getSavedIds } from "../store/persist";
import { useI18n } from "../store/i18n";
import type { PublicListingDetail } from "../types";
import { ServerErrorPage } from "./errors";
import { NotFoundPage } from "./NotFound";

export function ProductPage() {
  const { id = "" } = useParams();
  const { t } = useI18n();
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
    <div className="product-page">
      <div className="product-layout">
        <div className="product-gallery">
          <img
            className="product-hero"
            src={photoUrl(detail.photoUrl, "detail")}
            alt={detail.title}
            width={640}
            height={640}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="product-info">
          <h1 className="product-title">{detail.title}</h1>
          <div className="product-row">
            <span className="price">{formatTsh(detail.priceTzs)}</span>
            <span className="muted">{formatDistance(detail.distanceMeters)}</span>
          </div>
          {detail.brand && <p className="muted">{detail.brand}</p>}
          <p className="product-desc">{detail.description}</p>
          {detail.sizes && (
            <p className="muted">Sizes · {detail.sizes.join(" · ")}</p>
          )}
          {detail.paid && detail.directions ? (
            <div className="you-block">
              <h2>{t.pickup}</h2>
              <p>{detail.directions.shopName}</p>
              <p>{detail.directions.streetAddress}</p>
              <p className="hint">{detail.directions.mapsHint}</p>
            </div>
          ) : (
            <p className="hint">{t.payThenDelivery}</p>
          )}
          <button
            type="button"
            className="chip on"
            onClick={() => setSaved(toggleSaved(id).includes(id))}
          >
            {saved ? t.saved : t.saveForLater}
          </button>
          <p className="hint">
            <Link to="/">{t.backToProducts}</Link>
          </p>
        </div>
      </div>

      <div className="product-actions" aria-label={t.purchaseOptions}>
        <ReservePayButton listing={detail} label={t.reservePay} />
        <AddToCartButton listing={detail} label={t.addToCart} fly={false} />
      </div>
    </div>
  );
}
