import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const firebaseRoot = path.dirname(
  createRequire(import.meta.url).resolve("firebase/package.json"),
);

export default defineConfig({
  resolve: {
    // Rider npm ci installs its own firebase; shared/ lives at repo root.
    // One copy so collection(db) does not fail instanceof Firestore.
    alias: { firebase: firebaseRoot },
    dedupe: ["firebase"],
  },
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth", "firebase/firestore"],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      filename: "dnols-sw.js",
      minify: false,
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icons/*.png",
        "brand/*.svg",
      ],
      manifest: {
        name: "Dnols Rider",
        short_name: "Rider",
        description: "Deliver Kariakoo orders for Dnols sellers",
        theme_color: "#ffffff",
        background_color: "#ffffff",
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
            urlPattern: ({ url }) => url.pathname.startsWith("/__/"),
            handler: "NetworkOnly",
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "dnols-rider-api",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    port: 5175,
  },
});
