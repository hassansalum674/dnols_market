# Firebase deploy (dnols.com)

Firebase project: **`dnols-2a394`**

| Site | Firebase target | Suggested domain |
|------|-----------------|------------------|
| Buyer marketplace | `dnols-2a394` | **https://dnols.com** |
| Seller PWA | `shop-buyer` | **https://shop.dnols.com** |
| Rider PWA | `rider-seller` | **https://rider.dnols.com** (`https://rider-seller.web.app`) |

API stays on Render: **https://dnols-83jj.onrender.com**

---

## One-time setup

```bash
npm install -g firebase-tools
firebase login
firebase use dnols-2a394
```

Create the **shop** hosting site (once) in Firebase Console — yours is already **`shop-buyer`** with `shop.dnols.com` connected.

The **rider** hosting site is **`rider-seller`** (`https://rider-seller.web.app`). Attach `rider.dnols.com` on that site.

Link deploy targets (once per machine):

```bash
firebase target:apply hosting buyer dnols-2a394 --project dnols-2a394
firebase target:apply hosting shop shop-buyer --project dnols-2a394
firebase target:apply hosting rider rider-seller --project dnols-2a394
```

---

## Deploy commands

### Buyer only → dnols.com

```bash
npm run firebase:deploy:buyer
```

### Seller only → shop.dnols.com

```bash
npm run firebase:deploy:shop
```

### Rider only → rider.dnols.com

```bash
npm run firebase:deploy:rider
```

The rider site is already **`rider-seller`**. Add custom domain `rider.dnols.com` on it, then `A` record `rider` → `199.36.158.100` (same as shop).

### Both

```bash
npm run firebase:deploy
```

### Manual (same thing)

```bash
# Buyer
VITE_API_URL=https://dnols-83jj.onrender.com npm run build
firebase deploy --only hosting:buyer --project dnols-2a394

# Seller
cd shop && VITE_API_URL=https://dnols-83jj.onrender.com npm run build && cd ..
firebase deploy --only hosting:shop --project dnols-2a394
```

---

## Custom domain (dnols.com)

Already connected on Firebase site `dnols-2a394`. After deploy, buyer app is live at:

- https://dnols.com
- https://dnols-2a394.web.app

### shop.dnols.com SSL ("site not safe" / "DNS request failed")

Firebase shows **"Hosting's DNS request for shop.dnols.com failed"** when it cannot finish SSL certificate minting. The site may load over HTTP but the browser warns it is not secure because the certificate does not yet include `shop.dnols.com`.

**Registrar:** Spaceship (`launch1.spaceship.net`). Use **Advanced DNS** for `dnols.com`.

#### Fix (Spaceship Advanced DNS)

**Step 1 — Remove the CNAME (if present)**

Delete any record like:

| Type | Host | Value |
|------|------|--------|
| CNAME | `shop` | `shop-buyer.web.app` |

Firebase SSL minting is more reliable with an **A record**, not a CNAME to `.web.app`.

**Step 2 — Add an A record for the subdomain**

| Type | Host | Value | TTL |
|------|------|--------|-----|
| A | `shop` | `199.36.158.100` | Automatic / 300 |

- Host must be **`shop`** only — not `shop.dnols.com`
- Do **not** add both an A record and a CNAME for `shop`

**Step 3 — Add the site ownership TXT record**

On the **shop-buyer** hosting site, Firebase may require a TXT record. Add:

| Type | Host | Value |
|------|------|--------|
| TXT | `shop` | `hosting-site=shop-buyer` |

(Your apex already has `hosting-site=dnols-2a394` for the buyer site — that is separate.)

**Step 4 — Add ACME challenge TXT if Firebase shows one**

In Firebase Console → Hosting → **shop-buyer** → Domains → click **shop.dnols.com** → if you see a TXT challenge for certificate verification, add it exactly as shown, e.g.:

| Type | Host | Value |
|------|------|--------|
| TXT | `_acme-challenge.shop` | *(paste value from Firebase)* |

**Step 5 — Retry in Firebase**

1. Wait 15–30 minutes for DNS to propagate
2. In Firebase, open **shop.dnols.com** → click **Finish** or re-open the domain wizard
3. Status should move from **Minting certificate** → **Connected**

**Step 6 — Verify**

```bash
dig shop.dnols.com A +short
# → 199.36.158.100

curl -sSI https://shop.dnols.com | head -3
# → HTTP/2 200 (no SSL error)
```

If it stays stuck after 24 hours: remove `shop.dnols.com` from Firebase Hosting, wait 10 minutes, add it again, and repeat steps 1–5 with fresh values from the wizard.

---

## Firestore (riders + deliveries) — one-time

Riders and seller **My riders** store data in **Cloud Firestore**. GitHub Actions deploys `firestore.rules` after each push to `main`.

### If CI fails with billing / 403

Log line like:

`Creating the new Firestore database (default)... HTTP Error: 403, This API method requires billing to be enabled`

means the **(default) database does not exist yet**. The CLI cannot create it on the Spark plan. Create it once in the console:

1. [Firebase Console](https://console.firebase.google.com) → project **`dnols-2a394`**
2. **Build** → **Firestore Database** → **Create database**
3. Pick a region (e.g. **eur3** or **nam5**) and start in **production mode** (rules from this repo will be deployed by CI)
4. Wait a minute, then **re-run** the **Deploy to Firebase** workflow on GitHub

Spark includes a free Firestore quota (reads/writes per day). You do **not** need Blaze for riders unless you also want Firebase Phone SMS.

After the database exists, CI runs:

`firebase deploy --only firestore:rules,firestore:indexes`

If that step still fails, hosting (buyer / shop / rider) **still deploys** — only rules are skipped until the database exists.

### Quick fix if My riders shows a database error

Your live rules may still be only `users` and `sellers`. Either:

1. **Paste rules** — Firebase Console → Firestore → **Rules** → replace with the contents of `firestore.rules` in this repo → **Publish**
2. **Or set API admin** — Render → API service → add `FIREBASE_SERVICE_ACCOUNT_JSON` (service account private key JSON, one line) → redeploy API. The API then writes riders server-side and does not depend on client rules.
3. **Re-run CI** — GitHub → Actions → **Deploy to Firebase** → Run workflow

Check API is ready: `curl https://dnols-83jj.onrender.com/health` should include `"firestoreAdmin":true` after step 2.

---

## Troubleshooting

### dnols.com still shows the old agent landing page

You are likely deploying from the wrong repo or an outdated clone. Use **`dnols_market`** (not `dnols`):

```bash
cd ~/Desktop/dnols_market   # not ~/Desktop/Dnols
git fetch origin && git reset --hard origin/main
firebase target:apply hosting buyer dnols-2a394 --project dnols-2a394
firebase target:apply hosting shop shop-buyer --project dnols-2a394
npm run firebase:deploy
```

### Cover photo "Failed to fetch"

The seller app calls `https://dnols-83jj.onrender.com/photos/process`. If that URL returns 404, Render is running the **wrong app** (old agent server). See [render.md](./render.md) — set root directory to **`api`**, repo **`dnols_market`**, then redeploy. Health check must return:

```json
{"ok":true,"service":"dnols-api"}
```

---

## Preview locally

```bash
npm run build:prod
firebase emulators:start --only hosting:buyer
```

---

## Notes

- Do **not** deploy API keys to Firebase — only static `dist/` files.
- `VITE_API_URL` is baked in at build time; rebuild after changing the API URL.
- SPA routing is handled by `firebase.json` rewrites (`**` → `/index.html`).
