import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { getOrder } from "./api";
import { TabBar } from "./components/TabBar";
import { RoutePulse, Splash } from "./components/Splash";
import { shopPaths } from "./paths";
import { useShopData, ShopProvider } from "./shopData";
import { markSplashSeen, splashSeen } from "./storage";

const titles: Record<string, string> = {
  [shopPaths.home]: "Today",
  [shopPaths.stock]: "Stock",
  [shopPaths.orders]: "Orders",
  [shopPaths.profile]: "Shop",
};

function DeadShopPort() {
  return (
    <div className="center-state" style={{ minHeight: "100dvh" }}>
      <img className="state-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p>This is the old shop Vite on port 5174. Stop this process.</p>
      <p>From the repo root run npm run dev, then open the seller UI on 5173.</p>
      <a className="btn" href="http://localhost:5173/shop">
        Open http://localhost:5173/shop
      </a>
    </div>
  );
}

function ShopChrome() {
  const loc = useLocation();
  const nav = useNavigation();
  const { saved } = useShopData();
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

  const title = useMemo(() => titles[loc.pathname] ?? "Shop", [loc.pathname]);

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div className="app-shell shop-shell">
        <header className="header">
          <div className="header-row">
            <img
              className="header-mark"
              src="/brand/logo6_dark.svg"
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

export function ShopLayout() {
  if (typeof window !== "undefined" && window.location.port === "5174") {
    return <DeadShopPort />;
  }
  return (
    <ShopProvider>
      <ShopChrome />
    </ShopProvider>
  );
}

export { ShopLayout as AppLayout };
