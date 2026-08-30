# Sign-in (Firebase Auth)

Buyer (**dnols.com**) and seller (**shop.dnols.com**) apps use **Firebase Authentication** with:

- **Google**
- **Apple**
- **Email / password** (sign up, sign in, forgot password)

## How to get your Firebase keys

These are the `VITE_FIREBASE_*` values the apps read at build time.

1. Open [Firebase Console](https://console.firebase.google.com) and select project **`dnols-2a394`**
2. Click the **gear** next to *Project overview* → **Project settings**
3. Scroll to **Your apps**
4. If there is no web app yet: click **Add app** → **Web** (`</>`) → register (nickname e.g. `dnols-buyer`) → **Register app**
5. Under **SDK setup and configuration**, choose **Config** (not npm snippet)
6. Copy these three values into your env files:

| Firebase config field | Env variable |
|----------------------|--------------|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |

Example:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=dnols-2a394.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dnols-2a394
```

> The API key is safe to embed in the frontend. Security comes from Firebase **authorized domains** and **sign-in provider** settings, not from hiding the key.

## Enable sign-in providers

In Firebase Console → **Authentication** → **Sign-in method**:

### Google
1. Click **Google** → **Enable** → choose a support email → **Save**

### Apple
1. Click **Apple** → **Enable**
2. You need an [Apple Developer](https://developer.apple.com) account
3. In Apple Developer → **Certificates, Identifiers & Profiles** → **Identifiers** → your app / Services ID:
   - Enable **Sign in with Apple**
   - Add return URL: `https://dnols-2a394.firebaseapp.com/__/auth/handler`
4. Create a **Sign in with Apple** key in Apple Developer and note **Key ID** and **Team ID**
5. Paste **Services ID**, **Team ID**, **Key ID**, and upload the **private key** in Firebase Apple provider settings → **Save**

### Email / password
1. Click **Email/Password** → enable **Email/Password** (first toggle) → **Save**
2. Optional: enable **Email link** later; the app uses email + password for now

## Authorized domains

**Authentication** → **Settings** → **Authorized domains** — add:

- `dnols.com`
- `shop.dnols.com`
- `localhost` (already there for local dev)

## Environment files

**Buyer** (repo root) — `.env.production` or `.env`:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=dnols-2a394.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dnols-2a394
```

**Seller** (`shop/`) — `shop/.env.production` or `shop/.env`:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=dnols-2a394.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dnols-2a394
```

Use the **same Firebase project** for both apps so one account works on buyer and seller.

Rebuild and redeploy after adding or changing keys:

```bash
npm run build
npm run firebase:deploy
```

## Where sign-in appears in the app

| App | Routes |
|-----|--------|
| Buyer | **My Account** (`/you`), dedicated page `/signin` |
| Seller | `/signin` (plus phone fallback for existing sellers) |

Without Firebase keys, the apps still work as a guest; sign-in buttons show a setup hint pointing here.

## Escrow & user data (MVP)

- Signed-in buyers are identified for order history and pickup codes
- Payment details stay server-side; escrow status is shown in **Orders**
- Sellers sign in on **shop.dnols.com** with the same Google / Apple / email account
- Do not store card numbers in the PWA — use your payment provider on the API

## Local dev

```bash
cp .env.example .env
# Add Firebase keys + VITE_API_URL
npm run dev
```

For the seller app:

```bash
cd shop
cp .env.example .env
npm run dev
```
