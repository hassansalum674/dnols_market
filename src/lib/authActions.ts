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
import { getFirebaseAuth, initFirebase, isFirebaseConfigured } from "./firebase";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
};

export type GoogleSignInMethod = "popup" | "redirect";

const AUTH_ERR_KEY = "dnols.auth.error";
const AUTH_REDIRECT_KEY = "dnols.auth.redirect";

function mapUser(u: User): AuthUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    provider: u.providerData[0]?.providerId ?? "unknown",
  };
}

function authCode(e: unknown): string | null {
  if (typeof e === "object" && e !== null && "code" in e) {
    const code = (e as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export function authErrorMessage(e: unknown): string {
  switch (authCode(e)) {
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Allow popups for this site and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/operation-not-supported-in-this-environment":
      return "Google sign-in is not available in this browser. Try Safari or Chrome, or sign in with email.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Sign in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in.";
    case "auth/account-exists-with-different-credential":
      return "This email is already used with a different sign-in method.";
    default:
      return e instanceof Error ? e.message : "Sign-in failed";
  }
}

export function storeAuthError(message: string) {
  try {
    sessionStorage.setItem(AUTH_ERR_KEY, message);
  } catch {
    /* ignore */
  }
}

export function consumeAuthError(): string | null {
  try {
    const v = sessionStorage.getItem(AUTH_ERR_KEY);
    if (v) sessionStorage.removeItem(AUTH_ERR_KEY);
    return v;
  } catch {
    return null;
  }
}

function markRedirectPending() {
  try {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, "1");
  } catch {
    /* ignore */
  }
}

function clearRedirectPending() {
  try {
    sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  } catch {
    /* ignore */
  }
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

function shouldFallbackToRedirect(e: unknown): boolean {
  return (
    authCode(e) === "auth/popup-blocked" ||
    authCode(e) === "auth/operation-not-supported-in-this-environment"
  );
}

async function oauthSignIn(
  provider: GoogleAuthProvider,
): Promise<GoogleSignInMethod> {
  const auth = await requireAuth();
  try {
    await signInWithPopup(auth, provider);
    return "popup";
  } catch (e) {
    if (!shouldFallbackToRedirect(e)) throw e;
    markRedirectPending();
    await signInWithRedirect(auth, provider);
    return "redirect";
  }
}

export async function signInWithGoogle(): Promise<GoogleSignInMethod> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return oauthSignIn(provider);
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

export async function updateDisplayName(name: string): Promise<AuthUser> {
  const auth = await requireAuth();
  const u = auth.currentUser;
  if (!u) throw new Error("Sign in first.");
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error("Enter your name (at least 2 letters).");
  const { updateProfile } = await import("firebase/auth");
  await updateProfile(u, { displayName: trimmed });
  return mapUser(u);
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
      storeAuthError(authErrorMessage(e));
    } finally {
      clearRedirectPending();
    }

    unsub = onAuthStateChanged(auth, (u) => {
      onUser(u ? mapUser(u) : null);
      markReady();
    });
  })();

  return () => unsub();
}

export { isFirebaseConfigured };
