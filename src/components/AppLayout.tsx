import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
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
            <div className="shell-inner header-row">
              <BrandLogo variant="dark" className="header-wordmark" height={32} />
              <span className="header-shop-label">Shop</span>
            </div>
          </header>
        )}
        <main className="shell-main">
          {nav.state === "loading" ? (
            <RoutePulse />
          ) : (
            <Suspense fallback={<RoutePulse />}>
              <div className="shell-inner">
                <Outlet />
              </div>
            </Suspense>
          )}
        </main>
        {!hideTabs && <TabBar />}
        {!shop && (
          <p className="build-stamp" aria-hidden>
            build {typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : "dev"}
          </p>
        )}
      </div>
    </>
  );
}
