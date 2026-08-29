import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SavedOrder } from "./types";
import { loadSavedOrders, upsertSavedOrder } from "./storage";

type Ctx = {
  saved: SavedOrder[];
  remember: (row: SavedOrder) => void;
  refresh: () => void;
};

const ShopData = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedOrder[]>(() => loadSavedOrders());

  const remember = useCallback((row: SavedOrder) => {
    setSaved(upsertSavedOrder(row));
  }, []);

  const refresh = useCallback(() => {
    setSaved(loadSavedOrders());
  }, []);

  const value = useMemo(
    () => ({ saved, remember, refresh }),
    [saved, remember, refresh],
  );

  return <ShopData.Provider value={value}>{children}</ShopData.Provider>;
}

export function useShopData() {
  const ctx = useContext(ShopData);
  if (!ctx) throw new Error("useShopData");
  return ctx;
}
