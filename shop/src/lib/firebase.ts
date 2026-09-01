import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

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
let resolvedConfig: FirebaseConfig | null = null;
let initPromise: Promise<boolean> | null = null;

function hasConfig(cfg: Partial<FirebaseConfig>): cfg is FirebaseConfig {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);
}

async function loadHostingConfig(): Promise<Partial<FirebaseConfig>> {
  try {
    const res = await fetch("/__/firebase/init.json");
    if (!res.ok) return {};
    const json = (await res.json()) as Partial<FirebaseConfig>;
    return json;
  } catch {
    return {};
  }
}

export async function initFirebase(): Promise<boolean> {
  if (app && auth) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const hosting = await loadHostingConfig();
    const merged = {
      apiKey: envConfig.apiKey || hosting.apiKey,
      authDomain: envConfig.authDomain || hosting.authDomain,
      projectId: envConfig.projectId || hosting.projectId,
    };

    if (!hasConfig(merged)) return false;

    resolvedConfig = merged;
    app = initializeApp(merged);
    auth = getAuth(app);
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {
      /* private mode */
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

export { initFirebase as ensureFirebase };
