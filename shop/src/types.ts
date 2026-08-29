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
