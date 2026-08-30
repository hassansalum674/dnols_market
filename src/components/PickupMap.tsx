import type { DirectionsPayload } from "../types";

type Props = {
  location: DirectionsPayload;
  className?: string;
};

/** Map preview using shop coordinates registered by the seller. */
export function PickupMap({ location, className = "" }: Props) {
  const { lat, lng, shopName } = location;
  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
  const embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  return (
    <a
      className={`pickup-map ${className}`.trim()}
      href={mapsLink}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${shopName} in Google Maps`}
    >
      <iframe
        title={`Map: ${shopName}`}
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </a>
  );
}
