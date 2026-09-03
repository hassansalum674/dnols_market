import type {
  HandoverResponse,
  OrderView,
  PayResponse,
  Place,
  PublicListing,
} from "./types";
import { apiBase } from "./lib/apiBase";

const BASE = apiBase();

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const body = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    const err = new Error(body.message || body.error || res.statusText);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  return body;
}

export async function getHealth(): Promise<{ ok: boolean; service: string }> {
  return json("/health");
}

export async function getPlaces(): Promise<{ places: Place[] }> {
  return json("/places");
}

export async function getListings(): Promise<{
  placeId: string;
  count: number;
  items: PublicListing[];
}> {
  return json("/listings?placeId=place_kariakoo_dsm");
}

export async function getListing(id: string): Promise<PublicListing> {
  return json(`/listings/${encodeURIComponent(id)}`);
}

export async function payOrder(
  listingIds: string[],
  opts?: {
    phone?: string;
    payMethod?: "mpesa" | "tigo" | "airtel";
    fulfillment?: "pickup" | "delivery";
    deliveryAddress?: string;
    deliveryPhone?: string;
  },
): Promise<PayResponse> {
  const phone = opts?.phone ?? "+255700000001";
  return json("/orders/pay", {
    method: "POST",
    body: JSON.stringify({
      listingIds,
      phone,
      payMethod: opts?.payMethod ?? "mpesa",
      fulfillment: opts?.fulfillment ?? "delivery",
      deliveryAddress:
        opts?.deliveryAddress ?? "Kariakoo sample drop-off",
      deliveryPhone: opts?.deliveryPhone ?? phone,
    }),
  });
}

export async function getOrder(id: string): Promise<OrderView> {
  return json(`/orders/${encodeURIComponent(id)}`);
}

export async function handoverOrder(
  id: string,
  pin: string,
): Promise<HandoverResponse> {
  return json(`/orders/${encodeURIComponent(id)}/handover`, {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

export async function rejectOrder(id: string): Promise<HandoverResponse> {
  return json(`/orders/${encodeURIComponent(id)}/handover`, {
    method: "POST",
    body: JSON.stringify({ action: "reject" }),
  });
}

export async function getTrending(): Promise<{ items: PublicListing[] }> {
  return json("/trending");
}

export type ProcessedPhotoResponse = {
  cdnUrl: string;
  cdnId: string;
  width: number;
  height: number;
  mode: "cover" | "detail";
  provider: string;
  sizeKb: number;
};

export async function processPhoto(
  file: File,
  mode: "cover" | "detail",
): Promise<ProcessedPhotoResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);
  const res = await fetch(`${BASE}/photos/process`, {
    method: "POST",
    body: form,
  });
  const body = (await res.json().catch(() => ({}))) as ProcessedPhotoResponse & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(body.message || body.error || res.statusText);
  }
  return body;
}

export async function inviteRiderSms(
  phone: string,
  idToken: string,
  name = "",
): Promise<{ ok: boolean; sms: string; rider?: RiderDoc }> {
  return json("/riders/invite", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ phone, name }),
  });
}

export type RiderDoc = {
  riderId: string;
  name: string;
  phone: string;
  authUid: string | null;
  linkedSellers: string[];
  status: "idle" | "busy";
  createdAt: string;
};

export async function listMyRiders(
  idToken: string,
): Promise<{ ok: boolean; riders: RiderDoc[] }> {
  return json("/riders/mine", {
    headers: { Authorization: `Bearer ${idToken}` },
  });
}
