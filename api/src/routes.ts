import type { FastifyInstance } from "fastify";
import { PLACE_ID, type Category, type Listing, type Sort } from "./types.js";
import { store } from "./store.js";
import {
  distanceToShop,
  toBuyerOrder,
  toDirections,
  toPublicDetail,
  toPublicListing,
  toSellerOrder,
} from "./serialize.js";

const CATEGORIES = new Set<Category>(["fashion", "electronics"]);
const SORTS = new Set<Sort>(["nearest", "price_asc", "price_desc", "newest"]);

function parseBool(v: unknown): boolean | undefined {
  if (v === undefined || v === "") return undefined;
  if (v === true || v === "true" || v === "1") return true;
  if (v === false || v === "false" || v === "0") return false;
  return undefined;
}

function num(v: unknown): number | undefined {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeTzPhone(raw: string): string | null {
  const phoneDigits = raw.replace(/\D/g, "");
  const normalized =
    phoneDigits.startsWith("255")
      ? `+${phoneDigits}`
      : phoneDigits.startsWith("0")
        ? `+255${phoneDigits.slice(1)}`
        : phoneDigits.length === 9
          ? `+255${phoneDigits}`
          : raw.trim();
  const phoneCheck = normalized.replace(/\D/g, "");
  if (!/^255[67]\d{8}$/.test(phoneCheck)) return null;
  return normalized;
}

function sessionId(req: { headers: Record<string, unknown> }): string {
  const h = req.headers["x-session-id"] ?? req.headers["x-cart-id"];
  return typeof h === "string" && h.trim() ? h.trim() : "anon";
}

function queryListings(
  q: Record<string, string | undefined>,
  defaults: { buyerLat: number; buyerLng: number },
):
  | { error: { code: number; body: Record<string, string> } }
  | {
      rows: Listing[];
      buyerLat: number;
      buyerLng: number;
      placeId: string;
    } {
  const placeId = q.placeId;
  if (placeId && placeId !== PLACE_ID) {
    return {
      error: {
        code: 400,
        body: {
          error: "unknown_place",
          message: `Use placeId=${PLACE_ID} (Kariakoo).`,
        },
      },
    };
  }
  if (q.category && !CATEGORIES.has(q.category as Category)) {
    return {
      error: {
        code: 400,
        body: {
          error: "bad_category",
          message: "category must be fashion|electronics",
        },
      },
    };
  }
  const sort = (q.sort as Sort | undefined) ?? "nearest";
  if (!SORTS.has(sort)) {
    return {
      error: {
        code: 400,
        body: {
          error: "bad_sort",
          message: "sort must be nearest|price_asc|price_desc|newest",
        },
      },
    };
  }

  const buyerLat = num(q.buyerLat) ?? defaults.buyerLat;
  const buyerLng = num(q.buyerLng) ?? defaults.buyerLng;
  const search = (q.q ?? "").trim().toLowerCase();
  const category = q.category as Category | undefined;
  const maxDistanceMeters = num(q.maxDistanceMeters) ?? num(q.maxDistance);
  const minPrice = num(q.minPrice);
  const maxPrice = num(q.maxPrice);
  const inStock = parseBool(q.inStock);

  let rows = store.allListings();
  if (category) rows = rows.filter((l) => l.category === category);
  if (search) {
    rows = rows.filter(
      (l) =>
        l.title.toLowerCase().includes(search) ||
        l.description.toLowerCase().includes(search) ||
        (l.brand ?? "").toLowerCase().includes(search),
    );
  }
  if (inStock !== undefined) {
    rows = rows.filter((l) => l.inStock === inStock);
  }
  if (minPrice !== undefined) {
    rows = rows.filter((l) => l.priceTzs >= minPrice);
  }
  if (maxPrice !== undefined) {
    rows = rows.filter((l) => l.priceTzs <= maxPrice);
  }
  if (maxDistanceMeters !== undefined) {
    rows = rows.filter((l) => {
      const shop = store.shop(l.shopId)!;
      return distanceToShop(shop, buyerLat, buyerLng) <= maxDistanceMeters;
    });
  }

  rows.sort((a, b) => {
    if (sort === "price_asc") return a.priceTzs - b.priceTzs;
    if (sort === "price_desc") return b.priceTzs - a.priceTzs;
    if (sort === "newest") {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
    const da = distanceToShop(store.shop(a.shopId)!, buyerLat, buyerLng);
    const db = distanceToShop(store.shop(b.shopId)!, buyerLat, buyerLng);
    return da - db;
  });

  return { rows, buyerLat, buyerLng, placeId: PLACE_ID };
}

type ListingBody = {
  id?: string;
  shopId?: string;
  title?: string;
  priceTzs?: number;
  category?: string;
  photoUrl?: string;
  inStock?: boolean;
  description?: string;
  sizes?: string[];
  brand?: string;
};

function upsertListingFromBody(body: ListingBody, existingShopId?: string) {
  const shopId = String(body.shopId ?? existingShopId ?? "").trim();
  if (!shopId || !store.shop(shopId)) {
    return {
      ok: false as const,
      error: {
        code: 400,
        body: {
          error: "unknown_shop",
          message: "Register the shop location before listing products.",
        },
      },
    };
  }
  const title = String(body.title ?? "").trim();
  const photoUrl = String(body.photoUrl ?? "").trim();
  const priceTzs = num(body.priceTzs);
  if (!title || !photoUrl || priceTzs === undefined || priceTzs < 0) {
    return {
      ok: false as const,
      error: {
        code: 400,
        body: {
          error: "bad_body",
          message: "title, photoUrl, and priceTzs are required.",
        },
      },
    };
  }
  if (body.category && !CATEGORIES.has(body.category as Category)) {
    return {
      ok: false as const,
      error: {
        code: 400,
        body: {
          error: "bad_category",
          message: "category must be fashion|electronics",
        },
      },
    };
  }
  const listing = store.upsertListing({
    id: body.id,
    shopId,
    title,
    priceTzs,
    category: (body.category as Category) ?? "fashion",
    photoUrl,
    inStock: body.inStock !== false,
    description: String(body.description ?? "").trim(),
    sizes: Array.isArray(body.sizes) ? body.sizes : undefined,
    brand: body.brand,
  });
  return { ok: true as const, listing };
}

export function registerRoutes(
  app: FastifyInstance,
  defaults: { buyerLat: number; buyerLng: number },
): void {
  app.get("/health", async () => ({
    ok: true,
    service: "dnols-api",
    place: PLACE_ID,
    ts: new Date().toISOString(),
  }));

  app.get("/places", async () => ({
    places: [
      {
        placeId: PLACE_ID,
        name: "Kariakoo",
        city: "Dar es Salaam",
        country: "TZ",
        hint: "Shop-only cluster. Exact stall coordinates are withheld until payment.",
      },
    ],
  }));

  app.get("/listings", async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const result = queryListings(q, defaults);
    if ("error" in result) {
      return reply.code(result.error.code).send(result.error.body);
    }
    return {
      placeId: result.placeId,
      count: result.rows.length,
      items: result.rows.map((l) =>
        toPublicListing(l, result.buyerLat, result.buyerLng),
      ),
    };
  });

  app.get("/search", async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const search = (q.q ?? "").trim();
    if (search.length < 1) {
      return { items: [] };
    }
    const result = queryListings({ ...q, q: search }, defaults);
    if ("error" in result) {
      return reply.code(result.error.code).send(result.error.body);
    }
    return {
      items: result.rows
        .slice(0, 8)
        .map((l) => toPublicListing(l, result.buyerLat, result.buyerLng)),
    };
  });

  app.post("/shops", async (req, reply) => {
    const body = (req.body ?? {}) as {
      id?: string;
      shopName?: string;
      lat?: number;
      lng?: number;
      streetAddress?: string;
      stallNumber?: string;
      floor?: string;
      landmark?: string;
      locationCapturedAt?: string;
      placeId?: string;
    };
    const shopName = String(body.shopName ?? "").trim();
    const streetAddress = String(body.streetAddress ?? "").trim();
    const lat = num(body.lat);
    const lng = num(body.lng);
    if (!shopName) {
      return reply.code(400).send({
        error: "bad_body",
        message: "shopName is required.",
      });
    }
    if (lat === undefined || lng === undefined) {
      return reply.code(400).send({
        error: "bad_body",
        message: "lat and lng are required so buyers can find the stall.",
      });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return reply.code(400).send({ error: "bad_coords" });
    }
    if (!streetAddress) {
      return reply.code(400).send({
        error: "bad_body",
        message: "streetAddress is required.",
      });
    }
    const shop = store.upsertShop({
      id: body.id,
      shopName,
      lat,
      lng,
      streetAddress,
      stallNumber: body.stallNumber,
      floor: body.floor,
      landmark: body.landmark,
      locationCapturedAt: body.locationCapturedAt,
      placeId: body.placeId,
    });
    return {
      shopId: shop.id,
      shopName: shop.shopName,
      lat: shop.lat,
      lng: shop.lng,
      streetAddress: shop.streetAddress,
      placeId: shop.placeId,
    };
  });

  app.patch("/shops/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = store.shop(id);
    if (!existing) return reply.code(404).send({ error: "not_found" });
    const body = (req.body ?? {}) as {
      shopName?: string;
      lat?: number;
      lng?: number;
      streetAddress?: string;
      stallNumber?: string;
      floor?: string;
      landmark?: string;
      locationCapturedAt?: string;
    };
    const lat = num(body.lat) ?? existing.lat;
    const lng = num(body.lng) ?? existing.lng;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return reply.code(400).send({ error: "bad_coords" });
    }
    const shop = store.upsertShop({
      id,
      shopName: String(body.shopName ?? existing.shopName).trim() || existing.shopName,
      lat,
      lng,
      streetAddress:
        String(body.streetAddress ?? existing.streetAddress).trim() ||
        existing.streetAddress,
      stallNumber: body.stallNumber ?? existing.stallNumber,
      floor: body.floor ?? existing.floor,
      landmark: body.landmark ?? existing.landmark,
      locationCapturedAt:
        body.locationCapturedAt ?? existing.locationCapturedAt,
    });
    return {
      shopId: shop.id,
      shopName: shop.shopName,
      lat: shop.lat,
      lng: shop.lng,
      streetAddress: shop.streetAddress,
      placeId: shop.placeId,
    };
  });

  app.post("/listings", async (req, reply) => {
    const result = upsertListingFromBody((req.body ?? {}) as ListingBody);
    if (!result.ok) {
      return reply.code(result.error.code).send(result.error.body);
    }
    const listing = result.listing;
    return {
      id: listing.id,
      shopId: listing.shopId,
      title: listing.title,
      inStock: listing.inStock,
    };
  });

  app.patch("/listings/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = store.listing(id);
    if (!existing) return reply.code(404).send({ error: "not_found" });
    const body = (req.body ?? {}) as ListingBody;
    const result = upsertListingFromBody(
      {
        id,
        shopId: body.shopId ?? existing.shopId,
        title: body.title ?? existing.title,
        photoUrl: body.photoUrl ?? existing.photoUrl,
        priceTzs: body.priceTzs ?? existing.priceTzs,
        category: body.category ?? existing.category,
        inStock: body.inStock ?? existing.inStock,
        description: body.description ?? existing.description,
        sizes: body.sizes ?? existing.sizes,
        brand: body.brand ?? existing.brand,
      },
      existing.shopId,
    );
    if (!result.ok) {
      return reply.code(result.error.code).send(result.error.body);
    }
    const listing = result.listing;
    return {
      id: listing.id,
      shopId: listing.shopId,
      title: listing.title,
      inStock: listing.inStock,
    };
  });

  app.get("/listings/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const q = req.query as Record<string, string | undefined>;
    const listing = store.listing(id);
    if (!listing) {
      return reply.code(404).send({ error: "not_found" });
    }
    const buyerLat = num(q.buyerLat) ?? defaults.buyerLat;
    const buyerLng = num(q.buyerLng) ?? defaults.buyerLng;
    const body: Record<string, unknown> = toPublicDetail(
      listing,
      buyerLat,
      buyerLng,
    );

    const tok = q.token ?? q.accessToken;
    const unlocked =
      typeof tok === "string" && store.tokenUnlocksListing(tok, id);

    if (unlocked) {
      const shop = store.shop(listing.shopId)!;
      body.locationUnlocked = true;
      body.directions = toDirections(shop);
    } else {
      body.locationUnlocked = false;
      body.locationHint =
        "Exact shop name, street, and coordinates are released only after POST /orders/pay (or paid=1 with a valid access token).";
    }

    return body;
  });

  app.get("/cart", async (req) => {
    const sid = sessionId(req);
    const items = store.getCart(sid);
    return { sessionId: sid, items };
  });

  app.post("/cart", async (req, reply) => {
    const sid = sessionId(req);
    const body = (req.body ?? {}) as {
      listingId?: string;
      qty?: number;
      items?: { listingId: string; qty?: number }[];
    };

    const additions: { listingId: string; qty: number }[] = [];
    if (body.listingId) {
      additions.push({ listingId: body.listingId, qty: body.qty ?? 1 });
    }
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        if (it?.listingId) {
          additions.push({ listingId: it.listingId, qty: it.qty ?? 1 });
        }
      }
    }
    if (additions.length === 0) {
      return reply.code(400).send({
        error: "bad_body",
        message: "Provide listingId (and optional qty) or items[].",
      });
    }

    for (const it of additions) {
      if (!store.listing(it.listingId)) {
        return reply.code(400).send({
          error: "unknown_listing",
          listingId: it.listingId,
        });
      }
      if (!Number.isFinite(it.qty) || it.qty < 1) {
        return reply.code(400).send({ error: "bad_qty" });
      }
      store.addToCart(sid, it.listingId, Math.floor(it.qty));
    }

    return { sessionId: sid, items: store.getCart(sid) };
  });

  app.post("/orders/pay", async (req, reply) => {
    const body = (req.body ?? {}) as {
      listingIds?: string[];
      payMethod?: string;
      phone?: string;
      deliveryPhone?: string;
    };
    const listingIds = body.listingIds;
    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return reply.code(400).send({
        error: "bad_body",
        message: "listingIds must be a non-empty string array.",
      });
    }
    const payMethod = body.payMethod ?? "mpesa";
    if (payMethod !== "mpesa" && payMethod !== "tigo" && payMethod !== "airtel") {
      return reply.code(400).send({
        error: "bad_pay_method",
        message: "payMethod must be mpesa, tigo, or airtel.",
      });
    }
    const phoneRaw = String(body.phone ?? "").trim();
    const normalized = normalizeTzPhone(phoneRaw);
    if (!normalized) {
      return reply.code(400).send({
        error: "bad_phone",
        message: "Enter a valid Tanzania mobile money number (+255 6XX or 7XX).",
      });
    }
    const deliveryRaw = String(body.deliveryPhone ?? body.phone ?? "").trim();
    const deliveryNormalized = normalizeTzPhone(deliveryRaw);
    if (!deliveryNormalized) {
      return reply.code(400).send({
        error: "bad_delivery_phone",
        message:
          "Enter a valid delivery contact number (+255 6XX or 7XX).",
      });
    }
    try {
      const order = store.createPaidOrder(listingIds, {
        payMethod,
        payPhone: normalized,
        deliveryPhone: deliveryNormalized,
      });
      const directions = order.shopIds.map((sid) =>
        toDirections(store.shop(sid)!),
      );
      const providerLabel =
        payMethod === "mpesa"
          ? "M-Pesa"
          : payMethod === "tigo"
            ? "Mix by Yas"
            : "Airtel Money";
      return {
        mockPayment: {
          provider: providerLabel,
          phone: normalized,
          status: "success",
          note: `Stub STK push to ${normalized} — always succeeds in dev.`,
        },
        orderId: order.id,
        escrow: order.status,
        pickupCode: order.pickupCode,
        handoverPin: order.handoverPin,
        accessToken: order.accessToken,
        totalTzs: order.totalTzs,
        listingIds: order.listingIds,
        deliveryPhone: order.deliveryPhone,
        sellerNotification: {
          status: "queued",
          note: "Dnols notified the seller. Your delivery number was shared with the seller through Dnols only — not for direct personal contact.",
          deliveryPhone: deliveryNormalized,
        },
        // Seller stall coords for buyer preview only — Dnols handles delivery.
        shops: directions,
        mapsHint:
          directions.length === 1
            ? directions[0].mapsHint
            : "Multiple stalls — see shops[].mapsHint for each pickup.",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.startsWith("unknown_listing:")) {
        return reply.code(400).send({
          error: "unknown_listing",
          listingId: msg.split(":")[1],
        });
      }
      throw e;
    }
  });

  /** Demo helper: create an unpaid (reserved) order to contrast GET /orders/:id. */
  app.post("/orders/reserve", async (req, reply) => {
    const body = (req.body ?? {}) as { listingIds?: string[] };
    if (!Array.isArray(body.listingIds) || body.listingIds.length === 0) {
      return reply.code(400).send({ error: "bad_body" });
    }
    try {
      const order = store.createReservedOrder(body.listingIds);
      return {
        orderId: order.id,
        escrow: order.status,
        pickupCode: order.pickupCode,
        totalTzs: order.totalTzs,
        locationUnlocked: false,
        message: "Pay via POST /orders/pay to receive coordinates.",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.startsWith("unknown_listing:")) {
        return reply.code(400).send({
          error: "unknown_listing",
          listingId: msg.split(":")[1],
        });
      }
      throw e;
    }
  });

  app.get("/orders", async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const shopId = (q.shopId ?? "").trim();
    const phoneRaw = (q.phone ?? "").trim();
    if (shopId) {
      if (!store.shop(shopId)) {
        return reply.code(404).send({ error: "not_found" });
      }
      const orders = store.ordersForShop(shopId).map(toSellerOrder);
      return { shopId, count: orders.length, orders };
    }
    if (phoneRaw) {
      const normalized = normalizeTzPhone(phoneRaw);
      if (!normalized) {
        return reply.code(400).send({
          error: "bad_phone",
          message: "Enter a valid Tanzania mobile number (+255 6XX or 7XX).",
        });
      }
      const orders = store.ordersForPhone(normalized).map(toBuyerOrder);
      return { count: orders.length, orders };
    }
    return { orders: [] };
  });

  app.get("/orders/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = store.order(id);
    if (!order) return reply.code(404).send({ error: "not_found" });

    const paid = store.isPaid(order.status);
    const base = {
      orderId: order.id,
      escrow: order.status,
      listingIds: order.listingIds,
      totalTzs: order.totalTzs,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      handedOverAt: order.handedOverAt,
      locationUnlocked: paid,
    };

    if (!paid) {
      return {
        ...base,
        pickupCode: order.status === "reserved" ? undefined : order.pickupCode,
        locationHint:
          "Coordinates, shop name, and street are hidden until escrow is paid_held.",
      };
    }

    return {
      ...base,
      pickupCode: order.pickupCode,
      handoverPin: order.handoverPin,
      accessToken: order.accessToken,
      directions: order.shopIds.map((sid) => toDirections(store.shop(sid)!)),
    };
  });

  app.post("/orders/:id/handover", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body ?? {}) as {
      pin?: string;
      action?: "confirm" | "reject";
    };
    const action = body.action ?? "confirm";
    try {
      if (action === "reject") {
        const order = store.rejectRefund(id);
        return {
          orderId: order.id,
          escrow: order.status,
          mock: "Escrow released as refund (stub).",
        };
      }
      if (!body.pin) {
        return reply.code(400).send({
          error: "bad_body",
          message: "pin is required (handoverPin or pickupCode).",
        });
      }
      const order = store.handover(id, String(body.pin));
      return {
        orderId: order.id,
        escrow: order.status,
        handedOverAt: order.handedOverAt,
        mock: "Escrow released to seller (stub).",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      if (msg === "not_found") {
        return reply.code(404).send({ error: "not_found" });
      }
      if (msg === "bad_pin") {
        return reply.code(403).send({ error: "bad_pin" });
      }
      if (msg === "bad_state") {
        return reply.code(409).send({
          error: "bad_state",
          message:
            "Escrow must be paid_held to confirm handover (or reserved/paid_held to reject).",
        });
      }
      throw e;
    }
  });

  app.get("/trending", async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const buyerLat = num(q.buyerLat) ?? defaults.buyerLat;
    const buyerLng = num(q.buyerLng) ?? defaults.buyerLng;
    const items = store
      .allListings()
      .filter((l) => l.inStock)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 8)
      .map((l) => ({
        ...toPublicListing(l, buyerLat, buyerLng),
        trendingScore: l.trendingScore,
      }));
    return { placeId: PLACE_ID, items };
  });
}
