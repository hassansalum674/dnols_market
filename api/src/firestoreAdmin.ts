import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let db: Firestore | null = null;
let initError: string | null = null;

function parseServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    initError = "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON";
    return null;
  }
}

export function firestoreAdminReady(): boolean {
  return getAdminDb() !== null;
}

export function firestoreAdminError(): string | null {
  getAdminDb();
  return initError;
}

export function getAdminDb(): Firestore | null {
  if (db) return db;
  const cred = parseServiceAccount();
  if (!cred) return null;
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID?.trim() ||
      String(cred.project_id ?? "dnols-2a394");
    app =
      getApps().length > 0
        ? getApps()[0]!
        : initializeApp({
            credential: cert(cred as Parameters<typeof cert>[0]),
            projectId,
          });
    db = getFirestore(app);
    return db;
  } catch (e) {
    initError =
      e instanceof Error ? e.message : "Failed to initialize Firebase Admin";
    return null;
  }
}
