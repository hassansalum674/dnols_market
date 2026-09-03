import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Firestore } from "firebase/firestore";
import {
  canPlaceVoiceCall,
  firstNameOf,
  formatCallClock,
  setOrderCallState,
  type MarketOrderDoc,
} from "../deliveryCloud";
import { CallApiError, fetchCallToken } from "./callApi";
import {
  isMicPermissionError,
  joinVoiceChannel,
  type VoiceSession,
} from "./agoraVoice";
import { VoiceCallOverlay, type VoiceCallPhase } from "./VoiceCallOverlay";

export const RING_TIMEOUT_MS = 30_000;

export type VoiceCallLabels = {
  calling: string;
  incomingBuyer: string;
  incomingRider: string;
  connecting: string;
  inCall: string;
  accept: string;
  decline: string;
  mute: string;
  unmute: string;
  speaker: string;
  speakerOff: string;
  end: string;
  callEnded: string;
  micDenied: string;
  callTimeout: string;
  deliveryComplete: string;
  callDropped: string;
};

function pickLiveOrder(orders: MarketOrderDoc[]): MarketOrderDoc | null {
  const live = orders.filter(
    (o) => o.callStatus === "calling" || o.callStatus === "in_call",
  );
  live.sort((a, b) => (b.callStartedAt ?? "").localeCompare(a.callStartedAt ?? ""));
  return live[0] ?? null;
}

function peerFirstName(order: MarketOrderDoc, myUid: string): string {
  if (order.buyerUid === myUid) {
    return firstNameOf(order.riderName, "Rider");
  }
  return firstNameOf(order.buyerName, "Buyer");
}

export function useOrderVoiceCall(opts: {
  orders: MarketOrderDoc[];
  myUid: string;
  role: "buyer" | "rider";
  apiBase: string;
  db: Firestore | null;
  getIdToken: () => Promise<string | undefined>;
  labels: VoiceCallLabels;
}): {
  startCall: (order: MarketOrderDoc) => Promise<void>;
  overlay: ReactNode;
} {
  const { orders, myUid, role, apiBase, db, getIdToken, labels } = opts;
  const live = pickLiveOrder(orders);
  const sessionRef = useRef<VoiceSession | null>(null);
  const joinedOrderRef = useRef<string | null>(null);
  const endingRef = useRef(false);
  const liveRef = useRef<MarketOrderDoc | null>(live);
  liveRef.current = live;

  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [farewell, setFarewell] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const leaveLocal = useCallback(async () => {
    const session = sessionRef.current;
    sessionRef.current = null;
    joinedOrderRef.current = null;
    if (!session) return;
    try {
      await session.leave();
    } catch {
      /* already left */
    }
  }, []);

  const hangup = useCallback(
    async (
      reason: "end" | "decline" | "timeout" | "drop" | "delivered" | "mic",
      orderId?: string,
    ) => {
      if (endingRef.current) return;
      endingRef.current = true;
      const id = orderId ?? joinedOrderRef.current ?? liveRef.current?.orderId;
      await leaveLocal();
      setFarewell(true);
      if (reason === "timeout") setError(labels.callTimeout);
      else if (reason === "drop") setError(labels.callDropped);
      else if (reason === "delivered") setError(labels.deliveryComplete);
      else if (reason === "mic") setError(labels.micDenied);
      else setError(null);
      if (db && id) {
        try {
          await setOrderCallState(db, id, { callStatus: "ended" });
        } catch {
          /* rules / offline */
        }
        window.setTimeout(() => {
          void setOrderCallState(db, id, { callStatus: "idle" }).catch(
            () => undefined,
          );
        }, 2000);
      }
      window.setTimeout(() => {
        setFarewell(false);
        setError(null);
        setMuted(false);
        setSpeakerOn(true);
        setDurationSec(0);
        setBusyOrderId(null);
        endingRef.current = false;
      }, 2500);
    },
    [db, labels.callDropped, labels.callTimeout, labels.deliveryComplete, labels.micDenied, leaveLocal],
  );

  const ensureJoined = useCallback(
    async (order: MarketOrderDoc) => {
      if (joinedOrderRef.current === order.orderId && sessionRef.current) return;
      if (endingRef.current) return;
      const idToken = await getIdToken();
      if (!idToken) throw new Error("Sign in to call.");
      const creds = await fetchCallToken({
        apiBase,
        idToken,
        orderId: order.orderId,
        userId: myUid,
      });
      const session = await joinVoiceChannel({
        appId: creds.appId,
        channel: creds.channel,
        token: creds.token,
        uid: creds.uid,
        onRemoteJoined: () => {
          if (!db) return;
          void setOrderCallState(db, order.orderId, { callStatus: "in_call" });
        },
        onRemoteLeft: () => {
          void hangup("end", order.orderId);
        },
        onConnectionLost: () => {
          void hangup("drop", order.orderId);
        },
      });
      sessionRef.current = session;
      joinedOrderRef.current = order.orderId;
      if (muted) await session.setMuted(true);
      await session.setSpeaker(speakerOn);
    },
    [apiBase, db, getIdToken, hangup, muted, myUid, speakerOn],
  );

  const startCall = useCallback(
    async (order: MarketOrderDoc) => {
      if (!myUid || !db) return;
      if (order.deliveryStatus === "delivered") {
        setError(labels.deliveryComplete);
        setFarewell(true);
        window.setTimeout(() => {
          setFarewell(false);
          setError(null);
        }, 2500);
        return;
      }
      if (!canPlaceVoiceCall(order)) return;
      if (live && (live.callStatus === "calling" || live.callStatus === "in_call")) {
        return;
      }
      endingRef.current = false;
      setError(null);
      setBusyOrderId(order.orderId);
      try {
        await setOrderCallState(db, order.orderId, {
          callStatus: "calling",
          callInitiatedBy: myUid,
        });
        await ensureJoined(order);
      } catch (e) {
        if (e instanceof CallApiError && e.code === "delivered") {
          await hangup("delivered", order.orderId);
          return;
        }
        if (isMicPermissionError(e)) {
          await hangup("mic", order.orderId);
          return;
        }
        setError(e instanceof Error ? e.message : labels.callDropped);
        await hangup("end", order.orderId);
      }
    },
    [db, ensureJoined, hangup, labels.callDropped, labels.deliveryComplete, live, myUid],
  );

  const accept = useCallback(async () => {
    const order = liveRef.current;
    if (!order || !db || !myUid) return;
    setBusyOrderId(order.orderId);
    try {
      await ensureJoined(order);
      await setOrderCallState(db, order.orderId, { callStatus: "in_call" });
    } catch (e) {
      if (e instanceof CallApiError && e.code === "delivered") {
        await hangup("delivered", order.orderId);
        return;
      }
      if (isMicPermissionError(e)) {
        await hangup("mic", order.orderId);
        return;
      }
      setError(e instanceof Error ? e.message : labels.callDropped);
      await hangup("end", order.orderId);
    }
  }, [db, ensureJoined, hangup, labels.callDropped, myUid]);

  useEffect(() => {
    if (!live) {
      if (joinedOrderRef.current) {
        void hangup("end", joinedOrderRef.current);
      }
      return;
    }
    if (live.deliveryStatus === "delivered") {
      void hangup("delivered", live.orderId);
      return;
    }
    if (
      live.callStatus === "calling" &&
      live.callInitiatedBy === myUid &&
      joinedOrderRef.current !== live.orderId
    ) {
      void ensureJoined(live).catch((e) => {
        if (isMicPermissionError(e)) void hangup("mic", live.orderId);
      });
    }
    if (live.callStatus === "in_call" && joinedOrderRef.current !== live.orderId) {
      void ensureJoined(live).catch((e) => {
        if (isMicPermissionError(e)) void hangup("mic", live.orderId);
      });
    }
  }, [ensureJoined, hangup, live, myUid]);

  useEffect(() => {
    if (!live || live.callStatus !== "calling" || !live.callStartedAt) return;
    const started = Date.parse(live.callStartedAt);
    if (!Number.isFinite(started)) return;
    const remain = RING_TIMEOUT_MS - (Date.now() - started);
    const timer = window.setTimeout(() => {
      void hangup("timeout", live.orderId);
    }, Math.max(0, remain));
    return () => window.clearTimeout(timer);
  }, [hangup, live]);

  useEffect(() => {
    if (live?.callStatus !== "in_call") {
      setDurationSec(0);
      return;
    }
    const t0 = Date.now();
    const timer = window.setInterval(() => {
      setDurationSec(Math.floor((Date.now() - t0) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [live?.callStatus, live?.orderId]);

  useEffect(() => () => {
    void leaveLocal();
  }, [leaveLocal]);

  const toggleMute = useCallback(async () => {
    const next = !muted;
    setMuted(next);
    try {
      await sessionRef.current?.setMuted(next);
    } catch {
      setMuted(!next);
    }
  }, [muted]);

  const toggleSpeaker = useCallback(async () => {
    const next = !speakerOn;
    setSpeakerOn(next);
    try {
      await sessionRef.current?.setSpeaker(next);
    } catch {
      setSpeakerOn(!next);
    }
  }, [speakerOn]);

  let phase: VoiceCallPhase | null = null;
  if (farewell) phase = "ended";
  else if (live?.callStatus === "in_call") phase = "in_call";
  else if (live?.callStatus === "calling") {
    phase = live.callInitiatedBy === myUid ? "outgoing" : "incoming";
  } else if (busyOrderId) phase = "outgoing";

  const orderForUi =
    live ?? orders.find((o) => o.orderId === busyOrderId) ?? null;
  const peer = orderForUi ? peerFirstName(orderForUi, myUid) : "";

  let subtitle = labels.connecting;
  if (phase === "incoming") {
    subtitle = role === "buyer" ? labels.incomingRider : labels.incomingBuyer;
  } else if (phase === "outgoing") {
    subtitle = labels.calling;
  } else if (phase === "in_call") {
    subtitle = labels.inCall;
  } else if (phase === "ended") {
    subtitle = error || labels.callEnded;
  }

  const orderShort = orderForUi
    ? orderForUi.orderId.slice(-6).toUpperCase()
    : "";
  if (phase === "incoming" && orderShort) {
    subtitle = `${subtitle} · #${orderShort}`;
  } else if ((phase === "outgoing" || phase === "in_call") && orderShort) {
    subtitle = `${role === "buyer" ? labels.incomingRider : labels.incomingBuyer} · #${orderShort}`;
  }

  const timer =
    phase === "in_call" || phase === "outgoing"
      ? formatCallClock(durationSec)
      : undefined;

  const overlay = (
    <VoiceCallOverlay
      open={phase !== null}
      phase={phase ?? "ended"}
      peerName={peer}
      subtitle={subtitle}
      timer={timer}
      muted={muted}
      speakerOn={speakerOn}
      error={phase === "ended" ? null : error}
      labels={{
        accept: labels.accept,
        decline: labels.decline,
        mute: labels.mute,
        unmute: labels.unmute,
        speaker: labels.speaker,
        speakerOff: labels.speakerOff,
        end: labels.end,
      }}
      onAccept={() => void accept()}
      onDecline={() => void hangup("decline", orderForUi?.orderId)}
      onToggleMute={() => void toggleMute()}
      onToggleSpeaker={() => void toggleSpeaker()}
      onEnd={() => void hangup("end", orderForUi?.orderId)}
    />
  );

  return { startCall, overlay };
}
