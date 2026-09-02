import {
  filterListings,
  mockByIds,
  mockDetail,
  mockDirectionsForListingIds,
  mockSuggest,
  mockTrending,
} from "../data/mocks";
import type {
  DirectionsPayload,
  EscrowStatus,
  ListingFilters,
  Order,
  PublicListing,
  PublicListingDetail,
} from "../types";
import { loadBuyerLocation } from "../lib/buyerLocation";
import { generatePickupCode } from "../lib/pickupCode";
import { apiBase } from "../lib/apiBase";

const BASE = apiBase();

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

function withBuyerGeo(params: URLSearchParams): URLSearchParams {
  const loc = loadBuyerLocation();
  if (loc) {
    params.set("buyerLat", String(loc.lat));
    params.set("buyerLng", String(loc.lng));
  }
  return params;
}

function qs(filters: ListingFilters): string {
  const p = new URLSearchParams();
  if (filters.category) p.set("category", filters.category);
  if (filters.maxDistance) {
    p.set("maxDistanceMeters", String(filters.maxDistance));
    p.set("maxDistance", String(filters.maxDistance));
  }
  if (filters.sort) p.set("sort", filters.sort);
  if (filters.inStock) p.set("inStock", "1");
  if (filters.minPrice !== "" && filters.minPrice != null)
    p.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== "" && filters.maxPrice != null)
    p.set("maxPrice", String(filters.maxPrice));
  if (filters.q) p.set("q", filters.q);
  withBuyerGeo(p);
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
    if (!listings.length && !filters.q && !filters.category) {
      throw new Error("empty_api");
    }
    return { listings, source: "api" };
  } catch {
    return {
      listings: filterListings(filters, loadBuyerLocation()),
      source: "mock",
    };
  }
}

export async function fetchListingDetail(
  id: string,
  paidToken?: string | null,
): Promise<{ detail: PublicListingDetail | null; source: DataSource; status?: number }> {
  try {
    const params = withBuyerGeo(new URLSearchParams());
    if (paidToken) {
      params.set("token", paidToken);
      params.set("paid", "1");
    }
    const q = params.toString() ? `?${params}` : "";
    const data = await getJson<PublicListingDetail & { paid?: boolean }>(
      `/listings/${encodeURIComponent(id)}${q}`,
    );
    const paid = Boolean(data.paid || data.directions);
    return {
      detail: { ...data, paid },
      source: "api",
    };
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 404) return { detail: null, source: "api", status: 404 };
    if (status === 500) return { detail: null, source: "api", status: 500 };
    const paid = Boolean(paidToken);
    const detail = mockDetail(id, paid, loadBuyerLocation());
    if (!detail) return { detail: null, source: "mock", status: status ?? 404 };
    return { detail, source: "mock", status };
  }
}

export async function fetchSuggest(q: string): Promise<PublicListing[]> {
  try {
    const data = await getJson<unknown>(`/search?q=${encodeURIComponent(q)}`);
    const listings = asList(data);
    return listings.slice(0, 6);
  } catch {
    return mockSuggest(q, loadBuyerLocation());
  }
}

export async function fetchTrending(): Promise<PublicListing[]> {
  try {
    const data = await getJson<unknown>(`/listings${qs({ sort: "newest" })}`);
    const listings = asList(data);
    return listings.slice(0, 6);
  } catch {
    return mockTrending(loadBuyerLocation());
  }
}

export async function payOrder(input: {
  listingIds: string[];
  payMethod: string;
  phone: string;
  deliveryPhone: string;
}): Promise<Order> {
  try {
    const res = await fetch(`${BASE}/orders/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as {
      orderId?: string;
      listingIds?: string[];
      escrow?: EscrowStatus;
      pickupCode?: string;
      handoverPin?: string;
      totalTzs?: number;
      accessToken?: string;
      shops?: DirectionsPayload[];
      deliveryPhone?: string;
      message?: string;
      error?: string;
    };
    if (!res.ok) {
      throw new Error(data.message || data.error || "Payment failed");
    }
    return {
      id: data.orderId ?? `ord_${Date.now().toString(36)}`,
      listingIds: data.listingIds ?? input.listingIds,
      status: data.escrow ?? "paid_held",
      pickupCode: data.pickupCode ?? generatePickupCode(),
      handoverPin: data.handoverPin ?? generatePickupCode(),
      totalTzs: data.totalTzs ?? 0,
      accessToken: data.accessToken,
      directions: data.shops,
      payMethod: input.payMethod,
      payPhone: input.phone,
      deliveryPhone: data.deliveryPhone ?? input.deliveryPhone,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    };
  } catch (e) {
    if (e instanceof Error && e.message !== "pay_fail") throw e;
    return {
      id: `ord_mock_${Date.now().toString(36)}`,
      listingIds: input.listingIds,
      status: "paid_held",
      pickupCode: generatePickupCode(),
      handoverPin: generatePickupCode(),
      totalTzs: mockByIds(input.listingIds).reduce((s, l) => s + l.priceTzs, 0),
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      accessToken: `tok_mock_${Math.random().toString(36).slice(2)}`,
      directions: mockDirectionsForListingIds(input.listingIds),
      payMethod: input.payMethod,
      payPhone: input.phone,
      deliveryPhone: input.deliveryPhone,
    };
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const data = await getJson<unknown>("/orders");
    if (Array.isArray(data)) return data as Order[];
    if (data && typeof data === "object" && Array.isArray((data as { orders?: unknown }).orders)) {
      return (data as { orders: Order[] }).orders;
    }
    return [];
  } catch {
    return [];
  }
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
