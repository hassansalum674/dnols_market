import {
  fetchRiderDocFields,
  patchRiderAuthUid,
} from "./firestoreRest.js";

const INVITE_TEXT =
  "You have been added as a delivery rider on dnols. Download the app: rider.dnols.com";

export function e164Tz(raw: string): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  const normalized = digits.startsWith("255")
    ? `+${digits}`
    : digits.startsWith("0")
      ? `+255${digits.slice(1)}`
      : digits.length === 9
        ? `+255${digits}`
        : "";
  const check = normalized.replace(/\D/g, "");
  if (!/^255[67]\d{8}$/.test(check)) return null;
  return normalized;
}

type AtResponse = {
  SMSMessageData?: {
    Message?: string;
    Recipients?: { status?: string; statusCode?: number; number?: string }[];
  };
};

export async function sendRiderInviteSms(phoneRaw: string): Promise<{
  sent: boolean;
  skipped?: string;
  providerId?: string;
}> {
  const to = e164Tz(phoneRaw);
  if (!to) throw new Error("Enter a valid Tanzania number (+255 6… or 7…).");

  const apiKey = process.env.AFRICASTALKING_API_KEY?.trim();
  const username = process.env.AFRICASTALKING_USERNAME?.trim();
  if (!apiKey || !username) {
    return { sent: false, skipped: "sms_not_configured" };
  }

  const from = process.env.AFRICASTALKING_FROM?.trim();
  const body = new URLSearchParams({
    username,
    to,
    message: INVITE_TEXT,
  });
  if (from) body.set("from", from);

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = (await res.json().catch(() => ({}))) as AtResponse;
  if (!res.ok) {
    const msg = data.SMSMessageData?.Message || `SMS failed (${res.status})`;
    throw new Error(msg);
  }
  const recipient = data.SMSMessageData?.Recipients?.[0];
  const ok =
    recipient?.statusCode === 101 ||
    recipient?.status === "Success" ||
    /sent/i.test(data.SMSMessageData?.Message ?? "");
  return {
    sent: ok || !recipient,
    providerId: recipient?.number,
  };
}

type TokenInfo = { uid: string; phone?: string };

export function bearerToken(
  header: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(header) ? header[0] : header;
  const token = raw?.startsWith("Bearer ") ? raw.slice(7).trim() : "";
  return token || null;
}

export async function verifyFirebaseBearer(
  header: string | string[] | undefined,
): Promise<TokenInfo | null> {
  const token = bearerToken(header);
  if (!token) return null;

  const apiKey =
    process.env.FIREBASE_WEB_API_KEY?.trim() ||
    process.env.VITE_FIREBASE_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    },
  );
  const body = (await res.json().catch(() => ({}))) as {
    users?: { localId?: string; phoneNumber?: string }[];
    error?: { message?: string };
  };
  const user = body.users?.[0];
  if (!res.ok || !user?.localId) return null;
  return { uid: user.localId, phone: user.phoneNumber };
}

export type ApiRiderRow = {
  riderId: string;
  name: string;
  phone: string;
  authUid: string | null;
  linkedSellers: string[];
  status: "idle" | "busy";
  createdAt: string;
};

function riderIdFromPhone(phone: string): string {
  return `rider_${phone.replace(/\D/g, "")}`;
}

function parseRiderRow(id: string, data: Record<string, unknown>): ApiRiderRow {
  const linked = Array.isArray(data.linkedSellers)
    ? data.linkedSellers.map((s) => String(s)).filter(Boolean)
    : [];
  return {
    riderId: String(data.riderId ?? id),
    name: String(data.name ?? "Rider"),
    phone: String(data.phone ?? ""),
    authUid:
      typeof data.authUid === "string" && data.authUid.trim()
        ? data.authUid
        : null,
    linkedSellers: linked,
    status: data.status === "busy" ? "busy" : "idle",
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

export type ClaimRiderResult =
  | { ok: true; rider: ApiRiderRow }
  | { ok: false; error: "not_linked" | "rider_taken" | "permission_denied" | "firestore_unavailable" };

export async function claimRiderPhone(
  idToken: string,
  uid: string,
  phoneRaw: string,
): Promise<ClaimRiderResult> {
  const phone = e164Tz(phoneRaw);
  if (!phone) {
    throw new Error("Enter a valid Tanzania number (+255 6… or 7…).");
  }
  const riderId = riderIdFromPhone(phone);
  let fields: Record<string, unknown> | null;
  try {
    fields = await fetchRiderDocFields(idToken, riderId);
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 403) return { ok: false, error: "permission_denied" };
    return { ok: false, error: "firestore_unavailable" };
  }
  if (!fields) return { ok: false, error: "not_linked" };
  const cur = parseRiderRow(riderId, fields);
  if (cur.authUid && cur.authUid !== uid) {
    return { ok: false, error: "rider_taken" };
  }
  if (cur.authUid === uid) return { ok: true, rider: cur };
  try {
    await patchRiderAuthUid(idToken, riderId, uid);
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 403) return { ok: false, error: "permission_denied" };
    return { ok: false, error: "firestore_unavailable" };
  }
  return { ok: true, rider: { ...cur, authUid: uid } };
}
