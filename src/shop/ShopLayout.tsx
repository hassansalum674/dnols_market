import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { getOrder } from "./api";
import { ShopTabBar } from "./TabBar";
import { ShopSplash } from "./Splash";
import { RoutePulse } from "../components/Splash";
import { useShopData, ShopProvider } from "./shopData";
import { markSplashSeen, splashSeen } from "./storage";
import { paths } from "../lib/paths";

const titles: Record<string, string> = {
  [paths.shop]: "Today",
  [paths.shopStock]: "Stock",
  [paths.shopOrders]: "Orders",
  [paths.shopProfile]: "Shop",
};

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
      {splash && <ShopSplash onDone={done} />}
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
        <ShopTabBar pickupCount={held} />
      </div>
    </>
  );
}

export function ShopLayout() {
  return (
    <ShopProvider>
      <ShopChrome />
    </ShopProvider>
  );
}
