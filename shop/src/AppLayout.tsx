import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { getOrder } from "./api";
import { StallSidebar } from "./components/StallSidebar";
import { TabBar } from "./components/TabBar";
import { RoutePulse, Splash } from "./components/Splash";
import { useShopData } from "./shopData";
import { markSplashSeen, splashSeen } from "./storage";

const titles: Record<string, string> = {
  "/stall": "Today",
  "/stall/dashboard": "Overview",
  "/stall/stock": "Products",
  "/stall/products/new": "Add product",
  "/stall/orders": "Orders",
  "/stall/shop": "Shop settings",
  "/stock": "Products",
  "/orders": "Orders",
  "/shop": "Shop settings",
  "/today": "Today",
};

function titleForPath(pathname: string): string {
  if (titles[pathname]) return titles[pathname]!;
  if (pathname.startsWith("/stall/products/") && pathname.endsWith("/edit")) {
    return "Edit product";
  }
  return "Shop";
}

export function AppLayout() {
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

  const title = useMemo(() => titleForPath(loc.pathname), [loc.pathname]);

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div className="app-shell app-shell--stall">
        <StallSidebar pickupCount={held} />
        <div className="stall-main">
          <header className="header stall-header">
            <div className="header-row stall-header-row">
              <img
                className="header-mark"
                src="/brand/logo4_submark.svg"
                alt="Dnols"
              />
              <span className="header-title">{title}</span>
              <span className="header-sub">Kariakoo</span>
            </div>
          </header>
          <main className="stall-main-content">
            {nav.state === "loading" ? (
              <RoutePulse />
            ) : (
              <Suspense fallback={<RoutePulse />}>
                <div className="stall-page-wrap">
                  <Outlet />
                </div>
              </Suspense>
            )}
          </main>
          <TabBar pickupCount={held} />
        </div>
      </div>
    </>
  );
}
