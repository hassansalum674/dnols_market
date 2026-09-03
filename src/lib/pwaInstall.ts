export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const FIRST_KEY = "dnols.install.first";

let deferred: BeforeInstallPromptEvent | null = null;

export function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

export function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  return iOS && !("MSStream" in window);
}

export function initPwaInstall(): void {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event("dnols-install-ready"));
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    window.dispatchEvent(new Event("dnols-installed"));
  });
}

export function canNativeInstall(): boolean {
  return deferred != null;
}

export async function promptNativeInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  const event = deferred;
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") {
    window.dispatchEvent(new Event("dnols-installed"));
  } else {
    window.dispatchEvent(new Event("dnols-install-ready"));
  }
  return outcome;
}

export function subscribeInstallChanges(fn: () => void): () => void {
  window.addEventListener("dnols-install-ready", fn);
  window.addEventListener("dnols-installed", fn);
  return () => {
    window.removeEventListener("dnols-install-ready", fn);
    window.removeEventListener("dnols-installed", fn);
  };
}

export function isFirstVisit(): boolean {
  try {
    return localStorage.getItem(FIRST_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markFirstVisitSeen(): void {
  try {
    localStorage.setItem(FIRST_KEY, "1");
  } catch {
    /* ignore */
  }
}
