import { useEffect } from "react";

const LINE = "What's near you";

const NOLS = ["n", "o", "l", "s"] as const;

function SplashLockup() {
  return (
    <div className="splash-lockup" aria-hidden="true">
      <span className="splash-badge">
        <svg className="splash-ring" viewBox="0 0 80 80">
          <circle className="splash-ring-track" cx="40" cy="40" r="36" />
          <circle
            className="splash-ring-arc"
            cx="40"
            cy="40"
            r="36"
            pathLength="100"
          />
        </svg>
        <span className="splash-badge-fill">d</span>
      </span>
      <span className="splash-nols">
        {NOLS.map((ch) => (
          <span key={ch} className="splash-letter">
            {ch}
          </span>
        ))}
      </span>
    </div>
  );
}

export function Splash({ onDone }: { onDone: () => void }) {
  const light = document.documentElement.dataset.theme !== "dark";

  useEffect(() => {
    const done = window.setTimeout(onDone, 6200);
    return () => window.clearTimeout(done);
  }, [onDone]);

  return (
    <div
      className={`splash ${light ? "splash--light" : ""}`}
      role="dialog"
      aria-label="Welcome to Dnols"
    >
      <SplashLockup />
      <p className="splash-line">{LINE}</p>
    </div>
  );
}

export function RoutePulse() {
  return (
    <div className="route-pulse" aria-hidden>
      <img src="/brand/logo4_submark.svg" alt="" />
    </div>
  );
}
