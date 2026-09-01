import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  getRedirectResult,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, initFirebase, isFirebaseConfigured } from "../lib/firebase";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
};

function mapUser(u: User): AuthUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    provider: u.providerData[0]?.providerId ?? "unknown",
  };
}

function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

async function requireAuth() {
  const ready = await initFirebase();
  const auth = getFirebaseAuth();
  if (!ready || !auth) {
    throw new Error(
      "Sign-in is not configured. Add Firebase keys to .env — see docs/auth.md",
    );
  }
  return auth;
}

async function oauthSignIn(provider: GoogleAuthProvider) {
  const auth = await requireAuth();
  if (isMobile()) {
    await signInWithRedirect(auth, provider);
  } else {
    await signInWithPopup(auth, provider);
  }
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await oauthSignIn(provider);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const auth = await requireAuth();
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<void> {
  const auth = await requireAuth();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName?.trim()) {
    const { updateProfile } = await import("firebase/auth");
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
}

export async function resetPassword(email: string): Promise<void> {
  const auth = await requireAuth();
  await sendPasswordResetEmail(auth, email.trim());
}

export async function authSignOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export function subscribeAuth(
  onUser: (user: AuthUser | null) => void,
  onReady?: () => void,
): () => void {
  let unsub = () => {};
  let ready = false;
  const markReady = () => {
    if (ready) return;
    ready = true;
    onReady?.();
  };

  void (async () => {
    const ok = await initFirebase();
    if (!ok) {
      onUser(null);
      markReady();
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      onUser(null);
      markReady();
      return;
    }

    try {
      const redirect = await getRedirectResult(auth);
      if (redirect?.user) onUser(mapUser(redirect.user));
    } catch (e) {
      console.error("Google redirect sign-in failed", e);
    }

    unsub = onAuthStateChanged(auth, (u) => {
      onUser(u ? mapUser(u) : null);
      markReady();
    });
  })();

  return () => unsub();
}

export { isFirebaseConfigured };
