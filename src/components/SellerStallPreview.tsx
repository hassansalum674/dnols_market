import { useState } from "react";
import type { DirectionsPayload } from "../types";

type Props = {
  location: DirectionsPayload;
  className?: string;
};

/**
 * Read-only preview of where the seller's stall is registered.
 * No external map apps — Dnols coordinates delivery separately.
 */
export function SellerStallPreview({ location, className = "" }: Props) {
  const { lat, lng, shopName } = location;
  const [imgFailed, setImgFailed] = useState(false);
  const mapImg = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=640x200&markers=${lat},${lng},red`;

  return (
    <div className={`seller-stall-preview ${className}`.trim()}>
      {!imgFailed ? (
        <img
          className="seller-stall-map-img"
          src={mapImg}
          alt={`${shopName} stall in Kariakoo`}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="seller-stall-fallback" aria-hidden>
          <span className="seller-stall-pin-dot" />
        </div>
      )}
    </div>
  );
}
