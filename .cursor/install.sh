#!/usr/bin/env bash
# Idempotent dependency install:
#   - root Vite app (buyer + seller routes from shop/src + marketing /)
#   - api/ Fastify (own lockfile, not a workspace; also run from root postinstall)
# shop/ source stays in git but is not installed or started as a second Vite.
# Also generates PWA icons/fonts from brand/.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> npm ci (web; postinstall installs api/)"
npm ci
echo "==> Generate icons + fonts"
npm run icons

echo "==> Install complete."
