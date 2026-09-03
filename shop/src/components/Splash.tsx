import { useEffect, useState } from "react";

const LINES = [
  "Incoming pickups",
  "Confirm the handover PIN",
  "Escrow releases when they collect",
  "Your stall on the phone",
];

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
  const [i, setI] = useState(0);
  const light = document.documentElement.dataset.theme !== "dark";

  useEffect(() => {
    const rotate = window.setInterval(
      () => setI((n) => (n + 1) % LINES.length),
      2800,
    );
    const done = window.setTimeout(onDone, 3200);
    return () => {
      window.clearInterval(rotate);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      className={`splash ${light ? "splash--light" : ""}`}
      role="dialog"
      aria-label="Welcome to Dnols"
    >
      <SplashLockup />
      <p className="splash-line" key={i}>
        {LINES[i]}
      </p>
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

export function ShimmerList({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skel skel-card" />
      ))}
    </div>
  );
}
