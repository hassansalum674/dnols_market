import type { FirebaseApp } from "firebase/app";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

/**
 * WebChannel (the default Firestore transport) often dies behind a PWA
 * service worker and then getDoc() throws "client is offline".
 * Long polling uses ordinary HTTPS, which the SW can leave alone.
 */
export function openFirestore(app: FirebaseApp): Firestore {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}
