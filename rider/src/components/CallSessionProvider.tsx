import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  listenRiderOrders,
  type MarketOrderDoc,
} from "../lib/deliveryCloud";
import { apiBase } from "../lib/apiBase";
import { getFirebaseAuth, getFirebaseDb, initFirebase } from "../lib/firebase";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { useOrderVoiceCall } from "../../../shared/voiceCall/useOrderVoiceCall";

type CallCtxValue = {
  startCall: (order: MarketOrderDoc) => Promise<void>;
};

const CallCtx = createContext<CallCtxValue | null>(null);

export function useVoiceCall(): CallCtxValue {
  const ctx = useContext(CallCtx);
  if (!ctx) {
    return { startCall: async () => undefined };
  }
  return ctx;
}

export function CallSessionProvider({ children }: { children: ReactNode }) {
  const { user, rider } = useAuth();
  const { t } = useI18n();
  const [orders, setOrders] = useState<MarketOrderDoc[]>([]);
  const uid = user?.uid ?? "";
  const riderId = rider?.riderId ?? "";

  useEffect(() => {
    if (!uid) {
      setOrders([]);
      return;
    }
    let stop: (() => void) | undefined;
    let cancelled = false;
    void initFirebase().then(() => {
      const db = getFirebaseDb();
      if (!db || cancelled) {
        setOrders([]);
        return;
      }
      stop = listenRiderOrders(db, riderId || "__none__", uid, setOrders);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [uid, riderId]);

  const labels = useMemo(
    () => ({
      calling: t("calling"),
      incomingBuyer: t("buyerCalling"),
      incomingRider: t("riderCalling"),
      connecting: t("connectingCall"),
      inCall: t("inCall"),
      accept: t("acceptCall"),
      decline: t("declineCall"),
      mute: t("mute"),
      unmute: t("unmute"),
      end: t("endCall"),
      callEnded: t("callEnded"),
      micDenied: t("micDenied"),
      callTimeout: t("callTimeout"),
      deliveryComplete: t("deliveryComplete"),
      callDropped: t("callDropped"),
    }),
    [t],
  );

  const { startCall, overlay } = useOrderVoiceCall({
    orders,
    myUid: uid,
    role: "rider",
    apiBase: apiBase(),
    db: getFirebaseDb(),
    getIdToken: async () => getFirebaseAuth()?.currentUser?.getIdToken(),
    labels,
  });

  const value = useMemo(() => ({ startCall }), [startCall]);

  return (
    <CallCtx.Provider value={value}>
      {children}
      {overlay}
    </CallCtx.Provider>
  );
}
