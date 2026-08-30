import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import App from "./App";
import { registerPushStub } from "./api/client";
import { initSettings } from "./store/settings";
import "./styles.css";

initSettings();

registerSW({ immediate: true });
void registerPushStub();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
