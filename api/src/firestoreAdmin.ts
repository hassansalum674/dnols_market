import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let db: Firestore | null = null;
let initError: string | null = null;

function parseServiceAccount(): Record<string, unknown> | null {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (b64) {
    try {
      return JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as Record<
        string,
        unknown
      >;
    } catch {
      initError = "FIREBASE_SERVICE_ACCOUNT_BASE64 is not valid base64 JSON";
      return null;
    }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  const candidates = [raw];
  if (raw.startsWith("{") && raw.includes("\\n")) {
    candidates.push(raw.replace(/\\n/g, "\n"));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (typeof parsed === "string") {
        return JSON.parse(parsed) as Record<string, unknown>;
      }
      return parsed as Record<string, unknown>;
    } catch {
      /* try next */
    }
  }

  initError =
    "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON (paste the full key file on one line, or use FIREBASE_SERVICE_ACCOUNT_BASE64)";
  return null;
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
