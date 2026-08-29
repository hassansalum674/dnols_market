#!/usr/bin/env node
/**
 * One command, one browser origin, one Vite.
 *
 *   npm run dev   →  http://localhost:5173
 *
 * Two processes:
 *   Fastify API     :8787   (reused if already listening)
 *   Root Vite       :5173   — buyer + seller + landing
 *
 * Vite proxies /api → :8787.
 * Seller UI is imported from shop/src (not a second Vite on :5174).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_PORT = Number(process.env.PORT ?? 8787);
const polyfill = path.join(root, "scripts/crypto-polyfill.cjs");
const kids = [];
let shuttingDown = false;

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

function hasVite(dir) {
  return fs.existsSync(path.join(dir, "node_modules/vite/bin/vite.js"));
}

function run(label, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  kids.push(child);
  child.on("error", (err) => {
    console.error(`[${label}] failed to start:`, err);
    shutdown(1);
  });
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`[${label}] exited (${reason})`);
    shutdown(code && code !== 0 ? code : 1);
  });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const k of kids) {
    if (!k.killed) k.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

if (!hasVite(root)) {
  console.error("[web] missing node_modules — run: npm install");
  process.exit(1);
}

const apiUp = await portOpen(API_PORT);
if (!apiUp) {
  const apiDir = path.join(root, "api");
  if (!fs.existsSync(path.join(apiDir, "node_modules"))) {
    console.error("[api] missing node_modules — run: cd api && npm install");
    process.exit(1);
  }
  run("api", "npm", ["run", "dev"], apiDir);
} else {
  console.log(`[api] already listening on :${API_PORT} — reusing`);
}

run("web", "node", [
  "--require",
  polyfill,
  path.join(root, "node_modules/vite/bin/vite.js"),
], root);

console.log("");
console.log("  Dnols  http://localhost:5173");
console.log("    /       marketing");
console.log("    /app    buyer PWA");
console.log("    /shop   seller (shop/src, same Vite)");
console.log("    /api    Fastify (proxied)");
console.log("  Never open :5174 — that leftover shop Vite is dead.");
console.log("");
