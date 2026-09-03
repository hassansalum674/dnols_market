import {
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, initFirebase, isFirebaseConfigured } from "./firebase";
import { isValidTzMobile, toE164 } from "./deliveryCloud";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
  provider: string;
};

let verifier: RecaptchaVerifier | null = null;

function mapUser(u: User): AuthUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    phone: u.phoneNumber,
    provider: u.providerData[0]?.providerId ?? "unknown",
  };
}

function recaptchaHost(): HTMLElement {
  let el = document.getElementById("recaptcha-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "recaptcha-container";
    document.body.appendChild(el);
  }
  return el;
}

async function requireAuth() {
  const ready = await initFirebase();
  const auth = getFirebaseAuth();
  if (!ready || !auth) {
    throw new Error("Sign-in is not configured. Add Firebase keys — see docs/auth.md");
  }
  return auth;
}

export async function sendRiderOtp(phoneRaw: string): Promise<ConfirmationResult> {
  if (!isValidTzMobile(phoneRaw)) {
    throw new Error("bad_phone");
  }
  const auth = await requireAuth();
  if (verifier) {
    verifier.clear();
    verifier = null;
  }
  verifier = new RecaptchaVerifier(auth, recaptchaHost(), { size: "invisible" });
  await verifier.render();
  return signInWithPhoneNumber(auth, toE164(phoneRaw), verifier);
}

export async function confirmRiderOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<void> {
  await confirmation.confirm(code.trim());
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
    unsub = onAuthStateChanged(auth, (u) => {
      onUser(u ? mapUser(u) : null);
      markReady();
    });
  })();

  return () => unsub();
}

export { isFirebaseConfigured };
