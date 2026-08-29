#!/usr/bin/env bash
# Idempotent dependency install:
#   - root Vite app (buyer + seller routes from shop/src + marketing /)
#   - api/ Fastify (own lockfile, not a workspace)
# shop/ source stays in git but is not installed or started as a second Vite.
# Also generates PWA icons/fonts from brand/.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> npm ci (web)"
npm ci
echo "==> npm ci (api)"
npm ci --prefix api
echo "==> Generate icons + fonts"
npm run icons

echo "==> Install complete."
