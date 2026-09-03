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
  signInWithGoogle as persistGoogle,
  subscribeAuth,
  type AuthUser,
  type GoogleSignInMethod,
} from "../lib/authActions";
import {
  claimRiderByPhone,
  loadRiderByAuthUid,
  type RiderDoc,
} from "../lib/deliveryCloud";
import { getFirebaseDb, initFirebase } from "../lib/firebase";

type AuthState = {
  user: AuthUser | null;
  rider: RiderDoc | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<GoogleSignInMethod>;
  linkPhone: (phone: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [rider, setRider] = useState<RiderDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(isFirebaseConfigured());

  useEffect(() => {
    void initFirebase().then((ok) => setConfigured(ok));
    return subscribeAuth(setUser, () => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setRider(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const db = getFirebaseDb();
      if (!db) return;
      const phone = user.phone ?? "";
      const claimed = phone
        ? await claimRiderByPhone(db, user.uid, phone)
        : await loadRiderByAuthUid(db, user.uid, phone);
      if (!cancelled) setRider(claimed);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.phone]);

  const doGoogle = useCallback(async () => persistGoogle(), []);

  const linkPhone = useCallback(
    async (phone: string) => {
      const db = getFirebaseDb();
      if (!db || !user?.uid) return false;
      const next = await claimRiderByPhone(db, user.uid, phone);
      setRider(next);
      return Boolean(next);
    },
    [user?.uid],
  );

  const doSignOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setRider(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      rider,
      loading,
      configured,
      signInWithGoogle: doGoogle,
      linkPhone,
      signOut: doSignOut,
    }),
    [user, rider, loading, configured, doGoogle, linkPhone, doSignOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

export type { AuthUser };
