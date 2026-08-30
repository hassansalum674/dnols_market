import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import App from "./App";
import { RoutePulse } from "./components/Splash";
import "./styles.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<RoutePulse />}>
      <App />
    </Suspense>
  </StrictMode>,
);
