import { firestoreAdminReady, getAdminDb } from "./firestoreAdmin.js";
import {
  createRiderDoc,
  fetchRiderDocFields,
  patchRiderAuthUid,
  patchRiderDoc,
  querySellerRiderIds,
  upsertSellerRiderLink,
} from "./firestoreRest.js";

export type RidersDbError = "permission_denied" | "firestore_unavailable";

function restErr(e: unknown): RidersDbError {
  const status = (e as { status?: number }).status;
  return status === 403 ? "permission_denied" : "firestore_unavailable";
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
    const snap = await admin.collection("riders").doc(riderId).get();
    if (!snap.exists) return null;
    return snap.data() as Record<string, unknown>;
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
    const ref = admin.collection("riders").doc(riderId);
    if (create) {
      await ref.set(data);
    } else {
      await ref.set(data, { merge: true });
    }
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

export async function writeSellerRiderLink(
  idToken: string,
  linkId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const admin = getAdminDb();
  if (admin) {
    await admin.collection("seller_riders").doc(linkId).set(data, { merge: true });
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
    const snap = await admin
      .collection("seller_riders")
      .where("sellerId", "==", sellerId)
      .where("active", "==", true)
      .get();
    return snap.docs
      .map((doc) => {
        const riderId = doc.data().riderId;
        return typeof riderId === "string" ? riderId : "";
      })
      .filter(Boolean);
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
    await admin.collection("riders").doc(riderId).update({ authUid });
    return;
  }
  try {
    await patchRiderAuthUid(idToken, riderId, authUid);
  } catch (e) {
    throw restErr(e);
  }
}
