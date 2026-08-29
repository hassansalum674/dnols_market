export const PLACE_ID = "place_kariakoo_dsm";

export type Category = "fashion" | "electronics";
export type Sort = "nearest" | "price_asc" | "price_desc" | "newest";
export type EscrowStatus =
  | "reserved"
  | "paid_held"
  | "handed_over"
  | "rejected_refund";

export type Shop = {
  id: string;
  shopName: string;
  lat: number;
  lng: number;
  streetAddress: string;
  placeId: string;
};

export type Listing = {
  id: string;
  shopId: string;
  title: string;
  priceTzs: number;
  category: Category;
  photoUrl: string;
  inStock: boolean;
  description: string;
  sizes?: string[];
  brand?: string;
  createdAt: string;
  trendingScore: number;
};

/** Public list item: never includes lat/lng/address/shopName. */
export type PublicListing = {
  id: string;
  title: string;
  priceTzs: number;
  category: Category;
  photoUrl: string;
  distanceMeters: number;
  inStock: boolean;
};

export type PublicListingDetail = PublicListing & {
  description: string;
  sizes?: string[];
  brand?: string;
};

export type DirectionsPayload = {
  shopName: string;
  lat: number;
  lng: number;
  streetAddress: string;
  mapsHint: string;
};

export type CartItem = {
  listingId: string;
  qty: number;
};

export type Order = {
  id: string;
  listingIds: string[];
  shopIds: string[];
  status: EscrowStatus;
  pickupCode: string;
  handoverPin: string;
  accessToken: string;
  totalTzs: number;
  createdAt: string;
  paidAt: string | null;
  handedOverAt: string | null;
};
