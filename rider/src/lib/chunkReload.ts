const RELOAD_KEY = "dnols.rider.chunkReload";

/** After a deploy, cached tabs may request old JS chunks — reload once to pick up the new build. */
export function installChunkReloadGuard(): void {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadOnceForNewBuild();
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
          ? reason
          : "";
    if (!isStaleChunkError(message)) return;
    event.preventDefault();
    reloadOnceForNewBuild();
  });
}

function isStaleChunkError(message: string): boolean {
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  );
}

function reloadOnceForNewBuild(): void {
  try {
    if (sessionStorage.getItem(RELOAD_KEY) === "1") return;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    /* ignore */
  }
  window.location.reload();
}

export function isStaleChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return isStaleChunkError(message);
}
