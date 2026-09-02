import { haversineMeters, isValidLatLng } from "./geo";

const KEY = "dnols.buyer.location.v1";
/** Ignore GPS jitter below this so listing distances do not flicker. */
const MOVE_THRESHOLD_M = 25;

export type BuyerLocation = {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  capturedAt: string;
};

export type BuyerGeoState = {
  location: BuyerLocation | null;
  denied: boolean;
};

const listeners = new Set<() => void>();

let state: BuyerGeoState = {
  location: readCached(),
  denied: false,
};
let watchId: number | null = null;
let started = false;
let pinging = false;

function readCached(): BuyerLocation | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuyerLocation;
    if (!isValidLatLng(parsed.lat, parsed.lng)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(loc: BuyerLocation): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(loc));
  } catch {
    /* ignore quota */
  }
}

function emit(next: BuyerGeoState): void {
  const prev = state;
  const sameLoc =
    prev.location?.lat === next.location?.lat &&
    prev.location?.lng === next.location?.lng &&
    prev.location?.capturedAt === next.location?.capturedAt;
  if (sameLoc && prev.denied === next.denied) return;
  state = next;
  listeners.forEach((l) => l());
}

export function loadBuyerLocation(): BuyerLocation | null {
  return state.location;
}

export function saveBuyerLocation(loc: BuyerLocation): BuyerLocation {
  save(loc);
  emit({ location: loc, denied: false });
  return loc;
}

export function getBuyerGeoSnapshot(): BuyerGeoState {
  return state;
}

export function subscribeBuyerLocation(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function fromPosition(pos: GeolocationPosition): BuyerLocation | null {
  const { latitude, longitude, accuracy } = pos.coords;
  if (!isValidLatLng(latitude, longitude)) return null;
  return {
    lat: latitude,
    lng: longitude,
    accuracyMeters: Number.isFinite(accuracy) ? Math.round(accuracy) : undefined,
    capturedAt: new Date().toISOString(),
  };
}

function applyFix(next: BuyerLocation): void {
  const prev = state.location;
  save(next);
  const moved =
    !prev ||
    haversineMeters(prev.lat, prev.lng, next.lat, next.lng) >= MOVE_THRESHOLD_M;
  if (!moved && prev) return;
  emit({ location: next, denied: false });
}

function geoOptions(fresh: boolean): PositionOptions {
  return {
    enableHighAccuracy: true,
    timeout: fresh ? 15000 : 20000,
    maximumAge: fresh ? 0 : 10_000,
  };
}

function ping(fresh = false): void {
  if (typeof navigator === "undefined" || !navigator.geolocation) return;
  if (pinging) return;
  pinging = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      pinging = false;
      const next = fromPosition(pos);
      if (next) applyFix(next);
    },
    (err) => {
      pinging = false;
      if (err.code === err.PERMISSION_DENIED) {
        emit({ location: state.location, denied: true });
      }
    },
    geoOptions(fresh),
  );
}

function startWatch(): void {
  if (typeof navigator === "undefined" || !navigator.geolocation) return;
  if (watchId != null) return;
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const next = fromPosition(pos);
      if (next) applyFix(next);
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        stopWatch();
        emit({ location: state.location, denied: true });
      }
    },
    geoOptions(false),
  );
}

function stopWatch(): void {
  if (watchId == null || typeof navigator === "undefined" || !navigator.geolocation) {
    return;
  }
  navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

function onAppEntered(): void {
  ping(true);
  startWatch();
}

function onVisibility(): void {
  if (document.visibilityState === "visible") {
    onAppEntered();
  } else {
    stopWatch();
  }
}

/** Start as soon as the buyer app boots. Safe to call more than once. */
export function startBuyerLocationTracking(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  if (!state.location) {
    const cached = readCached();
    if (cached) state = { ...state, location: cached };
  }
  onAppEntered();
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onAppEntered);
  window.addEventListener("focus", onAppEntered);
}

export function requestBuyerLocation(): Promise<BuyerLocation | null> {
  startBuyerLocationTracking();
  const cached = state.location;
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(cached);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = fromPosition(pos);
        if (next) applyFix(next);
        resolve(next ?? cached);
      },
      () => resolve(cached),
      geoOptions(true),
    );
  });
}

/** Meters between the shop pin and the buyer's last known location. */
export function distanceToBuyer(
  shopLat: number,
  shopLng: number,
): number | null {
  const here = state.location;
  if (!here) return null;
  return haversineMeters(here.lat, here.lng, shopLat, shopLng);
}
