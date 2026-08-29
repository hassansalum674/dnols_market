import {
  filterListings,
  mockByIds,
  mockDetail,
  mockSuggest,
  mockTrending,
} from "../data/mocks";
import type {
  ListingFilters,
  Order,
  PublicListing,
  PublicListingDetail,
} from "../types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) || "/api";
const PLACE_ID = "place_kariakoo_dsm";

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = new Error(`http_${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

function qs(filters: ListingFilters): string {
  const p = new URLSearchParams();
  p.set("placeId", PLACE_ID);
  if (filters.category) p.set("category", filters.category);
  if (filters.maxDistance) p.set("maxDistanceMeters", String(filters.maxDistance));
  if (filters.sort) p.set("sort", filters.sort);
  if (filters.inStock) p.set("inStock", "true");
  if (filters.minPrice !== "" && filters.minPrice != null)
    p.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== "" && filters.maxPrice != null)
    p.set("maxPrice", String(filters.maxPrice));
  if (filters.q) p.set("q", filters.q);
  const s = p.toString();
  return s ? `?${s}` : "";
}

function asList(data: unknown): PublicListing[] {
  if (Array.isArray(data)) return data as PublicListing[];
  if (data && typeof data === "object" && Array.isArray((data as { listings?: unknown }).listings)) {
    return (data as { listings: PublicListing[] }).listings;
  }
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: PublicListing[] }).items;
  }
  return [];
}

export type DataSource = "api" | "mock";

export async function fetchListings(
  filters: ListingFilters,
  signal?: AbortSignal,
): Promise<{ listings: PublicListing[]; source: DataSource }> {
  try {
    const data = await getJson<unknown>(`/listings${qs(filters)}`, signal);
    const listings = asList(data);
    if (!listings.length && !filters.q && !filters.category && !filters.maxDistance) {
      throw new Error("empty_api");
    }
    return { listings, source: "api" };
  } catch {
    return { listings: filterListings(filters), source: "mock" };
  }
}

export async function fetchListingDetail(
  id: string,
  paidToken?: string | null,
): Promise<{ detail: PublicListingDetail | null; source: DataSource; status?: number }> {
  try {
    const q = paidToken
      ? `?paid=1&token=${encodeURIComponent(paidToken)}`
      : "";
    const data = await getJson<
      PublicListingDetail & { paid?: boolean; locationUnlocked?: boolean }
    >(`/listings/${encodeURIComponent(id)}${q}`);
    const paid = Boolean(data.paid || data.directions || data.locationUnlocked);
    return {
      detail: { ...data, paid },
      source: "api",
    };
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 404) return { detail: null, source: "api", status: 404 };
    if (status === 500) return { detail: null, source: "api", status: 500 };
    const paid = Boolean(paidToken);
    const detail = mockDetail(id, paid);
    if (!detail) return { detail: null, source: "mock", status: status ?? 404 };
    return { detail, source: "mock", status };
  }
}

export async function fetchSuggest(q: string): Promise<PublicListing[]> {
  try {
    const data = await getJson<unknown>(
      `/listings?placeId=${PLACE_ID}&q=${encodeURIComponent(q)}`,
    );
    return asList(data).slice(0, 6);
  } catch {
    return mockSuggest(q);
  }
}

export async function fetchTrending(): Promise<PublicListing[]> {
  try {
    const data = await getJson<unknown>("/trending");
    return asList(data).slice(0, 6);
  } catch {
    return mockTrending();
  }
}

function mapPay(raw: Record<string, unknown>, listingIds: string[]): Order {
  const shops = raw.shops as Order["directions"];
  return {
    id: String(raw.orderId ?? raw.id ?? `ord_${Date.now()}`),
    listingIds: (raw.listingIds as string[]) ?? listingIds,
    status: (raw.escrow as Order["status"]) ?? "paid_held",
    pickupCode: raw.pickupCode as string | undefined,
    handoverPin: raw.handoverPin as string | undefined,
    totalTzs: Number(raw.totalTzs ?? 0),
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    accessToken: raw.accessToken as string | undefined,
    directions: shops,
  };
}

export async function stkPush(
  phone: string,
  listingIds: string[],
): Promise<{ requestId: string; status: string }> {
  const res = await fetch(`${BASE}/payments/stk-push`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ phone, listingIds }),
  });
  if (!res.ok) throw new Error("stk_fail");
  return res.json() as Promise<{ requestId: string; status: string }>;
}

export async function payOrder(
  listingIds: string[],
  phone?: string,
): Promise<Order> {
  try {
    if (phone) {
      await stkPush(phone, listingIds);
    }
    const res = await fetch(`${BASE}/orders/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ listingIds }),
    });
    if (!res.ok) throw new Error("pay_fail");
    const raw = (await res.json()) as Record<string, unknown>;
    return mapPay(raw, listingIds);
  } catch {
    return {
      id: `ord_mock_${Date.now().toString(36)}`,
      listingIds,
      status: "paid_held",
      pickupCode: String(1000 + Math.floor(Math.random() * 9000)),
      handoverPin: String(1000 + Math.floor(Math.random() * 9000)),
      totalTzs: mockByIds(listingIds).reduce((s, l) => s + l.priceTzs, 0),
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      accessToken: `tok_mock_${Math.random().toString(36).slice(2)}`,
    };
  }
}

export async function fetchOrder(id: string): Promise<Order | null> {
  try {
    const raw = await getJson<Record<string, unknown>>(`/orders/${encodeURIComponent(id)}`);
    return {
      id: String(raw.orderId ?? id),
      listingIds: (raw.listingIds as string[]) ?? [],
      status: (raw.escrow as Order["status"]) ?? "reserved",
      pickupCode: raw.pickupCode as string | undefined,
      handoverPin: raw.handoverPin as string | undefined,
      totalTzs: Number(raw.totalTzs ?? 0),
      createdAt: String(raw.createdAt ?? new Date().toISOString()),
      paidAt: (raw.paidAt as string | null) ?? null,
      accessToken: raw.accessToken as string | undefined,
      directions: raw.directions as Order["directions"],
    };
  } catch {
    return null;
  }
}

export async function handoverOrder(
  id: string,
  pin?: string,
  action: "confirm" | "reject" = "confirm",
): Promise<{ escrow: string } | null> {
  try {
    const res = await fetch(`${BASE}/orders/${encodeURIComponent(id)}/handover`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(
        action === "reject" ? { action: "reject" } : { pin, action: "confirm" },
      ),
    });
    if (!res.ok) throw new Error("handover_fail");
    return res.json() as Promise<{ escrow: string }>;
  } catch {
    return null;
  }
}

export async function fetchOrders(): Promise<Order[]> {
  return [];
}

/** Optional Web Push stub — never throws. */
export async function registerPushStub(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    void reg.pushManager;
  } catch {
    /* no-op */
  }
}
