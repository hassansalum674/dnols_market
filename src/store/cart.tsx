import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { PublicListing } from "../types";

const KEY = "dnols.cart.v1";

export type CartItem = { listing: PublicListing; qty: number };

type CartState = { items: CartItem[] };

function read(): CartState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    return JSON.parse(raw) as CartState;
  } catch {
    return { items: [] };
  }
}

let state = read();
const listeners = new Set<() => void>();

function emit() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function addItem(listing: PublicListing, qty = 1) {
  const i = state.items.findIndex((x) => x.listing.id === listing.id);
  const items = [...state.items];
  if (i >= 0) items[i] = { listing, qty: items[i].qty + qty };
  else items.push({ listing, qty });
  state = { items };
  emit();
}

export function setQty(id: string, qty: number) {
  if (qty <= 0) {
    state = { items: state.items.filter((x) => x.listing.id !== id) };
  } else {
    state = {
      items: state.items.map((x) =>
        x.listing.id === id ? { ...x, qty } : x,
      ),
    };
  }
  emit();
}

export function removeItem(id: string) {
  state = { items: state.items.filter((x) => x.listing.id !== id) };
  emit();
}

export function clearCart() {
  state = { items: [] };
  emit();
}

export function replaceCart(listing: PublicListing, qty = 1) {
  state = { items: [{ listing, qty }] };
  emit();
}

function useCartState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const CartCtx = createContext<{
  items: CartItem[];
  count: number;
  totalTzs: number;
  add: typeof addItem;
  setQty: typeof setQty;
  remove: typeof removeItem;
  clear: typeof clearCart;
  replaceWith: typeof replaceCart;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const s = useCartState();
  const count = s.items.reduce((n, x) => n + x.qty, 0);
  const totalTzs = s.items.reduce((n, x) => n + x.listing.priceTzs * x.qty, 0);
  const add = useCallback(addItem, []);
  const value = useMemo(
    () => ({
      items: s.items,
      count,
      totalTzs,
      add,
      setQty,
      remove: removeItem,
      clear: clearCart,
      replaceWith: replaceCart,
    }),
    [s.items, count, totalTzs, add],
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("CartProvider missing");
  return ctx;
}
