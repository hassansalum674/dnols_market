import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import {
  ORDERS_COL,
  RIDERS_COL,
  SELLER_RIDERS_COL,
  isValidTzMobile,
  riderIdFromPhone,
  sellerRiderDocId,
  toE164,
  type DeliveryItem,
  type DeliveryStatus,
  type MarketOrderDoc,
  type RiderDoc,
  type SellerRiderDoc,
} from "./delivery";

export type { DeliveryItem, DeliveryStatus, MarketOrderDoc, RiderDoc, SellerRiderDoc };
export {
  ORDERS_COL,
  RIDERS_COL,
  SELLER_RIDERS_COL,
  formatTzMobile,
  googleMapsUrl,
  isValidTzMobile,
  riderIdFromPhone,
  toE164,
} from "./delivery";

function nowIso(): string {
  return new Date().toISOString();
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function asNumOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function parseRider(id: string, data: Record<string, unknown>): RiderDoc {
  const linked = Array.isArray(data.linkedSellers)
    ? data.linkedSellers.map((s) => String(s)).filter(Boolean)
    : [];
  return {
    riderId: asString(data.riderId, id),
    name: asString(data.name, "Rider"),
    phone: asString(data.phone),
    authUid: asStringOrNull(data.authUid),
    linkedSellers: linked,
    status: data.status === "busy" ? "busy" : "idle",
    createdAt: asString(data.createdAt, nowIso()),
  };
}

export function parseOrder(id: string, data: Record<string, unknown>): MarketOrderDoc {
  const items = Array.isArray(data.items)
    ? data.items
        .map((row) => {
          const r = row as { title?: unknown; qty?: unknown };
          return {
            title: String(r.title ?? "Item"),
            qty: Math.max(1, Number(r.qty) || 1),
          };
        })
        .slice(0, 40)
    : [];
  const status = data.deliveryStatus;
  const deliveryStatus: DeliveryStatus =
    status === "assigned" || status === "picked_up" || status === "delivered"
      ? status
      : "unassigned";
  return {
    orderId: asString(data.orderId, id),
    buyerUid: asString(data.buyerUid),
    buyerName: asString(data.buyerName, "Buyer"),
    sellerIds: Array.isArray(data.sellerIds)
      ? data.sellerIds.map((s) => String(s)).filter(Boolean)
      : [],
    shopIds: Array.isArray(data.shopIds)
      ? data.shopIds.map((s) => String(s)).filter(Boolean)
      : [],
    listingIds: Array.isArray(data.listingIds)
      ? data.listingIds.map((s) => String(s)).filter(Boolean)
      : [],
    items,
    totalTzs: Number(data.totalTzs) || 0,
    fulfillment: data.fulfillment === "pickup" ? "pickup" : "delivery",
    deliveryAddress: asString(data.deliveryAddress),
    deliveryPhone: asString(data.deliveryPhone),
    deliveryLat: asNumOrNull(data.deliveryLat),
    deliveryLng: asNumOrNull(data.deliveryLng),
    pickupCode: asStringOrNull(data.pickupCode) ?? undefined,
    deliveryStatus,
    riderId: asStringOrNull(data.riderId),
    riderName: asStringOrNull(data.riderName),
    riderAuthUid: asStringOrNull(data.riderAuthUid),
    riderAssignedAt: asStringOrNull(data.riderAssignedAt),
    pickedUpAt: asStringOrNull(data.pickedUpAt),
    deliveredAt: asStringOrNull(data.deliveredAt),
    createdAt: asString(data.createdAt, nowIso()),
    paidAt: asStringOrNull(data.paidAt),
  };
}

export async function inviteRider(
  db: Firestore,
  sellerId: string,
  phoneRaw: string,
  name: string,
): Promise<RiderDoc> {
  const phone = toE164(phoneRaw);
  if (!isValidTzMobile(phone)) {
    throw new Error("Enter a valid Tanzania number (+255 6… or 7…).");
  }
  const riderId = riderIdFromPhone(phone);
  const riderRef = doc(db, RIDERS_COL, riderId);
  const existing = await getDoc(riderRef);
  const display = name.trim() || "Rider";
  if (existing.exists()) {
    const cur = parseRider(riderId, existing.data() as Record<string, unknown>);
    await updateDoc(riderRef, {
      linkedSellers: arrayUnion(sellerId),
      name: cur.name && cur.name !== "Rider" ? cur.name : display,
    });
  } else {
    await setDoc(riderRef, {
      riderId,
      name: display,
      phone,
      authUid: null,
      linkedSellers: [sellerId],
      status: "idle",
      createdAt: nowIso(),
    });
  }
  const linkRef = doc(db, SELLER_RIDERS_COL, sellerRiderDocId(sellerId, riderId));
  await setDoc(
    linkRef,
    {
      sellerId,
      riderId,
      addedAt: nowIso(),
      active: true,
    },
    { merge: true },
  );
  const next = await getDoc(riderRef);
  return parseRider(riderId, (next.data() ?? {}) as Record<string, unknown>);
}

export function listenSellerRiders(
  db: Firestore,
  sellerId: string,
  onData: (riders: RiderDoc[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, SELLER_RIDERS_COL),
    where("sellerId", "==", sellerId),
    where("active", "==", true),
  );
  const riderUnsubs: Unsubscribe[] = [];
  const stopLinks = onSnapshot(
    q,
    (snap) => {
      for (const u of riderUnsubs.splice(0)) u();
      const ids = snap.docs.map((d) => String(d.data().riderId ?? "")).filter(Boolean);
      if (ids.length === 0) {
        onData([]);
        return;
      }
      const byId = new Map<string, RiderDoc>();
      ids.forEach((id) => {
        const u = onSnapshot(
          doc(db, RIDERS_COL, id),
          (rs) => {
            if (rs.exists()) {
              byId.set(id, parseRider(id, rs.data() as Record<string, unknown>));
            } else {
              byId.delete(id);
            }
            onData([...byId.values()].sort((a, b) => a.name.localeCompare(b.name)));
          },
          (e) => onError?.(e),
        );
        riderUnsubs.push(u);
      });
    },
    (e) => onError?.(e),
  );
  return () => {
    stopLinks();
    for (const u of riderUnsubs) u();
  };
}

export function listenSellerOrders(
  db: Firestore,
  sellerId: string,
  shopId: string,
  onData: (orders: MarketOrderDoc[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const merged = new Map<string, MarketOrderDoc>();
  const emit = () =>
    onData(
      [...merged.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    );
  const q1 = query(
    collection(db, ORDERS_COL),
    where("sellerIds", "array-contains", sellerId),
  );
  const q2 = shopId
    ? query(collection(db, ORDERS_COL), where("shopIds", "array-contains", shopId))
    : null;
  const u1 = onSnapshot(
    q1,
    (snap) => {
      snap.docs.forEach((d) =>
        merged.set(d.id, parseOrder(d.id, d.data() as Record<string, unknown>)),
      );
      emit();
    },
    (e) => onError?.(e),
  );
  const u2 = q2
    ? onSnapshot(
        q2,
        (snap) => {
          snap.docs.forEach((d) =>
            merged.set(d.id, parseOrder(d.id, d.data() as Record<string, unknown>)),
          );
          emit();
        },
        (e) => onError?.(e),
      )
    : () => {};
  return () => {
    u1();
    u2();
  };
}

export function listenRiderOrders(
  db: Firestore,
  riderId: string,
  riderAuthUid: string | null,
  onData: (orders: MarketOrderDoc[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const merged = new Map<string, MarketOrderDoc>();
  const emit = () =>
    onData(
      [...merged.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    );
  const q1 = query(collection(db, ORDERS_COL), where("riderId", "==", riderId));
  const q2 = riderAuthUid
    ? query(collection(db, ORDERS_COL), where("riderAuthUid", "==", riderAuthUid))
    : null;
  const u1 = onSnapshot(
    q1,
    (snap) => {
      snap.docs.forEach((d) =>
        merged.set(d.id, parseOrder(d.id, d.data() as Record<string, unknown>)),
      );
      emit();
    },
    (e) => onError?.(e),
  );
  const u2 = q2
    ? onSnapshot(
        q2,
        (snap) => {
          snap.docs.forEach((d) =>
            merged.set(d.id, parseOrder(d.id, d.data() as Record<string, unknown>)),
          );
          emit();
        },
        (e) => onError?.(e),
      )
    : () => {};
  return () => {
    u1();
    u2();
  };
}

export function listenBuyerOrders(
  db: Firestore,
  buyerUid: string,
  onData: (orders: MarketOrderDoc[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(collection(db, ORDERS_COL), where("buyerUid", "==", buyerUid));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs
          .map((d) => parseOrder(d.id, d.data() as Record<string, unknown>))
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
      );
    },
    (e) => onError?.(e),
  );
}

export function listenOrder(
  db: Firestore,
  orderId: string,
  onData: (order: MarketOrderDoc | null) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, ORDERS_COL, orderId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(parseOrder(snap.id, snap.data() as Record<string, unknown>));
    },
    (e) => onError?.(e),
  );
}

export async function publishMarketOrder(
  db: Firestore,
  order: MarketOrderDoc,
): Promise<void> {
  const ref = doc(db, ORDERS_COL, order.orderId);
  const payload = {
    ...order,
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
}

export async function assignRider(
  db: Firestore,
  orderId: string,
  rider: RiderDoc,
): Promise<void> {
  const orderRef = doc(db, ORDERS_COL, orderId);
  const riderRef = doc(db, RIDERS_COL, rider.riderId);
  const at = nowIso();
  await updateDoc(orderRef, {
    deliveryStatus: "assigned",
    riderId: rider.riderId,
    riderName: rider.name,
    riderAuthUid: rider.authUid,
    riderAssignedAt: at,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(riderRef, { status: "busy" });
}

export async function markPickedUp(db: Firestore, orderId: string): Promise<void> {
  await updateDoc(doc(db, ORDERS_COL, orderId), {
    deliveryStatus: "picked_up",
    pickedUpAt: nowIso(),
    updatedAt: serverTimestamp(),
  });
}

export async function markDelivered(
  db: Firestore,
  orderId: string,
  riderId: string | null,
): Promise<void> {
  await updateDoc(doc(db, ORDERS_COL, orderId), {
    deliveryStatus: "delivered",
    deliveredAt: nowIso(),
    updatedAt: serverTimestamp(),
  });
  if (!riderId) return;
  const open = await riderHasOpenOrders(db, riderId);
  if (!open) {
    await updateDoc(doc(db, RIDERS_COL, riderId), { status: "idle" });
  }
}

async function riderHasOpenOrders(db: Firestore, riderId: string): Promise<boolean> {
  const { getDocs } = await import("firebase/firestore");
  const q = query(
    collection(db, ORDERS_COL),
    where("riderId", "==", riderId),
    where("deliveryStatus", "in", ["assigned", "picked_up"]),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function claimRiderByPhone(
  db: Firestore,
  authUid: string,
  phoneRaw: string,
): Promise<RiderDoc | null> {
  const phone = toE164(phoneRaw);
  const riderId = riderIdFromPhone(phone);
  const ref = doc(db, RIDERS_COL, riderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  await updateDoc(ref, { authUid });
  return parseRider(riderId, { ...snap.data(), authUid } as Record<string, unknown>);
}

export async function loadRiderByAuthUid(
  db: Firestore,
  authUid: string,
  phoneRaw?: string,
): Promise<RiderDoc | null> {
  if (phoneRaw && isValidTzMobile(phoneRaw)) {
    const byPhone = await getDoc(doc(db, RIDERS_COL, riderIdFromPhone(phoneRaw)));
    if (byPhone.exists()) {
      const rider = parseRider(byPhone.id, byPhone.data() as Record<string, unknown>);
      if (!rider.authUid) {
        await updateDoc(byPhone.ref, { authUid });
        return { ...rider, authUid };
      }
      return rider;
    }
  }
  const { getDocs } = await import("firebase/firestore");
  const q = query(collection(db, RIDERS_COL), where("authUid", "==", authUid));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return parseRider(first.id, first.data() as Record<string, unknown>);
}
