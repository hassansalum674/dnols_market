import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
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
        name: "Dnols Shop",
        short_name: "Shop",
        description: "Stall phone app — Kariakoo pickups, stock, escrow",
        theme_color: "#0D0D0D",
        background_color: "#0D0D0D",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
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
        navigateFallbackDenylist: [/^\/assets\//, /^\/__\//, /^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "dnols-shop-api",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/cdn"),
            handler: "CacheFirst",
            options: {
              cacheName: "dnols-shop-cdn",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/picsum\.photos\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "dnols-shop-photos",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    port: 5174,
  },
});
