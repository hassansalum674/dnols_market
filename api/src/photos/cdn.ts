import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data/cdn");

export async function ensureCdnDir(): Promise<void> {
  await mkdir(ROOT, { recursive: true });
}

export function cdnPath(id: string): string {
  return path.join(ROOT, `${id}.webp`);
}

export async function saveCdnWebp(buffer: Buffer): Promise<string> {
  await ensureCdnDir();
  const id = createHash("sha256")
    .update(randomBytes(8))
    .update(buffer)
    .digest("hex")
    .slice(0, 24);
  const file = cdnPath(id);
  await writeFile(file, buffer);
  return id;
}

export async function readCdnWebp(id: string): Promise<Buffer | null> {
  const safe = id.replace(/[^a-f0-9]/gi, "");
  if (!safe) return null;
  try {
    return await readFile(cdnPath(safe));
  } catch {
    return null;
  }
}

export function cdnUrl(id: string, baseUrl = ""): string {
  const prefix = baseUrl.replace(/\/$/, "");
  return `${prefix}/cdn/${id}.webp`;
}
