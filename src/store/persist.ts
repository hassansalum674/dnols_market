const ANON_KEY = "dnols.searchHistory.v1";

export type HistoryEntry = {
  q: string;
  photoUrl?: string;
  at: number;
};

function userKey(uid: string): string {
  return `dnols.searchHistory.${uid}`;
}

function read(key: string): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

function write(key: string, entries: HistoryEntry[]): void {
  localStorage.setItem(key, JSON.stringify(entries.slice(0, 8)));
}

export function getHistory(userId?: string | null): HistoryEntry[] {
  if (userId) return read(userKey(userId)).slice(0, 8);
  return read(ANON_KEY).slice(0, 8);
}

export function pushHistory(entry: HistoryEntry, userId?: string | null): void {
  const key = userId ? userKey(userId) : ANON_KEY;
  const next = [
    entry,
    ...read(key).filter((h) => h.q.toLowerCase() !== entry.q.toLowerCase()),
  ].slice(0, 8);
  write(key, next);
}

export function clearHistory(userId?: string | null): void {
  localStorage.removeItem(userId ? userKey(userId) : ANON_KEY);
}

/** Move anonymous searches onto the signed-in account (once per session). */
export function mergeAnonymousSearchHistory(userId: string): void {
  const anon = read(ANON_KEY);
  if (!anon.length) return;
  const user = read(userKey(userId));
  const merged = [...anon, ...user].filter(
    (entry, i, arr) =>
      arr.findIndex((x) => x.q.toLowerCase() === entry.q.toLowerCase()) === i,
  );
  write(userKey(userId), merged.slice(0, 8));
  localStorage.removeItem(ANON_KEY);
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

export function deleteLocalOrder(id: string): void {
  const cur = getLocalOrders<{ id: string }>();
  localStorage.setItem(
    ORDERS,
    JSON.stringify(cur.filter((o) => o.id !== id)),
  );
}
