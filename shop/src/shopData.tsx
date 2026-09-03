import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SavedOrder } from "./types";
import { loadSavedOrders, removeSavedOrder, upsertSavedOrder } from "./storage";

type Ctx = {
  saved: SavedOrder[];
  remember: (row: SavedOrder) => void;
  forget: (orderId: string) => void;
  refresh: () => void;
};

const ShopData = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedOrder[]>(() => loadSavedOrders());

  const remember = useCallback((row: SavedOrder) => {
    setSaved(upsertSavedOrder(row));
  }, []);

  const forget = useCallback((orderId: string) => {
    setSaved(removeSavedOrder(orderId));
  }, []);

  const refresh = useCallback(() => {
    setSaved(loadSavedOrders());
  }, []);

  const value = useMemo(
    () => ({ saved, remember, forget, refresh }),
    [saved, remember, forget, refresh],
  );

  return <ShopData.Provider value={value}>{children}</ShopData.Provider>;
}

export function useShopData() {
  const ctx = useContext(ShopData);
  if (!ctx) throw new Error("useShopData");
  return ctx;
}
