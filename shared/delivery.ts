export type RiderStatus = "idle" | "busy";

export type DeliveryStatus =
  | "unassigned"
  | "assigned"
  | "picked_up"
  | "delivered";

export type CallStatus = "idle" | "calling" | "in_call" | "ended";

export type RiderDoc = {
  riderId: string;
  name: string;
  phone: string;
  authUid: string | null;
  linkedSellers: string[];
  status: RiderStatus;
  createdAt: string;
};

export type SellerRiderDoc = {
  sellerId: string;
  riderId: string;
  addedAt: string;
  active: boolean;
};

export type DeliveryItem = {
  title: string;
  qty: number;
};

export type MarketOrderDoc = {
  orderId: string;
  buyerUid: string;
  buyerName: string;
  sellerIds: string[];
  shopIds: string[];
  listingIds: string[];
  items: DeliveryItem[];
  totalTzs: number;
  fulfillment: "pickup" | "delivery";
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  pickupCode?: string;
  deliveryStatus: DeliveryStatus;
  riderId: string | null;
  riderName: string | null;
  riderAuthUid: string | null;
  riderAssignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  paidAt: string | null;
  callStatus: CallStatus;
  callInitiatedBy: string | null;
  callStartedAt: string | null;
};

export const RIDERS_COL = "riders";
export const SELLER_RIDERS_COL = "seller_riders";
export const ORDERS_COL = "orders";

export function riderIdFromPhone(phone: string): string {
  const digits = toE164(phone).replace(/\D/g, "");
  return `rider_${digits}`;
}

export function sellerRiderDocId(sellerId: string, riderId: string): string {
  return `${sellerId}_${riderId}`;
}

/** Tanzania mobiles: +255 6… or +255 7… */
export function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255")) return `+${digits}`;
  if (digits.startsWith("0")) return `+255${digits.slice(1)}`;
  if (digits.length === 9) return `+255${digits}`;
  return raw.trim();
}

export function isValidTzMobile(raw: string): boolean {
  const d = toE164(raw).replace(/\D/g, "");
  return /^255[67]\d{8}$/.test(d);
}

export function formatTzMobile(raw: string): string {
  const d = toE164(raw).replace(/\D/g, "");
  if (!d.startsWith("255") || d.length < 12) return raw;
  const local = d.slice(3);
  return `+255 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

export function deliveryTrackLabel(
  status: DeliveryStatus | undefined,
  lang: "en" | "sw",
): string {
  const en: Record<DeliveryStatus, string> = {
    unassigned: "Waiting for rider",
    assigned: "Rider assigned",
    picked_up: "On the way",
    delivered: "Delivered",
  };
  const sw: Record<DeliveryStatus, string> = {
    unassigned: "Inasubiri rider",
    assigned: "Rider amepewa oda",
    picked_up: "Iko njiani",
    delivered: "Imefikishwa",
  };
  if (!status) return lang === "sw" ? "Inasubiri rider" : "Waiting for rider";
  return (lang === "sw" ? sw : en)[status];
}

export function googleMapsUrl(order: {
  deliveryAddress?: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
}): string {
  const lat = order.deliveryLat;
  const lng = order.deliveryLng;
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  const q = encodeURIComponent(order.deliveryAddress?.trim() || "Kariakoo, Dar es Salaam");
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function callChannelName(orderId: string): string {
  const safe = String(orderId).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 56);
  return `order_${safe}`;
}

export function firstNameOf(
  full: string | null | undefined,
  fallback = "",
): string {
  const token = (full ?? "").trim().split(/\s+/)[0];
  return token || fallback;
}

export function canPlaceVoiceCall(order: {
  deliveryStatus?: DeliveryStatus | string | null;
  riderId?: string | null;
}): boolean {
  if (order.deliveryStatus === "delivered") return false;
  if (order.deliveryStatus !== "assigned" && order.deliveryStatus !== "picked_up") {
    return false;
  }
  return Boolean(order.riderId);
}

export function formatCallClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
