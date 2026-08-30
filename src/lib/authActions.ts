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
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";

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

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Sign-in is not configured. Add Firebase keys to .env — see docs/auth.md",
    );
  }
  return auth;
}

async function oauthSignIn(provider: GoogleAuthProvider) {
  const auth = requireAuth();
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
  const auth = requireAuth();
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<void> {
  const auth = requireAuth();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName?.trim()) {
    const { updateProfile } = await import("firebase/auth");
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
}

export async function resetPassword(email: string): Promise<void> {
  const auth = requireAuth();
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
  if (!isFirebaseConfigured()) {
    onReady?.();
    onUser(null);
    return () => {};
  }
  const auth = getFirebaseAuth();
  if (!auth) {
    onReady?.();
    onUser(null);
    return () => {};
  }
  void getRedirectResult(auth).then((cred) => {
    if (cred?.user) onUser(mapUser(cred.user));
  });
  return onAuthStateChanged(auth, (u) => {
    onUser(u ? mapUser(u) : null);
    onReady?.();
  });
}

export { isFirebaseConfigured };
