import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { RtcTokenBuilder } = require("agora-token") as {
  RtcTokenBuilder: {
    buildTokenWithUidAndPrivilege: (
      appId: string,
      appCertificate: string,
      channelName: string,
      uid: string | number,
      tokenExpire: number,
      joinChannelPrivilegeExpire: number,
      pubAudioPrivilegeExpire: number,
      pubVideoPrivilegeExpire: number,
      pubDataStreamPrivilegeExpire: number,
    ) => string;
  };
};

const TOKEN_TTL_SEC = 60 * 60;

export function agoraUidFromUserId(userId: string): number {
  let h = 2166136261;
  for (let i = 0; i < userId.length; i++) {
    h ^= userId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const uid = h >>> 0;
  return uid === 0 ? 1 : uid;
}

export function callChannelName(orderId: string): string {
  const safe = String(orderId).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 56);
  return `order_${safe}`;
}

export function buildVoiceToken(opts: {
  appId: string;
  appCertificate: string;
  channel: string;
  uid: number;
}): { token: string; expireAt: string; ttlSec: number } {
  const token = RtcTokenBuilder.buildTokenWithUidAndPrivilege(
    opts.appId,
    opts.appCertificate,
    opts.channel,
    opts.uid,
    TOKEN_TTL_SEC,
    TOKEN_TTL_SEC,
    TOKEN_TTL_SEC,
    0,
    TOKEN_TTL_SEC,
  );
  return {
    token,
    ttlSec: TOKEN_TTL_SEC,
    expireAt: new Date(Date.now() + TOKEN_TTL_SEC * 1000).toISOString(),
  };
}
