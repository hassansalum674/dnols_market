import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "./App";
import { RoutePulse } from "./components/Splash";
import { installChunkReloadGuard } from "./lib/chunkReload";
import "./styles.css";

installChunkReloadGuard();

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      registration.update().catch(() => {});
    }
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<RoutePulse />}>
      <App />
    </Suspense>
  </StrictMode>,
);
