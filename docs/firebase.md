# Firebase deploy (dnols.com)

Firebase project: **`dnols-2a394`**

| Site | Firebase target | Suggested domain |
|------|-----------------|------------------|
| Buyer marketplace | `dnols-2a394` | **https://dnols.com** |
| Seller PWA | `shop-buyer` | **https://shop.dnols.com** |

API stays on Render: **https://dnols-83jj.onrender.com**

---

## One-time setup

```bash
npm install -g firebase-tools
firebase login
firebase use dnols-2a394
```

Create the **shop** hosting site (once) in Firebase Console — yours is already **`shop-buyer`** with `shop.dnols.com` connected.

Link deploy targets (once per machine):

```bash
firebase target:apply hosting buyer dnols-2a394 --project dnols-2a394
firebase target:apply hosting shop shop-buyer --project dnols-2a394
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

### shop.dnols.com SSL ("site not safe")

If the browser warns that **shop.dnols.com** is not secure, the TLS certificate does not yet cover that hostname. Fix in Firebase Console:

1. **Hosting** → site **`shop-buyer`** → **Custom domains**
2. Open **shop.dnols.com** — status should be **Connected** with a green check
3. If it shows **Needs setup** or **Pending**, add/update the DNS record your registrar shows (usually a **CNAME** for `shop` → Firebase)
4. Wait up to 24 hours for SSL provisioning after DNS propagates
5. Remove any old A/CNAME records pointing `shop` at Render or another host — only Firebase should serve `shop.dnols.com`

Verify from your machine:

```bash
curl -sSI https://shop.dnols.com | grep -i "HTTP\|server\|x-served"
openssl s_client -connect shop.dnols.com:443 -servername shop.dnols.com </dev/null 2>/dev/null | openssl x509 -noout -subject -dates
```

The certificate **subject** must include `shop.dnols.com`.

For seller app DNS:

| Type | Name | Value |
|------|------|--------|
| CNAME | `shop` | `(value from Firebase Hosting setup for shop-buyer)` |

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
