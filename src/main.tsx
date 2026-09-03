import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "./App";
import { registerPushStub } from "./api/client";
import { initSettings } from "./store/settings";
import { initPwaInstall } from "./lib/pwaInstall";
import { retireLegacyServiceWorker } from "./lib/retireLegacySw";
import "./styles.css";

initSettings();
initPwaInstall();
void retireLegacyServiceWorker();

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      registration.update().catch(() => {});
    }
  },
});
void registerPushStub();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
