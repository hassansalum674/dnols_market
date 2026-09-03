import { Suspense, useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CallSessionProvider } from "./components/CallSessionProvider";
import { RoutePulse, Splash } from "./components/Splash";
import { useAuth } from "./store/auth";

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
  const { user, rider } = useAuth();
  const [splash, setSplash] = useState(() => !splashSeen());
  const done = useCallback(() => {
    markSplashSeen();
    setSplash(false);
  }, []);

  const hideChrome = !user || !rider;
  const title = loc.pathname.startsWith("/delivery/")
    ? "Delivery"
    : "Deliveries";

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div className={`app-shell app-shell--stall${hideChrome ? " rider-auth" : ""}`}>
        <div className="stall-main">
          {!hideChrome && (
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
        </div>
      </div>
    </>
  );
}
