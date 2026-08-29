import type { LocalSku, PayoutMock, SavedOrder, ShopHours } from "./types";

const ORDERS = "dnols.shop.orders";
const SKUS = "dnols.shop.skus";
const HOURS = "dnols.shop.hours";
const PAYOUTS = "dnols.shop.payouts";
const SPLASH = "dnols.shop.splash";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function splashSeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH) === "1";
  } catch {
    return false;
  }
}

export function markSplashSeen(): void {
  try {
    sessionStorage.setItem(SPLASH, "1");
  } catch {
    /* ignore */
  }
}

export function loadSavedOrders(): SavedOrder[] {
  return read<SavedOrder[]>(ORDERS, []);
}

export function upsertSavedOrder(row: SavedOrder): SavedOrder[] {
  const next = [row, ...loadSavedOrders().filter((o) => o.orderId !== row.orderId)];
  write(ORDERS, next);
  return next;
}

export function loadSkus(): LocalSku[] {
  return read<LocalSku[]>(SKUS, []);
}

export function saveSkus(rows: LocalSku[]): void {
  write(SKUS, rows);
}

export function loadHours(): ShopHours {
  return read<ShopHours>(HOURS, {
    open: "08:00",
    close: "19:00",
    days: "Mon–Sat",
  });
}

export function saveHours(h: ShopHours): void {
  write(HOURS, h);
}

export function loadPayouts(): PayoutMock[] {
  return read<PayoutMock[]>(PAYOUTS, []);
}

export function addPayout(row: PayoutMock): PayoutMock[] {
  const next = [row, ...loadPayouts()];
  write(PAYOUTS, next);
  return next;
}
