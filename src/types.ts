export type Category = "fashion" | "electronics";
export type Sort = "nearest" | "price_asc" | "price_desc" | "newest";

export type PublicListing = {
  id: string;
  title: string;
  priceTzs: number;
  category: Category;
  photoUrl: string;
  distanceMeters: number;
  inStock: boolean;
};

export type DirectionsPayload = {
  shopName: string;
  lat: number;
  lng: number;
  streetAddress: string;
  mapsHint: string;
};

export type PublicListingDetail = PublicListing & {
  description: string;
  sizes?: string[];
  brand?: string;
  /** True only after escrow payment — then directions may be present. */
  paid: boolean;
  directions?: DirectionsPayload;
};

export type ListingFilters = {
  category?: Category | "";
  maxDistance?: number | "";
  sort?: Sort;
  inStock?: boolean;
  minPrice?: number | "";
  maxPrice?: number | "";
  q?: string;
};

export type EscrowStatus =
  | "reserved"
  | "paid_held"
  | "handed_over"
  | "rejected_refund";

export type Order = {
  id: string;
  listingIds: string[];
  status: EscrowStatus;
  pickupCode?: string;
  handoverPin?: string;
  totalTzs: number;
  createdAt: string;
  paidAt: string | null;
  accessToken?: string;
  directions?: DirectionsPayload[];
  payMethod?: string;
  payPhone?: string;
  /** Number Dnols uses to reach the buyer for delivery. */
  deliveryPhone?: string;
  /** How the buyer receives the order. */
  fulfillment?: "pickup" | "delivery";
  /** Street / area for delivery to the buyer. */
  deliveryAddress?: string;
  shopIds?: string[];
  deliveryStatus?:
    | "unassigned"
    | "assigned"
    | "picked_up"
    | "delivered";
  riderName?: string | null;
  riderId?: string | null;
  callStatus?: "idle" | "calling" | "in_call" | "ended";
  callInitiatedBy?: string | null;
};

export type CartLine = {
  listing: PublicListing;
  qty: number;
};
