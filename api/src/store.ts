import { listings as seedListings, shops as seedShops } from "./seed.js";
import type {
  CartItem,
  EscrowStatus,
  Listing,
  Order,
  Shop,
} from "./types.js";

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function pickupCode6(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return code;
}

function token(): string {
  return `tok_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export class Store {
  readonly shops: Map<string, Shop> = new Map(seedShops.map((s) => [s.id, s]));
  readonly listings: Map<string, Listing> = new Map(
    seedListings.map((l) => [l.id, l]),
  );
  readonly carts: Map<string, CartItem[]> = new Map();
  readonly orders: Map<string, Order> = new Map();
  /** accessToken -> orderId (paid orders only) */
  readonly tokens: Map<string, string> = new Map();
  onDirty?: () => void;

  private touch(): void {
    this.onDirty?.();
  }

  snapshot(): { shops: Shop[]; listings: Listing[]; orders: Order[] } {
    return {
      shops: [...this.shops.values()],
      listings: [...this.listings.values()],
      orders: [...this.orders.values()],
    };
  }

  replaceAll(data: {
    shops: Shop[];
    listings: Listing[];
    orders: Order[];
  }): void {
    this.shops.clear();
    this.listings.clear();
    this.orders.clear();
    this.tokens.clear();
    this.carts.clear();
    for (const shop of data.shops) this.shops.set(shop.id, shop);
    for (const listing of data.listings) this.listings.set(listing.id, listing);
    for (const order of data.orders) {
      this.orders.set(order.id, order);
      if (this.isPaid(order.status) && order.accessToken) {
        this.tokens.set(order.accessToken, order.id);
      }
    }
  }

  allListings(): Listing[] {
    return [...this.listings.values()];
  }

  shop(id: string): Shop | undefined {
    return this.shops.get(id);
  }

  listing(id: string): Listing | undefined {
    return this.listings.get(id);
  }

  upsertShop(input: {
    id?: string;
    shopName: string;
    lat: number;
    lng: number;
    streetAddress: string;
    stallNumber?: string;
    floor?: string;
    landmark?: string;
    locationCapturedAt?: string;
    placeId?: string;
  }): Shop {
    const shopId =
      input.id && input.id.trim() ? input.id.trim() : id("shop");
    const prev = this.shops.get(shopId);
    const shop: Shop = {
      id: shopId,
      shopName: input.shopName,
      lat: input.lat,
      lng: input.lng,
      streetAddress: input.streetAddress,
      placeId: input.placeId ?? prev?.placeId ?? "place_kariakoo_dsm",
      stallNumber: input.stallNumber ?? prev?.stallNumber,
      floor: input.floor ?? prev?.floor,
      landmark: input.landmark ?? prev?.landmark,
      locationCapturedAt:
        input.locationCapturedAt ?? prev?.locationCapturedAt,
    };
    this.shops.set(shopId, shop);
    this.touch();
    return shop;
  }

  upsertListing(input: {
    id?: string;
    shopId: string;
    title: string;
    priceTzs: number;
    category: Listing["category"];
    photoUrl: string;
    inStock: boolean;
    description: string;
    sizes?: string[];
    brand?: string;
  }): Listing {
    const listingId =
      input.id && input.id.trim() ? input.id.trim() : id("lst");
    const prev = this.listings.get(listingId);
    const listing: Listing = {
      id: listingId,
      shopId: input.shopId,
      title: input.title,
      priceTzs: input.priceTzs,
      category: input.category,
      photoUrl: input.photoUrl,
      inStock: input.inStock,
      description: input.description,
      sizes: input.sizes ?? prev?.sizes,
      brand: input.brand ?? prev?.brand,
      createdAt: prev?.createdAt ?? new Date().toISOString(),
      trendingScore: prev?.trendingScore ?? 50,
    };
    this.listings.set(listingId, listing);
    this.touch();
    return listing;
  }

  getCart(sessionId: string): CartItem[] {
    return this.carts.get(sessionId) ?? [];
  }

  addToCart(sessionId: string, listingId: string, qty: number): CartItem[] {
    const items = [...this.getCart(sessionId)];
    const i = items.findIndex((x) => x.listingId === listingId);
    if (i >= 0) items[i] = { listingId, qty: items[i].qty + qty };
    else items.push({ listingId, qty });
    this.carts.set(sessionId, items);
    return items;
  }

  createPaidOrder(
    listingIds: string[],
    opts?: { payMethod?: string; payPhone?: string; deliveryPhone?: string },
  ): Order {
    const unique = [...new Set(listingIds)];
    const shopIds = [
      ...new Set(
        unique.map((lid) => {
          const l = this.listings.get(lid);
          if (!l) throw new Error(`unknown_listing:${lid}`);
          return l.shopId;
        }),
      ),
    ];
    const totalTzs = unique.reduce((sum, lid) => {
      const l = this.listings.get(lid)!;
      return sum + l.priceTzs;
    }, 0);

    const now = new Date().toISOString();
    const order: Order = {
      id: id("ord"),
      listingIds: unique,
      shopIds,
      status: "paid_held",
      pickupCode: pickupCode6(),
      handoverPin: pickupCode6(),
      accessToken: token(),
      totalTzs,
      createdAt: now,
      paidAt: now,
      handedOverAt: null,
      payMethod:
        opts?.payMethod === "mpesa" ||
        opts?.payMethod === "tigo" ||
        opts?.payMethod === "airtel"
          ? opts.payMethod
          : undefined,
      payPhone: opts?.payPhone,
      deliveryPhone: opts?.deliveryPhone ?? opts?.payPhone,
    };
    this.orders.set(order.id, order);
    this.tokens.set(order.accessToken, order.id);
    this.touch();
    return order;
  }

  /** Unpaid stub so GET /orders/:id can demonstrate hidden coords. */
  createReservedOrder(listingIds: string[]): Order {
    const unique = [...new Set(listingIds)];
    unique.forEach((lid) => {
      if (!this.listings.get(lid)) throw new Error(`unknown_listing:${lid}`);
    });
    const shopIds = [
      ...new Set(unique.map((lid) => this.listings.get(lid)!.shopId)),
    ];
    const totalTzs = unique.reduce(
      (sum, lid) => sum + this.listings.get(lid)!.priceTzs,
      0,
    );
    const now = new Date().toISOString();
    const order: Order = {
      id: id("ord"),
      listingIds: unique,
      shopIds,
      status: "reserved",
      pickupCode: pickupCode6(),
      handoverPin: pickupCode6(),
      accessToken: token(),
      totalTzs,
      createdAt: now,
      paidAt: null,
      handedOverAt: null,
    };
    this.orders.set(order.id, order);
    this.touch();
    return order;
  }

  order(id: string): Order | undefined {
    return this.orders.get(id);
  }

  orderByToken(tok: string): Order | undefined {
    const oid = this.tokens.get(tok);
    return oid ? this.orders.get(oid) : undefined;
  }

  tokenUnlocksListing(tok: string, listingId: string): boolean {
    const order = this.orderByToken(tok);
    if (!order) return false;
    if (order.status !== "paid_held" && order.status !== "handed_over") {
      return false;
    }
    return order.listingIds.includes(listingId);
  }

  handover(orderId: string, pin: string): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("not_found");
    if (order.status !== "paid_held") throw new Error("bad_state");
    if (pin !== order.handoverPin && pin !== order.pickupCode) {
      throw new Error("bad_pin");
    }
    order.status = "handed_over";
    order.handedOverAt = new Date().toISOString();
    this.touch();
    return order;
  }

  rejectRefund(orderId: string): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("not_found");
    if (order.status !== "paid_held" && order.status !== "reserved") {
      throw new Error("bad_state");
    }
    order.status = "rejected_refund";
    this.touch();
    return order;
  }

  ordersForShop(shopId: string): Order[] {
    return [...this.orders.values()]
      .filter((o) => o.shopIds.includes(shopId))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  ordersForPhone(phone: string): Order[] {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return [];
    return [...this.orders.values()]
      .filter((o) => {
        const pay = (o.payPhone ?? "").replace(/\D/g, "");
        const delivery = (o.deliveryPhone ?? "").replace(/\D/g, "");
        return pay === digits || delivery === digits;
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  isPaid(status: EscrowStatus): boolean {
    return status === "paid_held" || status === "handed_over";
  }
}

export const store = new Store();
