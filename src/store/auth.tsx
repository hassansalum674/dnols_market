import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authSignOut,
  isFirebaseConfigured,
  resetPassword,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail as persistSignUp,
  subscribeAuth,
  updateDisplayName as persistDisplayName,
  type AuthUser,
} from "../lib/authActions";
import { initFirebase } from "../lib/firebase";
import { mergeAnonymousSearchHistory } from "../store/persist";
import { mergeCheckoutPhonesToProfile, loadProfile, saveProfile } from "../lib/profile";
import { startAccountSync, stopAccountSync } from "../lib/accountCloud";
import { loadSettings, saveSettings } from "./settings";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<"popup" | "redirect">;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(isFirebaseConfigured());

  useEffect(() => {
    void initFirebase().then((ok) => setConfigured(ok));
    return subscribeAuth(setUser, () => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      stopAccountSync();
      return;
    }
    mergeAnonymousSearchHistory(user.uid);
    mergeCheckoutPhonesToProfile(user.uid);
    const p = loadProfile(user.uid);
    if (p.language) {
      saveSettings({ language: p.language });
    } else {
      saveProfile(user.uid, { language: loadSettings().language });
    }
    void startAccountSync(user.uid);
    return () => stopAccountSync();
  }, [user?.uid]);

  const doSignOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  const doSignUp = useCallback(async (email: string, password: string, name?: string) => {
    const next = await persistSignUp(email, password, name);
    setUser(next);
  }, []);

  const doUpdateDisplayName = useCallback(async (name: string) => {
    const next = await persistDisplayName(name);
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail: doSignUp,
      resetPassword,
      signOut: doSignOut,
      updateDisplayName: doUpdateDisplayName,
    }),
    [user, loading, configured, doSignOut, doSignUp, doUpdateDisplayName],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

export type { AuthUser };
