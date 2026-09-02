import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { store } from "./store.js";
import type { Listing, Order, Shop } from "./types.js";

type Snapshot = {
  version: 1;
  shops: Shop[];
  listings: Listing[];
  orders: Order[];
};

const dataDir =
  process.env.DNOLS_DATA_DIR ??
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../data");
const dataFile = path.join(dataDir, "store.json");

let timer: ReturnType<typeof setTimeout> | null = null;

function snapshot(): Snapshot {
  return { version: 1, ...store.snapshot() };
}

export function persistPath(): string {
  return dataFile;
}

export function hydrateStore(): void {
  if (!existsSync(dataFile)) return;
  try {
    const raw = JSON.parse(readFileSync(dataFile, "utf8")) as Partial<Snapshot>;
    if (!Array.isArray(raw.shops) || raw.shops.length === 0) return;
    if (!Array.isArray(raw.listings) || raw.listings.length === 0) return;
    store.replaceAll({
      shops: raw.shops,
      listings: raw.listings,
      orders: Array.isArray(raw.orders) ? raw.orders : [],
    });
  } catch (err) {
    console.error("dnols persist: hydrate failed", err);
  }
}

export function flushStore(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  try {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(dataFile, JSON.stringify(snapshot()), "utf8");
  } catch (err) {
    console.error("dnols persist: write failed", err);
  }
}

function schedule(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    flushStore();
  }, 250);
}

store.onDirty = schedule;
