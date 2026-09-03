/* Retire the old worker URL. Cloudflare cached /sw.js as immutable, so
   installed PWAs never saw later builds. This file unregisters, clears
   caches, and reloads so the app can register /dnols-sw.js instead. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      await Promise.all(
        windows.map((client) => {
          if ("navigate" in client) return client.navigate(client.url);
          return Promise.resolve();
        }),
      );
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
