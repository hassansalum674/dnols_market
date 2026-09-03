import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import {
  beginRemoteApply,
  emitSellerSync,
  endRemoteApply,
  setSellerPush,
} from "./syncBus";
import {
  loadDraft,
  loadHours,
  loadPayouts,
  loadProducts,
  loadProfile,
  loadSavedOrders,
  saveDraft,
  saveHours,
  savePayoutsReplace,
  saveProducts,
  saveProfile,
  replaceSavedOrders,
} from "../storage";
import { loadSettings, saveSettings } from "../store/settings";
import type { OnboardingDraft, SavedOrder, SellerProduct, SellerProfile } from "../types";

const MAX_DATA_URL = 80_000;

export type SellerCloud = {
  v: 1;
  updatedAt: number;
  profile: SellerProfile | null;
  draft: OnboardingDraft | null;
  products: SellerProduct[];
  orders: SavedOrder[];
  hours: ReturnType<typeof loadHours>;
  payouts: ReturnType<typeof loadPayouts>;
  settings: ReturnType<typeof loadSettings>;
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

function stampless(data: SellerCloud | undefined): string {
  if (!data) return "";
  const { updatedAt: _n, ...rest } = data;
  return JSON.stringify(rest);
}

function mergeById<T extends { id?: string; orderId?: string }>(
  local: T[],
  cloud: T[],
  idOf: (row: T) => string | undefined,
): T[] {
  const map = new Map<string, T>();
  for (const row of [...cloud, ...local]) {
    const id = idOf(row);
    if (!id) continue;
    map.set(id, row);
  }
  return [...map.values()];
}

export function collectSeller(): SellerCloud {
  return compact({
    v: 1 as const,
    updatedAt: Date.now(),
    profile: loadProfile(),
    draft: loadDraft(),
    products: loadProducts(),
    orders: loadSavedOrders(),
    hours: loadHours(),
    payouts: loadPayouts(),
    settings: loadSettings(),
  });
}

function applySeller(data: SellerCloud) {
  beginRemoteApply();
  try {
    if (data.profile) saveProfile(data.profile);
    if (data.draft) saveDraft(data.draft);
    if (Array.isArray(data.products)) saveProducts(data.products);
    if (Array.isArray(data.orders)) replaceSavedOrders(data.orders);
    if (data.hours) saveHours(data.hours);
    if (Array.isArray(data.payouts)) savePayoutsReplace(data.payouts);
    if (data.settings?.language) {
      saveSettings({
        theme: data.settings.theme,
        language: data.settings.language,
      });
    }
    emitSellerSync();
  } finally {
    endRemoteApply();
  }
}

function mergeSeller(local: SellerCloud, cloud: SellerCloud): SellerCloud {
  return compact({
    v: 1 as const,
    updatedAt: Date.now(),
    profile: local.profile ?? cloud.profile,
    draft: local.draft ?? cloud.draft,
    products: mergeById(local.products || [], cloud.products || [], (p) => p.id),
    orders: mergeById(local.orders || [], cloud.orders || [], (o) => o.orderId),
    hours: local.hours ?? cloud.hours,
    payouts: (local.payouts && local.payouts.length ? local.payouts : cloud.payouts) || [],
    settings: cloud.settings?.language ? cloud.settings : local.settings,
  });
}

async function writeCloud(db: Firestore, uid: string, data: SellerCloud) {
  const payload = compact(data);
  lastSent = stampless(payload);
  await setDoc(doc(db, "sellers", uid), payload);
}

export async function pushSellerNow(uid: string) {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    await writeCloud(db, uid, collectSeller());
  } catch {
    /* Firestore may not be enabled yet */
  }
}

function pushSoon(uid: string) {
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    void pushSellerNow(uid);
  }, 700);
}

export async function startSellerSync(uid: string) {
  stopSellerSync();
  activeUid = uid;
  setSellerPush(() => {
    if (activeUid) pushSoon(activeUid);
  });
  const db = getFirebaseDb();
  if (!db) {
    emitSellerSync();
    return;
  }
  const ref = doc(db, "sellers", uid);
  try {
    const snap = await getDoc(ref);
    const local = collectSeller();
    const merged = snap.exists()
      ? mergeSeller(local, snap.data() as SellerCloud)
      : local;
    applySeller(merged);
    await writeCloud(db, uid, merged);
  } catch {
    emitSellerSync();
    return;
  }
  unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const cloud = snap.data() as SellerCloud;
    if (stampless(cloud) === lastSent) return;
    const local = collectSeller();
    const merged = mergeSeller(local, cloud);
    applySeller(merged);
    if (stampless(merged) !== stampless(cloud)) {
      void writeCloud(db, uid, merged);
    } else {
      lastSent = stampless(merged);
    }
  });
}

export function stopSellerSync() {
  setSellerPush(() => {});
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
