import { useEffect, useState } from "react";

const LINES = [
  "Incoming pickups",
  "Confirm the handover PIN",
  "Escrow releases when they collect",
  "Your stall on the phone",
];

export function Splash({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);

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
    <div className="splash" role="dialog" aria-label="Welcome to Dnols">
      <img className="splash-logo" src="/brand/logo6_dark.svg" alt="Dnols" />
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
