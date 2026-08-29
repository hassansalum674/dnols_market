#!/usr/bin/env bash
# Deploy dist/ to Firebase Hosting (dnols.com) using a service account.
# Do not use `firebase login` — OAuth on this CLI is unreliable.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

if [[ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]]; then
  echo "Set GOOGLE_APPLICATION_CREDENTIALS to the absolute path of the JSON key."
  echo "Create it in the browser:"
  echo "  https://console.firebase.google.com/project/dnols-2a394/settings/serviceaccounts/adminsdk"
  exit 1
fi

if [[ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]]; then
  echo "No file at GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"
  exit 1
fi

npm run icons
npm run build
npx --yes firebase-tools@15 deploy --only hosting --project dnols-2a394 --non-interactive
