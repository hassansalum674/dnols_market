import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { getOrder } from "./api";
import { TabBar } from "./components/TabBar";
import { RoutePulse, Splash } from "./components/Splash";
import { useShopData } from "./shopData";
import { useLanguage } from "./store/language";
import { markSplashSeen, splashSeen } from "./storage";

const titleKeys: Record<string, "today" | "stock" | "orders" | "shop"> = {
  "/stall": "today",
  "/stall/stock": "stock",
  "/stall/orders": "orders",
  "/stall/shop": "shop",
  "/stock": "stock",
  "/orders": "orders",
  "/shop": "shop",
  "/today": "today",
};

export function AppLayout() {
  const loc = useLocation();
  const nav = useNavigation();
  const { saved } = useShopData();
  const { t } = useLanguage();
  const [splash, setSplash] = useState(() => !splashSeen());
  const [held, setHeld] = useState(0);

  const done = useCallback(() => {
    markSplashSeen();
    setSplash(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      saved.map((s) => getOrder(s.orderId).catch(() => null)),
    ).then((rows) => {
      if (cancelled) return;
      setHeld(rows.filter((o) => o?.escrow === "paid_held").length);
    });
    return () => {
      cancelled = true;
    };
  }, [saved]);

  const title = useMemo(() => {
    const key = titleKeys[loc.pathname] ?? "shop";
    return t[key];
  }, [loc.pathname, t]);

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div className="app-shell">
        <header className="header">
          <div className="header-row">
            <img
              className="header-mark"
              src="/brand/logo4_submark.svg"
              alt="Dnols"
            />
            <span className="header-title">{title}</span>
            <span className="header-sub">Kariakoo</span>
          </div>
        </header>
        <main>
          {nav.state === "loading" ? (
            <RoutePulse />
          ) : (
            <Suspense fallback={<RoutePulse />}>
              <Outlet />
            </Suspense>
          )}
        </main>
        <TabBar pickupCount={held} />
      </div>
    </>
  );
}
