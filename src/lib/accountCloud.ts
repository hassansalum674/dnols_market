import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { loadBillingCards } from "./billingCards";
import {
  loadLastAddress,
  loadLastDeliveryPhone,
  loadLastFulfillment,
  loadLastPayMethod,
  loadLastPayPhone,
  saveCheckoutPrefs,
  type Fulfillment,
  type PayMethod,
} from "./checkout";
import { notifyAvatarChange } from "./avatar";
import { getFirebaseDb } from "./firebase";
import { loadProfile, saveProfile, type UserProfile } from "./profile";
import {
  emitAccountSync,
  endRemoteApply,
  beginRemoteApply,
  setAccountPush,
} from "./syncBus";
import { hydrateCart, getCartItems, type CartItem } from "../store/cart";
import {
  getHistory,
  getLocalOrders,
  getPaidTokens,
  getSavedIds,
  hiddenOrderIds,
  replaceHiddenOrderIds,
  replaceLocalOrders,
  replacePaidTokens,
  replaceSavedIds,
  type HistoryEntry,
} from "../store/persist";
import { loadSettings, saveSettings, type AppSettings } from "../store/settings";

const MAX_DATA_URL = 80_000;

export type BuyerCloud = {
  v: 1;
  updatedAt: number;
  profile: UserProfile;
  settings: Pick<AppSettings, "theme" | "textSize" | "language">;
  savedIds: string[];
  orders: unknown[];
  hiddenOrderIds: string[];
  paidTokens: Record<string, string>;
  billing: unknown[];
  searchHistory: HistoryEntry[];
  checkout: {
    phone?: string;
    deliveryPhone?: string;
    method?: PayMethod;
    fulfillment?: Fulfillment;
    address?: string;
  };
  cartItems: CartItem[];
};

let unsub: Unsubscribe | null = null;
let timer: number | null = null;
let activeUid: string | null = null;
let lastSent = "";

function compact<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => {
      if (typeof v === "string" && v.startsWith("data:") && v.length > MAX_DATA_URL) {
        return "";
      }
      return v;
    }),
  ) as T;
}

function uniq(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function mergeProfile(local: UserProfile, cloud: UserProfile): UserProfile {
  const next: UserProfile = { ...cloud };
  (Object.keys(local) as (keyof UserProfile)[]).forEach((key) => {
    const v = local[key];
    if (v !== undefined && v !== null && v !== "") {
      (next as Record<string, unknown>)[key] = v;
    }
  });
  return next;
}

function mergeOrders(local: unknown[], cloud: unknown[]): unknown[] {
  const map = new Map<string, unknown>();
  for (const row of [...cloud, ...local]) {
    if (!row || typeof row !== "object") continue;
    const id = (row as { id?: unknown }).id;
    if (typeof id !== "string" || !id) continue;
    map.set(id, row);
  }
  return [...map.values()];
}

function mergeHistory(local: HistoryEntry[], cloud: HistoryEntry[]): HistoryEntry[] {
  return [...local, ...cloud]
    .filter(
      (entry, i, arr) =>
        arr.findIndex((x) => x.q.toLowerCase() === entry.q.toLowerCase()) === i,
    )
    .slice(0, 8);
}

function mergeCart(local: CartItem[], cloud: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const row of [...cloud, ...local]) {
    if (!row?.listing?.id) continue;
    map.set(row.listing.id, row);
  }
  return [...map.values()];
}

function mergeBilling(local: unknown[], cloud: unknown[]): unknown[] {
  const map = new Map<string, unknown>();
  for (const row of [...cloud, ...local]) {
    if (!row || typeof row !== "object") continue;
    const id = (row as { id?: unknown }).id;
    if (typeof id !== "string" || !id) continue;
    map.set(id, row);
  }
  return [...map.values()].slice(0, 5);
}

export function collectBuyer(uid: string): BuyerCloud {
  return compact({
    v: 1 as const,
    updatedAt: Date.now(),
    profile: loadProfile(uid),
    settings: loadSettings(),
    savedIds: getSavedIds(),
    orders: getLocalOrders(),
    hiddenOrderIds: hiddenOrderIds(),
    paidTokens: getPaidTokens(),
    billing: loadBillingCards(uid),
    searchHistory: getHistory(uid),
    checkout: {
      phone: loadLastPayPhone() || undefined,
      deliveryPhone: loadLastDeliveryPhone() || undefined,
      method: loadLastPayMethod(),
      fulfillment: loadLastFulfillment() ?? undefined,
      address: loadLastAddress() || undefined,
    },
    cartItems: getCartItems(),
  });
}

function applyBuyer(uid: string, data: BuyerCloud) {
  beginRemoteApply();
  try {
    saveProfile(uid, data.profile || {});
    if (data.settings) {
      saveSettings({
        theme: data.settings.theme,
        textSize: data.settings.textSize,
        language: data.settings.language,
      });
    }
    replaceSavedIds(data.savedIds ?? []);
    replaceLocalOrders(data.orders ?? []);
    replaceHiddenOrderIds(data.hiddenOrderIds ?? []);
    replacePaidTokens(data.paidTokens ?? {});
    if (Array.isArray(data.billing)) {
      localStorage.setItem(`dnols.billing.${uid}`, JSON.stringify(data.billing.slice(0, 5)));
    }
    if (Array.isArray(data.searchHistory)) {
      localStorage.setItem(
        `dnols.searchHistory.${uid}`,
        JSON.stringify(data.searchHistory.slice(0, 8)),
      );
    }
    const c = data.checkout;
    if (c?.phone && c.method) {
      saveCheckoutPrefs(
        c.phone,
        c.method,
        c.deliveryPhone,
        c.fulfillment,
        c.address,
      );
    }
    hydrateCart(Array.isArray(data.cartItems) ? data.cartItems : []);
    notifyAvatarChange();
    emitAccountSync();
  } finally {
    endRemoteApply();
  }
}

function mergeBuyer(local: BuyerCloud, cloud: BuyerCloud): BuyerCloud {
  return compact({
    v: 1 as const,
    updatedAt: Date.now(),
    profile: mergeProfile(local.profile || {}, cloud.profile || {}),
    settings: cloud.settings?.language ? cloud.settings : local.settings,
    savedIds: uniq([...(cloud.savedIds || []), ...(local.savedIds || [])]),
    orders: mergeOrders(local.orders || [], cloud.orders || []),
    hiddenOrderIds: uniq([
      ...(local.hiddenOrderIds || []),
      ...(cloud.hiddenOrderIds || []),
    ]),
    paidTokens: { ...(cloud.paidTokens || {}), ...(local.paidTokens || {}) },
    billing: mergeBilling(local.billing || [], cloud.billing || []),
    searchHistory: mergeHistory(local.searchHistory || [], cloud.searchHistory || []),
    checkout: {
      ...cloud.checkout,
      ...Object.fromEntries(
        Object.entries(local.checkout || {}).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      ),
    },
    cartItems: mergeCart(local.cartItems || [], cloud.cartItems || []),
  });
}

function stampless(data: BuyerCloud | undefined): string {
  if (!data) return "";
  const { updatedAt: _n, ...rest } = data;
  return JSON.stringify(rest);
}

async function writeCloud(db: Firestore, uid: string, data: BuyerCloud) {
  const payload = compact(data);
  lastSent = stampless(payload);
  await setDoc(doc(db, "users", uid), payload);
}

export async function pushAccountNow(uid: string) {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    await writeCloud(db, uid, collectBuyer(uid));
  } catch {
    /* Firestore may not be enabled yet */
  }
}

function pushSoon(uid: string) {
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    void pushAccountNow(uid);
  }, 700);
}

export async function startAccountSync(uid: string) {
  stopAccountSync();
  activeUid = uid;
  setAccountPush(() => {
    if (activeUid) pushSoon(activeUid);
  });
  const db = getFirebaseDb();
  if (!db) {
    emitAccountSync();
    return;
  }
  const ref = doc(db, "users", uid);
  try {
    const snap = await getDoc(ref);
    const local = collectBuyer(uid);
    const merged = snap.exists()
      ? mergeBuyer(local, snap.data() as BuyerCloud)
      : local;
    applyBuyer(uid, merged);
    await writeCloud(db, uid, merged);
  } catch {
    emitAccountSync();
    return;
  }
  unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const cloud = snap.data() as BuyerCloud;
    if (stampless(cloud) === lastSent) return;
    const local = collectBuyer(uid);
    const merged = mergeBuyer(local, cloud);
    applyBuyer(uid, merged);
    if (stampless(merged) !== stampless(cloud)) {
      void writeCloud(db, uid, merged);
    } else {
      lastSent = stampless(merged);
    }
  });
}

export function stopAccountSync() {
  setAccountPush(() => {});
  activeUid = null;
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (unsub) {
    unsub();
    unsub = null;
  }
}
