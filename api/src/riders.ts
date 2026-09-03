import {
  readRiderFields,
  ridersUseAdmin,
  listSellerRiderDocIds,
  setRiderAuthUid,
  upsertRiderForInvite,
  writeSellerRiderLink,
  RiderDbException,
  type RidersDbError,
} from "./ridersDb.js";
import { firestoreProjectId } from "./firestoreAdmin.js";

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

function sellerRiderDocId(sellerId: string, riderId: string): string {
  return `${sellerId}_${riderId}`;
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

function rulesHint(): string {
  if (ridersUseAdmin()) return "";
  return " Deploy firestore.rules in Firebase Console, or set FIREBASE_SERVICE_ACCOUNT_JSON on the API.";
}

export function riderFirestoreHint(error: RidersDbError, detail?: string): string {
  const raw = detail && detail.length > 3 && detail !== error ? detail : "";
  if (/NOT_FOUND/i.test(raw) || /^5(\s|:|$)/.test(raw)) {
    const pid = firestoreProjectId() ?? "dnols-2a394";
    return (
      `Firestore (default) database not found in project "${pid}". ` +
      `Open Firebase Console → project ${pid} → Build → Firestore Database → ` +
      `Create database (if you only see Rules, the database was never created). ` +
      `Also confirm FIREBASE_SERVICE_ACCOUNT_JSON is from the same project.`
    );
  }
  if (raw) return raw;
  if (error === "permission_denied") {
    return `Firestore security rules are blocking rider access.${rulesHint()}`;
  }
  return "Could not reach Firestore. Check API env and network.";
}

function dbFailure(error: unknown): { error: RidersDbError; detail?: string } {
  if (error instanceof RiderDbException) {
    return { error: error.code, detail: error.message };
  }
  if (error === "permission_denied" || error === "firestore_unavailable") {
    return { error: error };
  }
  return {
    error: "firestore_unavailable",
    detail: error instanceof Error ? error.message : String(error),
  };
}

export type ClaimRiderResult =
  | { ok: true; rider: ApiRiderRow }
  | { ok: false; error: "not_linked" | "rider_taken" | RidersDbError; detail?: string };

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
    fields = await readRiderFields(idToken, riderId);
  } catch (error) {
    const fail = dbFailure(error);
    return { ok: false, error: fail.error, detail: fail.detail };
  }
  if (!fields) return { ok: false, error: "not_linked" };
  const cur = parseRiderRow(riderId, fields);
  if (cur.authUid && cur.authUid !== uid) {
    return { ok: false, error: "rider_taken" };
  }
  if (cur.authUid === uid) return { ok: true, rider: cur };
  try {
    await setRiderAuthUid(idToken, riderId, uid);
  } catch (error) {
    const fail = dbFailure(error);
    return { ok: false, error: fail.error, detail: fail.detail };
  }
  return { ok: true, rider: { ...cur, authUid: uid } };
}

export type InviteRiderResult =
  | { ok: true; rider: ApiRiderRow }
  | { ok: false; error: RidersDbError; detail?: string };

export async function inviteRiderForSeller(
  idToken: string,
  sellerId: string,
  phoneRaw: string,
  name: string,
): Promise<InviteRiderResult> {
  const phone = e164Tz(phoneRaw);
  if (!phone) {
    throw new Error("Enter a valid Tanzania number (+255 6… or 7…).");
  }
  const riderId = riderIdFromPhone(phone);
  const display = name.trim() || "Rider";
  const at = new Date().toISOString();
  const createPayload: Record<string, unknown> = {
    riderId,
    name: display,
    phone,
    linkedSellers: [sellerId],
    status: "idle",
    createdAt: at,
  };
  try {
    const riderData = await upsertRiderForInvite(
      idToken,
      riderId,
      createPayload,
      (existing) => {
        const cur = parseRiderRow(riderId, existing);
        const linkedSellers = [...new Set([...cur.linkedSellers, sellerId])];
        const nextName = cur.name && cur.name !== "Rider" ? cur.name : display;
        return { linkedSellers, name: nextName };
      },
    );
    await writeSellerRiderLink(idToken, sellerRiderDocId(sellerId, riderId), {
      sellerId,
      riderId,
      addedAt: at,
      active: true,
    });
    return { ok: true, rider: parseRiderRow(riderId, riderData) };
  } catch (error) {
    const fail = dbFailure(error);
    return { ok: false, error: fail.error, detail: fail.detail };
  }
}

export type ListSellerRidersResult =
  | { ok: true; riders: ApiRiderRow[] }
  | { ok: false; error: RidersDbError; detail?: string };

export async function listSellerRiders(
  idToken: string,
  sellerId: string,
): Promise<ListSellerRidersResult> {
  try {
    const ids = await listSellerRiderDocIds(idToken, sellerId);
    const riders: ApiRiderRow[] = [];
    for (const id of ids) {
      const fields = await readRiderFields(idToken, id);
      if (fields) riders.push(parseRiderRow(id, fields));
    }
    riders.sort((a, b) => a.name.localeCompare(b.name));
    return { ok: true, riders };
  } catch (error) {
    const fail = dbFailure(error);
    return { ok: false, error: fail.error, detail: fail.detail };
  }
}

export { ridersUseAdmin };
