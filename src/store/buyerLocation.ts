import { useSyncExternalStore } from "react";
import {
  getBuyerGeoSnapshot,
  subscribeBuyerLocation,
  type BuyerGeoState,
  type BuyerLocation,
} from "../lib/buyerLocation";

export function useBuyerLocation(): BuyerGeoState {
  return useSyncExternalStore(
    subscribeBuyerLocation,
    getBuyerGeoSnapshot,
    getBuyerGeoSnapshot,
  );
}

export type { BuyerLocation, BuyerGeoState };
