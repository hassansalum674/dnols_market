function workerPath(worker: ServiceWorker | null | undefined): string {
  if (!worker) return "";
  try {
    return new URL(worker.scriptURL).pathname;
  } catch {
    return "";
  }
}

/** Drop the Cloudflare-cached /sw.js registration so /dnols-sw.js can take over. */
export async function retireLegacyServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  let dropped = false;
  for (const reg of regs) {
    const paths = [reg.active, reg.waiting, reg.installing].map(workerPath);
    if (!paths.includes("/sw.js")) continue;
    dropped = true;
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await reg.unregister();
  }
  if (dropped) {
    try {
      if (sessionStorage.getItem("dnols.retired-sw") === "1") return;
      sessionStorage.setItem("dnols.retired-sw", "1");
    } catch {
      return;
    }
    location.reload();
  }
}
