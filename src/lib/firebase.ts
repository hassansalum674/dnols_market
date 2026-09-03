import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
};

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let resolvedConfig: FirebaseConfig | null = null;
let initPromise: Promise<boolean> | null = null;

function hasConfig(cfg: Partial<FirebaseConfig>): cfg is FirebaseConfig {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);
}

async function loadHostingConfig(): Promise<Partial<FirebaseConfig>> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 1500);
  try {
    const res = await fetch("/__/firebase/init.json", { signal: ctrl.signal });
    if (!res.ok) return {};
    return (await res.json()) as Partial<FirebaseConfig>;
  } catch {
    return {};
  } finally {
    window.clearTimeout(timer);
  }
}

export async function initFirebase(): Promise<boolean> {
  if (app && auth) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Prefer baked-in env keys so sign-in is not blocked by a hanging
    // /__/firebase/init.json fetch (common on mobile with the PWA service worker).
    const hosting = hasConfig(envConfig) ? {} : await loadHostingConfig();
    const merged = {
      apiKey: envConfig.apiKey || hosting.apiKey,
      authDomain: envConfig.authDomain || hosting.authDomain,
      projectId: envConfig.projectId || hosting.projectId,
    };

    if (!hasConfig(merged)) return false;

    resolvedConfig = merged;
    app = getApps().length ? getApp() : initializeApp(merged);
    db = getFirestore(app);
    try {
      auth = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch {
      auth = getAuth(app);
      try {
        await setPersistence(auth, indexedDBLocalPersistence);
      } catch {
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch {
          /* private mode / storage blocked — auth still works for this session */
        }
      }
    }
    return true;
  })();

  return initPromise;
}

export function isFirebaseConfigured(): boolean {
  if (app && auth) return true;
  return hasConfig({
    apiKey: envConfig.apiKey || resolvedConfig?.apiKey,
    authDomain: envConfig.authDomain || resolvedConfig?.authDomain,
    projectId: envConfig.projectId || resolvedConfig?.projectId,
  });
}

export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  return db;
}

export { initFirebase as ensureFirebase };
