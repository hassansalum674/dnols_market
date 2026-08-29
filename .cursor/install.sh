#!/usr/bin/env bash
# Idempotent dependency install for the Dnols monorepo:
#   - root Vite app (buyer PWA + seller /shop)
#   - api workspace (Fastify escrow backend)
# Also generates PWA icons/fonts from brand/.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> npm ci (root + api workspace)"
npm ci
echo "==> Generate icons + fonts"
npm run icons

echo "==> Install complete."
