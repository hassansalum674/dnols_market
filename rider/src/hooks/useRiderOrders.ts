import { useEffect, useState } from "react";
import { listenRiderOrders, type MarketOrderDoc } from "../lib/deliveryCloud";
import { getFirebaseDb, initFirebase } from "../lib/firebase";
import type { RiderDoc } from "../lib/deliveryCloud";

export function useRiderOrders(rider: RiderDoc | null) {
  const [orders, setOrders] = useState<MarketOrderDoc[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!rider) {
      setOrders([]);
      setReady(true);
      return;
    }
    let stop: (() => void) | undefined;
    let cancelled = false;
    setReady(false);
    void initFirebase().then(() => {
      const db = getFirebaseDb();
      if (!db || cancelled) {
        setOrders([]);
        setReady(true);
        return;
      }
      stop = listenRiderOrders(db, rider.riderId, rider.authUid ?? "", setOrders);
      setReady(true);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [rider?.riderId, rider?.authUid]);

  const active = orders.filter((o) => o.deliveryStatus !== "delivered");
  const history = orders.filter((o) => o.deliveryStatus === "delivered");
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const deliveredToday = history.filter((o) =>
    (o.deliveredAt ?? "").startsWith(todayKey),
  ).length;

  return { orders, active, history, deliveredToday, ready };
}
