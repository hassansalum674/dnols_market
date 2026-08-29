import type { PublicListing } from "../types";

const KEY = "dnols.searchHistory.v1";

export type HistoryEntry = {
  q: string;
  photoUrl?: string;
  at: number;
};

function read(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

export function getHistory(): HistoryEntry[] {
  return read().slice(0, 8);
}

export function pushHistory(entry: HistoryEntry) {
  const next = [
    entry,
    ...read().filter((h) => h.q.toLowerCase() !== entry.q.toLowerCase()),
  ].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

const SAVED = "dnols.saved.v1";

export function getSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED) || "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleSaved(id: string): string[] {
  const cur = getSavedIds();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(SAVED, JSON.stringify(next));
  return next;
}

export function getPaidTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("dnols.paid.v1") || "{}") as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

export function markPaid(listingIds: string[], token: string) {
  const cur = getPaidTokens();
  listingIds.forEach((id) => {
    cur[id] = token;
  });
  localStorage.setItem("dnols.paid.v1", JSON.stringify(cur));
}

const RECENT = "dnols.recent.v1";

export function getRecentProducts(): PublicListing[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT) || "[]") as PublicListing[];
  } catch {
    return [];
  }
}

export function pushRecent(listing: PublicListing) {
  const slim: PublicListing = {
    id: listing.id,
    title: listing.title,
    priceTzs: listing.priceTzs,
    category: listing.category,
    photoUrl: listing.photoUrl,
    distanceMeters: listing.distanceMeters,
    inStock: listing.inStock,
  };
  const next = [
    slim,
    ...getRecentProducts().filter((p) => p.id !== listing.id),
  ].slice(0, 8);
  localStorage.setItem(RECENT, JSON.stringify(next));
}

const ORDERS = "dnols.orders.v1";

export function saveLocalOrder(order: unknown) {
  const cur = JSON.parse(localStorage.getItem(ORDERS) || "[]") as unknown[];
  cur.unshift(order);
  localStorage.setItem(ORDERS, JSON.stringify(cur.slice(0, 40)));
}

export function getLocalOrders<T>(): T[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS) || "[]") as T[];
  } catch {
    return [];
  }
}
