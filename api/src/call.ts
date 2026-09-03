import type { FastifyInstance } from "fastify";
import {
  agoraUidFromUserId,
  buildVoiceToken,
  callChannelName,
} from "./agoraToken.js";
import { fetchOrderForCaller } from "./firestoreRest.js";
import { bearerToken, verifyFirebaseBearer } from "./riders.js";

function callerIsParty(
  order: { buyerUid: string; riderAuthUid: string | null },
  uid: string,
): boolean {
  return uid === order.buyerUid || (!!order.riderAuthUid && uid === order.riderAuthUid);
}

function userIdOnOrder(
  order: { buyerUid: string; riderId: string | null; riderAuthUid: string | null },
  userId: string,
): boolean {
  return (
    userId === order.buyerUid ||
    userId === order.riderAuthUid ||
    userId === order.riderId
  );
}

function userIdIsCaller(
  order: { buyerUid: string; riderId: string | null; riderAuthUid: string | null },
  userId: string,
  uid: string,
): boolean {
  if (userId === uid) return true;
  if (userId === order.riderId && order.riderAuthUid === uid) return true;
  if (userId === order.buyerUid && uid === order.buyerUid) return true;
  return false;
}

export function registerCallRoutes(app: FastifyInstance): void {
  app.post("/call/token", async (req, reply) => {
    const idToken = bearerToken(req.headers.authorization);
    const caller = await verifyFirebaseBearer(req.headers.authorization);
    if (!caller || !idToken) {
      return reply.code(401).send({
        error: "auth_required",
        message: "Sign in to start a call.",
      });
    }

    const appId = process.env.AGORA_APP_ID?.trim();
    const appCertificate = process.env.AGORA_APP_CERTIFICATE?.trim();
    if (!appId || !appCertificate) {
      return reply.code(503).send({
        error: "agora_not_configured",
        message: "Voice calling is not configured.",
      });
    }

    const body = (req.body ?? {}) as { orderId?: string; userId?: string };
    const orderId = String(body.orderId ?? "").trim();
    const userId = String(body.userId ?? caller.uid).trim();
    if (!orderId || !userId) {
      return reply.code(400).send({
        error: "bad_body",
        message: "orderId and userId are required.",
      });
    }
    if (/[/?#]/.test(orderId)) {
      return reply.code(400).send({ error: "bad_order", message: "Invalid order." });
    }

    let order;
    try {
      order = await fetchOrderForCaller(idToken, orderId);
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 403) {
        return reply.code(403).send({
          error: "forbidden",
          message: "You are not part of this order.",
        });
      }
      throw e;
    }
    if (!order) {
      return reply.code(404).send({ error: "not_found", message: "Order not found." });
    }
    if (order.deliveryStatus === "delivered") {
      return reply.code(403).send({
        error: "delivered",
        message: "Delivery complete",
      });
    }
    if (
      order.deliveryStatus !== "assigned" &&
      order.deliveryStatus !== "picked_up"
    ) {
      return reply.code(403).send({
        error: "forbidden",
        message: "Call is only available during an active delivery.",
      });
    }
    if (
      !callerIsParty(order, caller.uid) ||
      !userIdOnOrder(order, userId) ||
      !userIdIsCaller(order, userId, caller.uid)
    ) {
      return reply.code(403).send({
        error: "forbidden",
        message: "You are not part of this order.",
      });
    }

    const channel = callChannelName(orderId);
    const uid = agoraUidFromUserId(caller.uid);
    const minted = buildVoiceToken({
      appId,
      appCertificate,
      channel,
      uid,
    });
    return {
      token: minted.token,
      channel,
      appId,
      uid,
      expireAt: minted.expireAt,
    };
  });
}
