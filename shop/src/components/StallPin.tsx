import { useState } from "react";
import { isNearKariakoo } from "../lib/geo";
import type { OnboardingDraft } from "../types";

type LocationFields = Pick<
  OnboardingDraft["step2"],
  "lat" | "lng" | "accuracyMeters" | "capturedAt" | "locationSource"
>;

type Props = {
  location: LocationFields;
  capturing: boolean;
  error: string | null;
  onCapture: () => void;
  onFallback?: () => void;
  showFallback?: boolean;
};

export function StallMapPreview({
  lat,
  lng,
  shopName,
}: {
  lat: number;
  lng: number;
  shopName?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const mapImg = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=640x200&markers=${lat},${lng},red`;

  return (
    <div className="stall-pin-map">
      {!imgFailed ? (
        <img
          className="stall-pin-map-img"
          src={mapImg}
          alt={shopName ? `${shopName} stall pin` : "Stall location pin"}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="stall-pin-fallback" aria-hidden>
          <span className="stall-pin-dot" />
        </div>
      )}
    </div>
  );
}

export function StallPin({
  location,
  capturing,
  error,
  onCapture,
  onFallback,
  showFallback,
}: Props) {
  const pinned = location.lat != null && location.lng != null;
  const far =
    pinned &&
    location.lat != null &&
    location.lng != null &&
    !isNearKariakoo(location.lat, location.lng);

  return (
    <div className="stall-pin">
      {pinned && location.lat != null && location.lng != null && (
        <>
          <StallMapPreview lat={location.lat} lng={location.lng} />
          <p className="stall-pin-meta">
            {location.locationSource === "kariakoo_fallback"
              ? "Kariakoo market pin"
              : "GPS pin"}
            {location.accuracyMeters != null
              ? ` · ±${location.accuracyMeters}m`
              : ""}
          </p>
          <p className="hint stall-pin-coords">
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
          {far && (
            <p className="hint stall-pin-warn">
              This pin is outside Kariakoo. Recapture at your stall so nearby
              buyers can find the product.
            </p>
          )}
          {location.locationSource === "kariakoo_fallback" && (
            <p className="hint stall-pin-warn">
              Market-center pin — recapture at the stall for a precise location.
            </p>
          )}
        </>
      )}

      <button
        type="button"
        className={pinned ? "btn ghost" : "btn"}
        onClick={onCapture}
        disabled={capturing}
      >
        {capturing
          ? "Reading location…"
          : pinned
            ? "Recapture stall location"
            : "Pin stall location"}
      </button>

      {error && <p className="err">{error}</p>}
      {showFallback && onFallback && (
        <button type="button" className="btn ghost" onClick={onFallback}>
          Use Kariakoo market pin
        </button>
      )}
    </div>
  );
}
