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
  signUpWithEmail,
  subscribeAuth,
  type AuthUser,
} from "../lib/authActions";
import { startSellerSync, stopSellerSync } from "../lib/accountCloud";
import { initFirebase } from "../lib/firebase";
import { clearSession, saveSession } from "../storage";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<"popup" | "redirect">;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
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
      stopSellerSync();
      return;
    }
    saveSession({
      phone: user.email ?? user.uid,
      signedInAt: new Date().toISOString(),
    });
    void startSellerSync(user.uid);
    return () => stopSellerSync();
  }, [user?.uid, user?.email]);

  const doSignOut = useCallback(async () => {
    await authSignOut();
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      signOut: doSignOut,
    }),
    [user, loading, configured, doSignOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

export type { AuthUser };
