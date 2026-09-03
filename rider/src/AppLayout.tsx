import { Suspense, useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CallSessionProvider } from "./components/CallSessionProvider";
import { RiderTabBar } from "./components/TabBar";
import { RoutePulse, Splash } from "./components/Splash";
import { useAuth } from "./store/auth";
import { useI18n } from "./store/i18n";

const SPLASH = "dnols.rider.splash.v2";

function splashSeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH) === "1";
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH, "1");
  } catch {
    /* ignore */
  }
}

export function AppLayout() {
  const loc = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();
  const [splash, setSplash] = useState(() => !splashSeen());
  const done = useCallback(() => {
    markSplashSeen();
    setSplash(false);
  }, []);

  const signedOut = !user;
  const isDetail = loc.pathname.startsWith("/delivery/");
  const showTabBar = !signedOut && !isDetail;

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div
        className={`app-shell app-shell--rider${signedOut ? " rider-auth" : ""}${isDetail ? " rider-detail" : ""}`}
      >
        <div className="stall-main">
          {!signedOut && (
            <header className="rider-header">
              <img
                className="rider-header-logo"
                src="/brand/logo4_submark.svg"
                alt="Dnols"
              />
              <span className="rider-header-shop">{t("defaultShop")}</span>
            </header>
          )}
          <main className="stall-main-content">
            <Suspense fallback={<RoutePulse />}>
              <div className="stall-page-wrap">
                <CallSessionProvider>
                  <Outlet />
                </CallSessionProvider>
              </div>
            </Suspense>
          </main>
          {showTabBar && <RiderTabBar />}
        </div>
      </div>
    </>
  );
}
