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
import { getFirebaseAuth, getFirebaseDb, initFirebase } from "../lib/firebase";
import { API_UNAVAILABLE, claimRiderViaApi } from "../lib/riderClaim";

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

async function idToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  return (await auth?.currentUser?.getIdToken()) ?? null;
}

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
      await initFirebase();
      const db = getFirebaseDb();
      if (!db || cancelled) return;
      const phone = user.phone ?? "";
      try {
        const claimed = phone
          ? await claimRiderByPhone(db, user.uid, phone)
          : await loadRiderByAuthUid(db, user.uid, phone);
        if (!cancelled) setRider(claimed);
      } catch {
        if (!cancelled) setRider(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.phone]);

  const doGoogle = useCallback(async () => persistGoogle(), []);

  const linkPhone = useCallback(
    async (phone: string) => {
      await initFirebase();
      if (!user?.uid) return false;
      const token = await idToken();
      if (token) {
        try {
          const viaApi = await claimRiderViaApi(token, phone);
          setRider(viaApi);
          return Boolean(viaApi);
        } catch (e) {
          if (!(e instanceof Error && e.message === API_UNAVAILABLE)) throw e;
        }
      }
      const db = getFirebaseDb();
      if (!db) return false;
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
