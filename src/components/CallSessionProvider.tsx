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
  listenBuyerOrders,
  type MarketOrderDoc,
} from "../lib/deliveryCloud";
import { apiBase } from "../lib/apiBase";
import { getFirebaseAuth, getFirebaseDb } from "../lib/firebase";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import { useOrderVoiceCall } from "../../shared/voiceCall/useOrderVoiceCall";

type CallCtxValue = {
  startCall: (order: MarketOrderDoc) => Promise<void>;
  startCallById: (orderId: string) => Promise<void>;
};

const CallCtx = createContext<CallCtxValue | null>(null);

export function useVoiceCall(): CallCtxValue {
  const ctx = useContext(CallCtx);
  if (!ctx) {
    return {
      startCall: async () => undefined,
      startCallById: async () => undefined,
    };
  }
  return ctx;
}

export function CallSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [orders, setOrders] = useState<MarketOrderDoc[]>([]);
  const uid = user?.uid ?? "";

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db || !uid) {
      setOrders([]);
      return;
    }
    return listenBuyerOrders(db, uid, setOrders);
  }, [uid]);

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
      speaker: t("speaker"),
      speakerOff: t("speakerOff"),
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
    role: "buyer",
    apiBase: apiBase(),
    db: getFirebaseDb(),
    getIdToken: async () => getFirebaseAuth()?.currentUser?.getIdToken(),
    labels,
  });

  const startCallById = useCallback(
    async (orderId: string) => {
      const order = orders.find((o) => o.orderId === orderId);
      if (!order) return;
      await startCall(order);
    },
    [orders, startCall],
  );

  const value = useMemo(
    () => ({ startCall, startCallById }),
    [startCall, startCallById],
  );

  return (
    <CallCtx.Provider value={value}>
      {children}
      {overlay}
    </CallCtx.Provider>
  );
}
