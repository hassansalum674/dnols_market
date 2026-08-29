import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { HeaderSearch } from "./HeaderSearch";
import { RoutePulse, Splash } from "./Splash";
import { BuyerHeader, TabBar } from "./TabBar";
import { APP } from "../lib/paths";

const SPLASH_KEY = "dnols.splash.session";

function inBuyerApp(pathname: string) {
  return pathname === APP || pathname.startsWith(`${APP}/`);
}

export function AppLayout() {
  const loc = useLocation();
  const nav = useNavigation();
  const hideTabs =
    loc.pathname.startsWith(`${APP}/checkout`) ||
    loc.pathname.startsWith(`${APP}/pickup`);
  const shop = loc.pathname.startsWith("/shop");
  const showSplash = inBuyerApp(loc.pathname);
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
      {splash && showSplash && <Splash onDone={done} />}
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
