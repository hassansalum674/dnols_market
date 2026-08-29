# Firebase deploy (dnols.com)

Firebase project: **`dnols-2a394`**

| Site | Firebase target | Suggested domain |
|------|-----------------|------------------|
| Buyer marketplace | `dnols-2a394` | **https://dnols.com** |
| Seller PWA | `dnols-shop` | **https://shop.dnols.com** |

API stays on Render: **https://dnols-83jj.onrender.com**

---

## One-time setup

```bash
npm install -g firebase-tools
firebase login
firebase use dnols-2a394
```

Create the **shop** hosting site (once) in Firebase Console:

1. [Firebase Console](https://console.firebase.google.com) → project **dnols-2a394**
2. **Hosting** → **Add another site**
3. Site ID: `dnols-shop`
4. Connect custom domain: `shop.dnols.com`

`dnols.com` should already be on site `dnols-2a394` from your earlier agent app setup.

Link deploy targets (once per machine):

```bash
firebase target:apply hosting buyer dnols-2a394 --project dnols-2a394
firebase target:apply hosting shop dnols-shop --project dnols-2a394
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

For seller app, add DNS for **shop.dnols.com** in your domain registrar (Firebase Console shows the exact records):

| Type | Name | Value |
|------|------|--------|
| CNAME | `shop` | `(value from Firebase Hosting setup)` |

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
