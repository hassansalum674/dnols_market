#!/usr/bin/env bash
# Idempotent dependency install for the Dnols monorepo:
#   - root buyer PWA (Vite)
#   - api  (Fastify escrow backend)
#   - shop (seller PWA, Vite)
# Also generates PWA icons/fonts from brand/ for the buyer and shop apps.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> Buyer PWA (root): npm ci"
npm ci
echo "==> Buyer PWA: generate icons + fonts"
npm run icons

echo "==> API: npm ci"
( cd api && npm ci )

echo "==> Shop PWA: npm ci + generate icons"
( cd shop && npm ci && npm run icons )

echo "==> Install complete."
