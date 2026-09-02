export type Category = "fashion" | "electronics";
export type EscrowStatus =
  | "reserved"
  | "paid_held"
  | "handed_over"
  | "rejected_refund";

export type PublicListing = {
  id: string;
  title: string;
  priceTzs: number;
  category: Category;
  photoUrl: string;
  distanceMeters: number;
  inStock: boolean;
  description?: string;
  sizes?: string[];
  brand?: string;
};

export type Place = {
  placeId: string;
  name: string;
  city: string;
  country: string;
  hint?: string;
};

export type OrderView = {
  orderId: string;
  escrow: EscrowStatus;
  listingIds: string[];
  totalTzs: number;
  createdAt: string;
  paidAt: string | null;
  handedOverAt: string | null;
  locationUnlocked: boolean;
  pickupCode?: string;
  handoverPin?: string;
  accessToken?: string;
};

export type PayResponse = {
  mockPayment: { provider: string; status: string; note: string };
  orderId: string;
  escrow: EscrowStatus;
  pickupCode: string;
  handoverPin: string;
  accessToken: string;
  totalTzs: number;
  listingIds: string[];
};

export type HandoverResponse = {
  orderId: string;
  escrow: EscrowStatus;
  handedOverAt?: string;
  mock?: string;
};

/** Local overlay — API has no seller listing CRUD. */
export type LocalSku = {
  id: string;
  listingId?: string;
  title: string;
  priceTzs: number;
  category: Category;
  inStock: boolean;
  notes: string;
  photoUrl?: string;
  createdAt: string;
};

export type SavedOrder = {
  orderId: string;
  listingIds: string[];
  handoverPin: string;
  pickupCode: string;
  accessToken: string;
  totalTzs: number;
  createdAt: string;
};

export type ShopHours = {
  open: string;
  close: string;
  days: string;
};

export type PayoutMock = {
  id: string;
  amountTzs: number;
  at: string;
  note: string;
};

/* ── Seller onboarding types ── */

export type ShopCategory =
  | "fashion_shoes"
  | "fabrics_textiles"
  | "phones_accessories"
  | "electronics_gadgets";

export const SHOP_CATEGORIES: { id: ShopCategory; label: string }[] = [
  { id: "fashion_shoes", label: "Fashion & Shoes" },
  { id: "fabrics_textiles", label: "Fabrics & Textiles" },
  { id: "phones_accessories", label: "Phones & Accessories" },
  { id: "electronics_gadgets", label: "Electronics & Gadgets" },
];

export type Floor = "ground" | "1st" | "2nd" | "3rd" | "basement";

export const FLOORS: { id: Floor; label: string }[] = [
  { id: "ground", label: "Ground" },
  { id: "1st", label: "1st" },
  { id: "2nd", label: "2nd" },
  { id: "3rd", label: "3rd" },
  { id: "basement", label: "Basement" },
];

export type PreferredLanguage = "english" | "swahili";

export type MobileMoneyProvider = "mpesa" | "airtel" | "mixx" | "tigopesa";

export const MOBILE_MONEY_PROVIDERS: {
  id: MobileMoneyProvider;
  label: string;
  prefixes: string[];
}[] = [
  { id: "mpesa", label: "M-Pesa", prefixes: ["074", "075", "076", "077", "078", "079"] },
  { id: "airtel", label: "Airtel Money", prefixes: ["068", "069", "078"] },
  { id: "mixx", label: "Mixx by Yas", prefixes: ["065", "067", "071"] },
  { id: "tigopesa", label: "Tigopesa", prefixes: ["065", "067", "071"] },
];

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

export type SellerApplicationStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "rejected"
  | "suspended";

export type OnboardingDraft = {
  currentStep: number;
  step1: {
    shopName: string;
    categories: ShopCategory[];
    profilePhoto: string | null;
    description: string;
  };
  step2: {
    street: string;
    stallNumber: string;
    floor: Floor | "";
    blockName: string;
    landmark: string;
    /** GPS pin captured at the stall — buyers see this after they pay. */
    lat: number | null;
    lng: number | null;
    accuracyMeters: number | null;
    capturedAt: string | null;
    locationSource: "gps" | "kariakoo_fallback" | "";
  };
  step3: {
    primaryPhone: string;
    whatsappSame: boolean;
    whatsappPhone: string;
    language: PreferredLanguage;
  };
  step4: {
    legalName: string;
    nidaNumber: string;
    idFront: string | null;
    idBack: string | null;
    selfieWithId: string | null;
  };
  step5: {
    provider: MobileMoneyProvider | "";
    mobileMoneyNumber: string;
    accountName: string;
  };
  step6: {
    openDays: DayOfWeek[];
    openingTime: string;
    closingTime: string;
    closedOnHolidays: boolean;
  };
  submittedAt: string | null;
  updatedAt: string;
};

export type SellerProfile = OnboardingDraft & {
  status: SellerApplicationStatus;
  rejectionReason?: string;
  shopId: string;
  viewsToday: number;
  viewsThisWeek: number;
};

export type ProductCondition =
  | "new"
  | "used_good"
  | "used_fair"
  | "refurbished";

export const PRODUCT_CONDITIONS: { id: ProductCondition; label: string }[] = [
  { id: "new", label: "New" },
  { id: "used_good", label: "Used — Good" },
  { id: "used_fair", label: "Used — Fair" },
  { id: "refurbished", label: "Refurbished" },
];

export type SellerProduct = {
  id: string;
  name: string;
  category: ShopCategory;
  condition: ProductCondition;
  /** CDN URLs only — never raw camera uploads */
  photos: string[];
  coverPhoto?: string;
  priceTzs: number;
  negotiable: boolean;
  stock: number;
  variants: string[];
  description: string;
  skuCode: string;
  createdAt: string;
  updatedAt: string;
  /** True after POST /listings succeeds — buyers can see it on dnols.com */
  liveOnDnols?: boolean;
};

export type SellerSession = {
  phone: string;
  signedInAt: string;
};
