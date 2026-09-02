import { emptyDraft } from "./lib/onboarding";
import type {
  LocalSku,
  OnboardingDraft,
  PayoutMock,
  SavedOrder,
  SellerApplicationStatus,
  SellerProduct,
  SellerProfile,
  SellerSession,
  ShopHours,
} from "./types";

const DRAFT = "dnols.seller.draft";
const PROFILE = "dnols.seller.profile";
const SESSION = "dnols.seller.session";
const PRODUCTS = "dnols.seller.products";
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

/* ── Seller session ── */

export function loadSession(): SellerSession | null {
  return read<SellerSession | null>(SESSION, null);
}

export function saveSession(session: SellerSession): void {
  write(SESSION, session);
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION);
  } catch {
    /* ignore */
  }
}

export function isSignedIn(): boolean {
  return loadSession() !== null;
}

/* ── Onboarding draft ── */

function mergeDraft(raw: OnboardingDraft): OnboardingDraft {
  const empty = emptyDraft();
  return {
    ...empty,
    ...raw,
    step1: { ...empty.step1, ...raw.step1 },
    step2: { ...empty.step2, ...raw.step2 },
    step3: { ...empty.step3, ...raw.step3 },
    step4: { ...empty.step4, ...raw.step4 },
    step5: { ...empty.step5, ...raw.step5 },
    step6: { ...empty.step6, ...raw.step6 },
  };
}

export function loadDraft(): OnboardingDraft | null {
  const raw = read<OnboardingDraft | null>(DRAFT, null);
  return raw ? mergeDraft(raw) : null;
}

export function saveDraft(draft: OnboardingDraft): void {
  write(DRAFT, { ...draft, updatedAt: new Date().toISOString() });
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT);
  } catch {
    /* ignore */
  }
}

/* ── Seller profile (post-submit) ── */

export function loadProfile(): SellerProfile | null {
  const raw = read<SellerProfile | null>(PROFILE, null);
  if (!raw) return null;
  const merged = mergeDraft(raw);
  return { ...raw, ...merged, step2: merged.step2 };
}

export function saveProfile(profile: SellerProfile): void {
  write(PROFILE, profile);
}

export function updateProfileStatus(
  status: SellerApplicationStatus,
  rejectionReason?: string,
): SellerProfile | null {
  const profile = loadProfile();
  if (!profile) return null;
  const next: SellerProfile = {
    ...profile,
    status,
    rejectionReason: rejectionReason ?? profile.rejectionReason,
  };
  saveProfile(next);
  return next;
}

/* ── Products ── */

export function loadProducts(): SellerProduct[] {
  return read<SellerProduct[]>(PRODUCTS, []);
}

export function saveProducts(products: SellerProduct[]): void {
  write(PRODUCTS, products);
}

export function upsertProduct(product: SellerProduct): SellerProduct[] {
  const next = [
    product,
    ...loadProducts().filter((p) => p.id !== product.id),
  ];
  saveProducts(next);
  return next;
}

export function deleteProduct(id: string): SellerProduct[] {
  const next = loadProducts().filter((p) => p.id !== id);
  saveProducts(next);
  return next;
}

/* ── Legacy shop storage ── */

export function loadSavedOrders(): SavedOrder[] {
  return read<SavedOrder[]>(ORDERS, []);
}

export function upsertSavedOrder(row: SavedOrder): SavedOrder[] {
  const next = [
    row,
    ...loadSavedOrders().filter((o) => o.orderId !== row.orderId),
  ];
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
