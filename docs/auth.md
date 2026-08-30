# Google Sign-in (Firebase Auth)

Buyer and seller apps use **Firebase Authentication** with Google.

## One-time Firebase Console setup

1. Open [Firebase Console](https://console.firebase.google.com) → project **dnols-2a394**
2. **Authentication** → **Sign-in method** → enable **Google**
3. Add authorized domains: `dnols.com`, `shop.dnols.com`, `localhost`
4. **Project settings** → **Your apps** → Web app → copy config values

## Environment variables

Add to `.env.production` (buyer) and `shop/.env.production` (seller):

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=dnols-2a394.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dnols-2a394
```

Rebuild and redeploy after adding keys.

## Escrow & user data (MVP)

- Google sign-in identifies buyers for order history and pickup codes
- Payment details stay server-side; escrow status shown in **Orders**
- Sellers sign in separately on **shop.dnols.com** with the same Google account
- Do not store card numbers in the PWA — use your payment provider on the API

## Local dev

```bash
cp .env.example .env
# Add Firebase keys + VITE_API_URL
npm run dev
```

Without Firebase keys, the app works as a guest; the Google button shows a setup hint.
