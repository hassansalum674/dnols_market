import type { DirectionsPayload } from "../types";

type Props = {
  location: DirectionsPayload;
  className?: string;
};

/** Embedded map using shop coordinates from the seller's registered stall. */
export function PickupMap({ location, className = "" }: Props) {
  const { lat, lng, shopName } = location;
  const pad = 0.004;
  const bbox = `${lng - pad},${lat - pad},${lng + pad},${lat + pad}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <a
      className={`pickup-map ${className}`.trim()}
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${shopName} in Google Maps`}
    >
      <iframe
        title={`Map: ${shopName}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </a>
  );
}
