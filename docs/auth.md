# Sign-in (Firebase Auth)

Buyer (**dnols.com**) and seller (**seller portal**) apps use **Firebase Authentication** with:

- **Google**
- **Email / password** (sign up, sign in, forgot password)

The **rider** app (**rider.dnols.com**) uses **Phone** sign-in (SMS OTP). Enable **Phone** under Authentication → Sign-in method, and add `rider.dnols.com` to authorized domains.

> Apple Sign-in can be added later if needed.

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

## Kotlin, Groovy, and `google-services.json` (Android only)

If Firebase asks you to choose **Kotlin** or **Groovy**, or to download **`google-services.json`**, you are in the **Android app** setup flow. That is for a native Android app, **not** for dnols.com / shop.dnols.com.

| What you see | What it is | Do you need it? |
|--------------|------------|-----------------|
| **Kotlin** vs **Groovy** | How Android `build.gradle` files are written | **No** — only for native Android |
| **`google-services.json`** | Android config file (project id, api key, etc.) | **No** — do not paste this into `.env` |
| **Web app** (`</>` icon) → **Config** | `apiKey`, `authDomain`, `projectId` | **Yes** — this is what goes in `VITE_FIREBASE_*` |

`google-services.json` is **not** your API key. It is a whole Android config bundle. Inside it there is an `api_key` field, but for the Dnols **web** apps you should still use the **Web app** config from Project settings, not the JSON file.

**Correct path for Dnols:** Add app → **Web** (`</>`) → copy the three config values into `.env.production`.

## Enable sign-in providers

In Firebase Console → **Authentication** → **Sign-in method**:

### Google
1. Click **Google** → **Enable** → choose a support email → **Save**

### Email / password
1. Click **Email/Password** → enable **Email/Password** (first toggle) → **Save**
2. Optional: enable **Email link** later; the app uses email + password for now

### Apple (optional, not enabled in app yet)
Apple Sign-in is not wired up in the app right now. To enable later: Firebase Console → **Apple** → follow Apple Developer setup (Services ID, Team ID, Key ID, private key). Return URL: `https://dnols-2a394.firebaseapp.com/__/auth/handler`

## Authorized domains

**Authentication** → **Settings** → **Authorized domains** — add:

- `dnols.com`
- `shop.dnols.com` (seller portal — hosting only; not shown in public legal pages)
- `rider.dnols.com`
- `rider-seller.web.app`
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
- Sellers sign in on **shop.dnols.com** with the same Google or email account
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
