#!/usr/bin/env node
/**
 * Start Fastify (api/) and Vite together so `npm run dev` is one stack.
 * Vite proxies /api → :8787.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kids = [];
let shuttingDown = false;

function run(label, command, args, cwd = root) {
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
  return child;
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

run("api", "npm", ["run", "dev"], path.join(root, "api"));
run("web", "node", [
  "--require",
  path.join(root, "scripts/crypto-polyfill.cjs"),
  path.join(root, "node_modules/vite/bin/vite.js"),
]);
