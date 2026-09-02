import { useEffect, useState } from "react";

const LINES = [
  "What's near you",
  "Make your first order",
  "Pay, then we show the way",
  "Shops you can walk to",
];

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
      <img
        className="splash-logo"
        src={light ? "/brand/logo1_primary.svg" : "/brand/logo6_dark.svg"}
        alt="Dnols"
      />
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
