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

  allListings(): Listing[] {
    return [...this.listings.values()];
  }

  shop(id: string): Shop | undefined {
    return this.shops.get(id);
  }

  listing(id: string): Listing | undefined {
    return this.listings.get(id);
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
    return order;
  }

  rejectRefund(orderId: string): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("not_found");
    if (order.status !== "paid_held" && order.status !== "reserved") {
      throw new Error("bad_state");
    }
    order.status = "rejected_refund";
    return order;
  }

  isPaid(status: EscrowStatus): boolean {
    return status === "paid_held" || status === "handed_over";
  }
}

export const store = new Store();
