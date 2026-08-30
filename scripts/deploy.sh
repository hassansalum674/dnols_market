#!/usr/bin/env bash
# Deploy buyer + seller to Firebase. Run from repo root after: git pull origin main
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Git commit: $(git rev-parse --short HEAD)"
echo "==> Branch: $(git branch --show-current)"

if ! command -v firebase >/dev/null 2>&1; then
  echo "ERROR: firebase CLI not found. Run: npm install -g firebase-tools && firebase login"
  exit 1
fi

echo "==> Building buyer..."
npm run build:prod

BUYER_JS=$(ls dist/assets/index-*.js | head -1)
if ! grep -q 'header-logo' "$BUYER_JS" 2>/dev/null; then
  echo "WARNING: Build may be old — header-logo not found in $BUYER_JS"
  echo "         Run: git pull origin main"
fi

SHA=$(grep -o 'content="[^"]*"' dist/index.html | head -1 || echo "unknown")
echo "==> Buyer build stamp: $SHA"
echo "==> Buyer JS: $(basename "$BUYER_JS")"

echo "==> Deploying buyer (dnols.com)..."
firebase deploy --only hosting:buyer --project dnols-2a394

echo "==> Building seller..."
cd shop && VITE_API_URL=https://dnols-83jj.onrender.com npm run build && cd ..

echo "==> Deploying seller (shop.dnols.com)..."
firebase deploy --only hosting:shop --project dnols-2a394

echo ""
echo "DONE. Verify in browser:"
echo "  1. Open https://dnols.com"
echo "  2. View Page Source (Ctrl+U)"
echo "  3. Look for: meta name=\"dnols-build\" content=\"$(git rev-parse --short HEAD)\""
echo "  4. Hard refresh: Ctrl+Shift+R"
