import { firestoreAdminReady, getAdminDb, formatFirebaseError } from "./firestoreAdmin.js";
import {
  createRiderDoc,
  fetchRiderDocFields,
  patchRiderAuthUid,
  patchRiderDoc,
  querySellerRiderIds,
  upsertSellerRiderLink,
} from "./firestoreRest.js";

export type RidersDbError = "permission_denied" | "firestore_unavailable";

export class RiderDbException extends Error {
  readonly code: RidersDbError;

  constructor(code: RidersDbError, message?: string) {
    super(message?.trim() || code);
    this.name = "RiderDbException";
    this.code = code;
  }
}

function restErr(e: unknown): RiderDbException {
  const status = (e as { status?: number }).status;
  return new RiderDbException(
    status === 403 ? "permission_denied" : "firestore_unavailable",
    e instanceof Error ? e.message : undefined,
  );
}

function adminErr(e: unknown): RiderDbException {
  const err = e as { code?: string | number; message?: string };
  const code = err.code;
  const detail = formatFirebaseError(e);
  if (
    code === 7 ||
    code === "permission-denied" ||
    code === "PERMISSION_DENIED"
  ) {
    return new RiderDbException("permission_denied", detail);
  }
  return new RiderDbException("firestore_unavailable", detail);
}

async function withAdmin<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw adminErr(e);
  }
}

export function ridersUseAdmin(): boolean {
  return firestoreAdminReady();
}

export async function readRiderFields(
  idToken: string,
  riderId: string,
): Promise<Record<string, unknown> | null> {
  const admin = getAdminDb();
  if (admin) {
    return withAdmin(async () => {
      const snap = await admin.collection("riders").doc(riderId).get();
      if (!snap.exists) return null;
      return snap.data() as Record<string, unknown>;
    });
  }
  try {
    return await fetchRiderDocFields(idToken, riderId);
  } catch (e) {
    throw restErr(e);
  }
}

export async function writeRiderDoc(
  idToken: string,
  riderId: string,
  data: Record<string, unknown>,
  create: boolean,
): Promise<void> {
  const admin = getAdminDb();
  if (admin) {
    await withAdmin(async () => {
      const ref = admin.collection("riders").doc(riderId);
      if (create) {
        await ref.set(data);
      } else {
        await ref.set(data, { merge: true });
      }
    });
    return;
  }
  try {
    if (create) {
      await createRiderDoc(idToken, riderId, data);
    } else {
      await patchRiderDoc(idToken, riderId, data);
    }
  } catch (e) {
    throw restErr(e);
  }
}

/** Create rider doc, or patch if it already exists. Returns the stored fields. */
export async function upsertRiderForInvite(
  idToken: string,
  riderId: string,
  createData: Record<string, unknown>,
  patchIfExists: (existing: Record<string, unknown>) => Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const admin = getAdminDb();
  if (admin) {
    return withAdmin(async () => {
      const ref = admin.collection("riders").doc(riderId);
      const snap = await ref.get();
      if (snap.exists) {
        const patch = patchIfExists(snap.data() as Record<string, unknown>);
        await ref.set(patch, { merge: true });
        return { ...(snap.data() as Record<string, unknown>), ...patch };
      }
      await ref.set(createData);
      return createData;
    });
  }

  try {
    await createRiderDoc(idToken, riderId, createData);
    return createData;
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status !== 409) throw restErr(e);
    let existing: Record<string, unknown> | null;
    try {
      existing = await fetchRiderDocFields(idToken, riderId);
    } catch (readErr) {
      throw restErr(readErr);
    }
    if (!existing) throw restErr(e);
    const patch = patchIfExists(existing);
    await patchRiderDoc(idToken, riderId, patch);
    return { ...existing, ...patch };
  }
}

export async function writeSellerRiderLink(
  idToken: string,
  linkId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const admin = getAdminDb();
  if (admin) {
    await withAdmin(async () => {
      await admin.collection("seller_riders").doc(linkId).set(data, { merge: true });
    });
    return;
  }
  try {
    await upsertSellerRiderLink(idToken, linkId, data);
  } catch (e) {
    throw restErr(e);
  }
}

export async function listSellerRiderDocIds(
  idToken: string,
  sellerId: string,
): Promise<string[]> {
  const admin = getAdminDb();
  if (admin) {
    return withAdmin(async () => {
      // Single-field query — no composite index required.
      const snap = await admin
        .collection("seller_riders")
        .where("sellerId", "==", sellerId)
        .get();
      return snap.docs
        .filter((doc) => doc.data().active !== false)
        .map((doc) => {
          const riderId = doc.data().riderId;
          return typeof riderId === "string" ? riderId : "";
        })
        .filter(Boolean);
    });
  }
  try {
    return await querySellerRiderIds(idToken, sellerId);
  } catch (e) {
    throw restErr(e);
  }
}

export async function setRiderAuthUid(
  idToken: string,
  riderId: string,
  authUid: string,
): Promise<void> {
  const admin = getAdminDb();
  if (admin) {
    await withAdmin(async () => {
      await admin.collection("riders").doc(riderId).update({ authUid });
    });
    return;
  }
  try {
    await patchRiderAuthUid(idToken, riderId, authUid);
  } catch (e) {
    throw restErr(e);
  }
}
