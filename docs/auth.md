# Sign-in (Firebase Auth)

Buyer (**dnols.com**) and seller (**shop.dnols.com**) apps use **Firebase Authentication** with:

- **Google**
- **Email / password** (sign up, sign in, forgot password)

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

## Google Sign-In popup (what you see in Chrome)

When a seller taps **Continue with Google**, Firebase opens Google’s account picker in a **small popup window** (your screenshot: “Choose an account → continue to **dnols-2a394.firebaseapp.com**”). That popup **is** Google’s sign-in dialog — it is normal and secure.

Flow on **shop.dnols.com**:

1. Seller taps **Start** → Dnols shows a **sign-in modal** on your site (dark overlay).
2. Seller taps **Continue with Google** → Google popup opens on top.
3. After they pick an account, the popup closes and they continue to onboarding or add product.

If the popup is blocked, the app falls back to a full-page redirect.

---

## Step-by-step: Firebase Console (required)

### 1. Enable Google sign-in

1. Open [Firebase Console](https://console.firebase.google.com) → project **`dnols-2a394`**
2. Left menu: **Build** → **Authentication**
3. Tab: **Sign-in method**
4. Click **Google** → toggle **Enable** → pick a **Project support email** → **Save**

### 2. Authorized domains (critical)

Still in **Authentication**:

1. Tab: **Settings**
2. Section: **Authorized domains**
3. Click **Add domain** and add each of these (no `https://`):

| Domain |
|--------|
| `shop.dnols.com` |
| `dnols.com` |
| `localhost` (already there for dev) |

Without `shop.dnols.com`, Google sign-in will fail on the seller app.

### 3. Web app config (API keys for the PWA)

1. **Project settings** (gear icon) → **Your apps**
2. If no web app: **Add app** → **Web** (`</>`) → name it `dnols-seller` → **Register app**
3. Copy **apiKey**, **authDomain**, **projectId** into `shop/.env.production`:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=dnols-2a394.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dnols-2a394
```

Rebuild and redeploy the shop PWA after changing env vars.

---

## Step-by-step: Google Cloud Console (branding on the popup)

Firebase uses the same Google Cloud project. Use this to set the app name/logo on the Google account picker.

1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Top bar: select project **`dnols-2a394`** (same as Firebase)
3. Menu: **APIs & Services** → **OAuth consent screen**

### OAuth consent screen

| Step | What to do |
|------|------------|
| User type | **External** (unless you only use Google Workspace) |
| App name | **Dnols** |
| User support email | Your email |
| App logo | Upload your Dnols logo (optional; shows on Google popup) |
| App domain | `https://shop.dnols.com` and `https://dnols.com` |
| Authorized domains | `dnols.com`, `shop.dnols.com` |
| Developer contact | Your email |

**Scopes:** Firebase only needs basic profile/email — defaults are fine.

**Test users:** While app status is **Testing**, add emails of people who should sign in (e.g. `hassansalum674@gmail.com`).

**Publishing:** When ready for everyone, click **Publish app** on the consent screen.

### OAuth client (credentials)

1. **APIs & Services** → **Credentials**
2. Open **Web client (auto created by Google Service)** — Firebase creates this automatically

Check **Authorized JavaScript origins**:

```
https://shop.dnols.com
https://dnols.com
http://localhost:5173
```

Check **Authorized redirect URIs** includes:

```
https://dnols-2a394.firebaseapp.com/__/auth/handler
```

You usually **do not** need to create a new OAuth client — edit the auto-created one if origins are missing.

---

## Seller app: sign-in before selling

The seller PWA now enforces:

| Action | Sign-in required? |
|--------|-------------------|
| Browse landing page | No |
| **Start** seller onboarding | **Yes** (modal) |
| Onboarding steps | **Yes** |
| Dashboard / **Add product** | **Yes** |

Sign-in methods: **Google** or **email/password**.

---

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
