#!/usr/bin/env bash
# Idempotent dependency install:
#   - root Vite app (buyer PWA + marketing /)
#   - api/ Fastify (own lockfile, not a workspace)
#   - shop/ seller Vite (own lockfile)
# Also generates PWA icons/fonts from brand/.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> npm ci (buyer)"
npm ci
echo "==> npm ci (api)"
npm ci --prefix api
echo "==> npm ci (shop)"
npm ci --prefix shop
echo "==> Generate icons + fonts"
npm run icons

echo "==> Install complete."
