# Deploy changes to dnols.com (READ THIS)

**Git pull does NOT update the live website.** You must deploy to Firebase.

## Why changes are not showing

| Step | What happens |
|------|----------------|
| `git pull` | Updates files on your computer only |
| `npm run deploy` | Builds + uploads to Firebase → **dnols.com updates** |

Live site check: View Source on dnols.com. Old build shows `index-BRm-9IGR.js`. New build shows `index-Das4Gmj_.js` and `dnols-build` meta tag.

---

## Option A — Deploy from your computer (fastest)

```bash
cd ~/Desktop/dnols_market
git pull origin main
npm install
npm install -g firebase-tools
firebase login
firebase use dnols-2a394
npm run deploy
```

Wait for `✔ Deploy complete!` then open dnols.com and press **Ctrl+Shift+R**.

Bottom-right corner should show `build 214a62c` (or newer).

---

## Option B — Auto-deploy via GitHub (set up once)

1. On your computer:
   ```bash
   firebase login:ci
   ```
   Copy the long token it prints.

2. Open: https://github.com/hassansalum674/dnols_market/settings/secrets/actions

3. Click **New repository secret**
   - Name: `FIREBASE_TOKEN`
   - Value: paste the token

4. Go to: https://github.com/hassansalum674/dnols_market/actions

5. Click **Deploy to Firebase** → **Run workflow**

Every future push to `main` will deploy automatically.

---

## Option C — Render (backup URLs only)

Render also hosts copies (not dnols.com unless you change DNS):

- Buyer: https://dnols-buyer.onrender.com
- Seller: https://dnols-shop.onrender.com

In Render Dashboard → **dnols-buyer** → **Manual Deploy** → Deploy latest commit.

---

## Verify deploy worked

```bash
curl -sSL https://dnols.com/ | grep -E 'dnols-build|index-'
```

You want `dnols-build` and a **new** `index-*.js` filename (not `index-BRm-9IGR.js`).
