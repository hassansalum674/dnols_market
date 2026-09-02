import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "./App";
import { registerPushStub } from "./api/client";
import { startBuyerLocationTracking } from "./lib/buyerLocation";
import { initSettings } from "./store/settings";
import "./styles.css";

initSettings();
startBuyerLocationTracking();

registerSW({ immediate: true });
void registerPushStub();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
