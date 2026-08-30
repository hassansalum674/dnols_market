#!/usr/bin/env bash
# Deploy buyer + seller (embedded at /sell) to Firebase. Run from repo root after: git pull origin main
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Git commit: $(git rev-parse --short HEAD)"
echo "==> Branch: $(git branch --show-current)"

if ! command -v firebase >/dev/null 2>&1; then
  echo "ERROR: firebase CLI not found. Run: npm install -g firebase-tools && firebase login"
  exit 1
fi

echo "==> Building buyer + seller (dnols.com/sell)..."
npm run build:prod

BUYER_JS=$(ls dist/assets/index-*.js | head -1)
SHA=$(grep -o 'content="[^"]*"' dist/index.html | head -1 || echo "unknown")
echo "==> Buyer build stamp: $SHA"
echo "==> Buyer JS: $(basename "$BUYER_JS")"
test -f dist/sell/index.html && echo "==> Seller bundle: dist/sell/ OK"

echo "==> Deploying dnols.com (buyer + /sell)..."
firebase deploy --only hosting:buyer,hosting:shop --project dnols-2a394

echo ""
echo "DONE. Verify:"
echo "  https://dnols.com"
echo "  https://dnols.com/sell"
echo "  https://shop.dnols.com → redirects to /sell"
