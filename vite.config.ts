import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { execSync } from "node:child_process";

function gitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

const BUILD_SHA = gitSha();

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(BUILD_SHA),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    react(),
    {
      name: "dnols-build-stamp",
      transformIndexHtml(html) {
        return html.replace(
          "<title>Dnols</title>",
          `<title>Dnols</title>\n    <meta name="dnols-build" content="${BUILD_SHA}" />`,
        );
      },
    },
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
        name: "Dnols",
        short_name: "Dnols",
        description: "Shops you can walk to — Kariakoo and beyond",
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
        globIgnores: ["**/sw.js"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/__\//, /^\/api\//],
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
              cacheName: "dnols-api",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            urlPattern: /^https:\/\/picsum\.photos\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "dnols-photos",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
