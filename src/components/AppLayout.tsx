import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { HeaderSearch } from "./HeaderSearch";
import { RoutePulse, Splash } from "./Splash";
import { BuyerHeader, TabBar } from "./TabBar";

const SPLASH_KEY = "dnols.splash.session";

export function AppLayout() {
  const loc = useLocation();
  const nav = useNavigation();
  const hideTabs = loc.pathname.startsWith("/checkout");
  const shop = loc.pathname.startsWith("/shop");
  const [splash, setSplash] = useState(() => {
    try {
      return sessionStorage.getItem(SPLASH_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const done = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      /* ignore */
    }
    setSplash(false);
  }, []);

  useEffect(() => {
    const onOff = () => {
      /* layout watches online in pages */
    };
    window.addEventListener("online", onOff);
    window.addEventListener("offline", onOff);
    return () => {
      window.removeEventListener("online", onOff);
      window.removeEventListener("offline", onOff);
    };
  }, []);

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div className={`app-shell ${hideTabs ? "no-tabs" : ""}`}>
        {!shop && (
          <BuyerHeader>
            <HeaderSearch />
          </BuyerHeader>
        )}
        {shop && (
          <header className="header">
            <div className="header-row">
              <img className="header-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
              <span style={{ fontWeight: 700 }}>Shop</span>
            </div>
          </header>
        )}
        <main>
          {nav.state === "loading" ? (
            <RoutePulse />
          ) : (
            <Suspense fallback={<RoutePulse />}>
              <Outlet />
            </Suspense>
          )}
        </main>
        {!hideTabs && <TabBar />}
      </div>
    </>
  );
}
