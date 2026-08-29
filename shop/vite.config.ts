import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const REFUSE = `
Port 5174 is dead. This folder is seller source, not a website.

  From the repo root run:  npm run dev
  Then open:               http://localhost:5173/shop

If you see “Dnols Shop” on :5174 you started the old shop app — stop it.
`;

/** Even `npx vite` / `vite preview` in shop/ must not look like the product. */
function refuseStandaloneShop(): Plugin {
  return {
    name: "dnols-refuse-standalone-shop",
    config(_cfg, env) {
      if (env.command === "serve") {
        console.error(REFUSE);
        throw new Error(
          "Port 5174 is dead. Run npm run dev from the repo root and open http://localhost:5173/shop",
        );
      }
    },
  };
}

/** Leftover package config. Root Vite on :5173 serves `/shop` from shop/src. */
export default defineConfig({
  base: "/shop/",
  plugins: [
    refuseStandaloneShop(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      minify: false,
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icons/*.png",
        "brand/*.svg",
      ],
      manifest: {
        name: "Dnols",
        short_name: "Dnols",
        description: "Stall phone app — Kariakoo pickups, stock, escrow",
        theme_color: "#0D0D0D",
        background_color: "#0D0D0D",
        display: "standalone",
        orientation: "portrait",
        start_url: "/app",
        scope: "/",
        lang: "en",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,ico}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "dnols-api",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            urlPattern: /^https:\/\/picsum\.photos\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "dnols-photos",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  // Not 5174. Serve is refused above; if that hook is removed this still is not the product.
  server: {
    host: true,
    port: 59999,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 59999,
    strictPort: true,
  },
});
