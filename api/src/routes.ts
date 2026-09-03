import type { FastifyInstance } from "fastify";
import { PLACE_ID, type Category, type Sort } from "./types.js";
import { store } from "./store.js";
import { registerCallRoutes } from "./call.js";
import { sendRiderInviteSms, verifyFirebaseBearer, claimRiderPhone, inviteRiderForSeller, listSellerRiders, bearerToken, riderFirestoreHint, ridersUseAdmin } from "./riders.js";
import { firestoreAdminError, firestoreProjectId, firestoreWriteProbe } from "./firestoreAdmin.js";
import {
  distanceToShop,
  toDirections,
  toPublicDetail,
  toPublicListing,
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

export function registerRoutes(
  app: FastifyInstance,
  defaults: { buyerLat: number; buyerLng: number },
): void {
  app.get("/health", async () => {
    const probe = firestoreWriteProbe();
    const agoraAppId = process.env.AGORA_APP_ID?.trim();
    const agoraCertificate = process.env.AGORA_APP_CERTIFICATE?.trim();
    return {
      ok: true,
      service: "dnols-api",
      place: PLACE_ID,
      firestoreAdmin: ridersUseAdmin(),
      firestoreAdminError: ridersUseAdmin() ? null : firestoreAdminError(),
      firestoreProjectId: firestoreProjectId(),
      firestoreWriteOk: probe.ok,
      firestoreWriteError: probe.error,
      agoraConfigured: Boolean(agoraAppId && agoraCertificate),
      ts: new Date().toISOString(),
    };
  });

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
    const placeId = q.placeId;
    if (placeId && placeId !== PLACE_ID) {
      return reply.code(400).send({
        error: "unknown_place",
        message: `Use placeId=${PLACE_ID} (Kariakoo).`,
      });
    }
    if (q.category && !CATEGORIES.has(q.category as Category)) {
      return reply.code(400).send({
        error: "bad_category",
        message: "category must be fashion|electronics",
      });
    }
    const sort = (q.sort as Sort | undefined) ?? "nearest";
    if (!SORTS.has(sort)) {
      return reply.code(400).send({
        error: "bad_sort",
        message: "sort must be nearest|price_asc|price_desc|newest",
      });
    }

    const buyerLat = num(q.buyerLat) ?? defaults.buyerLat;
    const buyerLng = num(q.buyerLng) ?? defaults.buyerLng;
    const search = (q.q ?? "").trim().toLowerCase();
    const category = q.category as Category | undefined;
    const maxDistanceMeters = num(q.maxDistanceMeters);
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

    return {
      placeId: PLACE_ID,
      count: rows.length,
      items: rows.map((l) => toPublicListing(l, buyerLat, buyerLng)),
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

    const paidFlag = q.paid === "1" || q.paid === "true";
    const tok = q.token ?? q.accessToken;
    const unlocked =
      paidFlag && typeof tok === "string" && store.tokenUnlocksListing(tok, id);

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
      fulfillment?: string;
      deliveryAddress?: string;
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
    const fulfillment =
      body.fulfillment === "pickup" ? "pickup" : "delivery";
    const deliveryRaw = String(body.deliveryPhone ?? body.phone ?? "").trim();
    const deliveryNormalized = normalizeTzPhone(deliveryRaw);
    if (!deliveryNormalized) {
      return reply.code(400).send({
        error: "bad_delivery_phone",
        message:
          fulfillment === "pickup"
            ? "Enter a valid contact number (+255 6XX or 7XX)."
            : "Enter a valid delivery contact number (+255 6XX or 7XX).",
      });
    }
    const deliveryAddress = String(body.deliveryAddress ?? "").trim();
    if (fulfillment === "delivery" && deliveryAddress.length < 4) {
      return reply.code(400).send({
        error: "bad_delivery_address",
        message: "Enter the area or street where we should deliver.",
      });
    }
    try {
      const order = store.createPaidOrder(listingIds, {
        payMethod,
        payPhone: normalized,
        deliveryPhone: deliveryNormalized,
        fulfillment,
        deliveryAddress: fulfillment === "delivery" ? deliveryAddress : undefined,
      });
      const directions = order.shopIds.map((sid) =>
        toDirections(store.shop(sid)!, fulfillment),
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
        shopIds: order.shopIds,
        deliveryPhone: order.deliveryPhone,
        fulfillment: order.fulfillment,
        deliveryAddress: order.deliveryAddress,
        sellerNotification: {
          status: "queued",
          note:
            fulfillment === "pickup"
              ? "Dnols notified the seller. Bring your pickup code to the stall."
              : "Dnols notified the seller. Your delivery number was shared with the seller through Dnols only — not for direct personal contact.",
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
      fulfillment: order.fulfillment,
      deliveryAddress: order.deliveryAddress,
      deliveryPhone: order.deliveryPhone,
      directions: order.shopIds.map((sid) =>
        toDirections(store.shop(sid)!, order.fulfillment),
      ),
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

  app.get("/riders/mine", async (req, reply) => {
    const token = bearerToken(req.headers.authorization);
    if (!token) {
      return reply.code(401).send({
        error: "auth_required",
        message: "Sign in to view riders.",
      });
    }
    const caller = await verifyFirebaseBearer(req.headers.authorization);
    if (!caller) {
      return reply.code(401).send({
        error: "auth_required",
        message: "Sign in to view riders.",
      });
    }
    const result = await listSellerRiders(token, caller.uid);
    if (!result.ok) {
      const code = result.error === "permission_denied" ? 403 : 503;
      return reply.code(code).send({
        error: result.error,
        message: riderFirestoreHint(result.error, result.detail),
      });
    }
    return { ok: true, riders: result.riders };
  });

  app.post("/riders/invite", async (req, reply) => {
    const token = bearerToken(req.headers.authorization);
    if (!token) {
      return reply.code(401).send({
        error: "auth_required",
        message: "Sign in to invite a rider.",
      });
    }
    const caller = await verifyFirebaseBearer(req.headers.authorization);
    if (!caller) {
      return reply.code(401).send({
        error: "auth_required",
        message: "Sign in to invite a rider.",
      });
    }
    const body = (req.body ?? {}) as { phone?: string; name?: string };
    const phone = String(body.phone ?? "");
    const name = String(body.name ?? "");
    try {
      const saved = await inviteRiderForSeller(token, caller.uid, phone, name);
      if (!saved.ok) {
        const code = saved.error === "permission_denied" ? 403 : 503;
        return reply.code(code).send({
          error: saved.error,
          message: riderFirestoreHint(saved.error, saved.detail),
        });
      }
      const sms = await sendRiderInviteSms(phone);
      return {
        ok: true,
        sellerId: caller.uid,
        rider: saved.rider,
        sms: sms.sent ? "sent" : sms.skipped ?? "skipped",
        downloadUrl: "https://rider.dnols.com",
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "invite_failed";
      return reply.code(422).send({ error: "invite_failed", message });
    }
  });

  app.post("/riders/claim", async (req, reply) => {
    const token = bearerToken(req.headers.authorization);
    if (!token) {
      return reply.code(401).send({
        error: "auth_required",
        message: "Sign in to link your rider number.",
      });
    }
    const caller = await verifyFirebaseBearer(req.headers.authorization);
    if (!caller) {
      return reply.code(401).send({
        error: "auth_required",
        message: "Sign in to link your rider number.",
      });
    }
    const body = (req.body ?? {}) as { phone?: string };
    try {
      const result = await claimRiderPhone(token, caller.uid, String(body.phone ?? ""));
      if (!result.ok) {
        const code =
          result.error === "not_linked"
            ? 404
            : result.error === "rider_taken"
              ? 409
              : result.error === "permission_denied"
                ? 403
                : 503;
        const hint =
          result.error === "permission_denied" ||
          result.error === "firestore_unavailable"
            ? riderFirestoreHint(result.error, result.detail)
            : undefined;
        return reply.code(code).send({
          error: result.error,
          ...(hint ? { message: hint } : {}),
        });
      }
      return { ok: true, rider: result.rider };
    } catch (e) {
      const message = e instanceof Error ? e.message : "claim_failed";
      return reply.code(422).send({ error: "claim_failed", message });
    }
  });

  registerCallRoutes(app);
}
