import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { RoutePulse } from "./components/Splash";
import "./styles.css";

/** Leftover shop Vite on :5174 — do not mount the seller UI as a second website. */
if (typeof location !== "undefined" && location.port === "5174") {
  document.title = "Stop — port 5174 is dead";
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML =
      '<div style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px 24px;text-align:center;font-family:Georgia,serif;color:#fff;background:#0D0D0D">' +
      '<img src="/brand/logo6_dark.svg" alt="Dnols" width="168" style="width:168px;height:auto;max-width:none" />' +
      "<p style=\"margin:0;color:rgba(255,255,255,.87);font-size:16px;max-width:22em\">This is the old shop Vite on port 5174. Stop this process.</p>" +
      '<p style="margin:0;color:rgba(255,255,255,.55);font-size:15px;max-width:22em">From the repo root run npm run dev, then open the seller UI on 5173.</p>' +
      '<a href="http://localhost:5173/shop" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 28px;background:#1A6FD4;color:#fff;font-weight:700;text-decoration:none;border-radius:2px">Open http://localhost:5173/shop</a>' +
      "</div>";
  }
} else {
  registerSW({ immediate: true });

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Suspense fallback={<RoutePulse />}>
        <App />
      </Suspense>
    </StrictMode>,
  );
}
