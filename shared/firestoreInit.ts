import type { FirebaseApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from "firebase/firestore";

/**
 * WebChannel (the default Firestore transport) often dies behind a PWA
 * service worker and then getDoc() throws "client is offline".
 * Long polling uses ordinary HTTPS; memory cache avoids stale offline state.
 */
export function openFirestore(app: FirebaseApp): Firestore {
  try {
    return initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}
