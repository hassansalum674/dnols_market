import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let db: Firestore | null = null;
let initError: string | null = null;
let resolvedProjectId: string | null = null;
let writeProbeOk = false;
let writeProbeError: string | null = null;

export function formatFirebaseError(e: unknown): string {
  if (!e || typeof e !== "object") return String(e);
  const err = e as {
    code?: string | number;
    message?: string;
    details?: string;
  };
  const bits = [
    err.code !== undefined ? String(err.code) : "",
    err.message ?? "",
    err.details ?? "",
  ].filter(Boolean);
  return bits.join(": ") || JSON.stringify(e);
}

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

export function firestoreProjectId(): string | null {
  getAdminDb();
  return resolvedProjectId;
}

export function firestoreWriteProbe(): { ok: boolean; error: string | null } {
  return { ok: writeProbeOk, error: writeProbeError };
}

export async function probeFirestoreWrite(): Promise<void> {
  const admin = getAdminDb();
  if (!admin) return;
  try {
    const ref = admin.collection("_dnols_health").doc("probe");
    await ref.set({ ts: new Date().toISOString() }, { merge: true });
    const snap = await ref.get();
    if (!snap.exists) {
      writeProbeError = "Firestore write probe: document missing after set";
      return;
    }
    writeProbeOk = true;
    writeProbeError = null;
  } catch (e) {
    writeProbeOk = false;
    writeProbeError = formatFirebaseError(e);
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
    // Service account project is authoritative (env override caused NOT_FOUND writes).
    const projectId = String(
      cred.project_id ?? process.env.FIREBASE_PROJECT_ID?.trim() ?? "dnols-2a394",
    );
    resolvedProjectId = projectId;
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
