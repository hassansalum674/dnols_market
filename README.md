# Dnols

Tanzania shop marketplace PWA (Vite + React + TypeScript). Quiet black UI, Kariakoo-first, walk-up pickup after pay.

Production: **https://dnols.com** (Firebase Hosting site `dnols-2a394`).

```bash
npm ci
npm run deploy    # needs `firebase login` or FIREBASE_TOKEN
```

CI: GitHub Action `.github/workflows/deploy-hosting.yml` on `main` and workflow_dispatch. Add repo secret `FIREBASE_TOKEN` (`firebase login:ci`). Hosting only — does not deploy Firestore or Functions.

## How to run

```bash
cd /home/gaula/Desktop/Dnols
npm install
npm run icons      # PNGs from brand/logo5_favicon.svg
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview
```

Optional API (port **8787**). Vite proxies `/api` → `http://localhost:8787`. Override with `VITE_API_URL`.

```bash
cd api && npm install && npm run dev
```

Add to home screen from the browser install prompt. Theme color `#0D0D0D`, name **Dnols**.
## Brand

Original marks live in [`brand/`](brand/) (do not redraw logo text):

| File | Use |
|---|---|
| `logo6_dark.svg` | Cold-start splash |
| `logo4_submark.svg` | Route pulse loader, header mark |
| `logo5_favicon.svg` | Favicon + PWA icons (generated PNGs) |
| `logo1_primary.svg` / `logo3_wordmark.svg` | Extra brand files |

Tokens: blue `#1A6FD4`, black `#0D0D0D`, white `#FFFFFF`. Type: self-hosted **Playfair Display** (latin 400 + 700, `font-display: swap`, Georgia fallback). Prices use lining + tabular numerals.

## Mocked vs real

| Surface | Behavior |
|---|---|
| Listings, search suggest, trending, product detail | Tries `GET /api/listings`, `/api/listings/:id`, `/api/search`. If the API is down or empty, uses local Kariakoo mocks (fashion + electronics). Distances are meters only. |
| Product address / lat / lng | Hidden until `paid: true` (after checkout token stored locally, or API `directions` on the listing). |
| Cart | Local only (`localStorage`). |
| Checkout pay | `POST /api/orders` when the API is up; otherwise a local paid_held stub + pickup code. |
| Orders | Merges `GET /api/orders` with locally saved checkouts. |
| Saved (You) | Local ids. |
| Shop mode `/shop` | Stub screens (Today, Stock, Orders, Shop). |
| Web Push | No-op stub (`registerPushStub`). |
| Photos | `picsum.photos` seeds (same as API seed). |

Buyer tabs are always **Home · Cart · Orders · You** (guest and signed-in). Search is the header, not a tab. Saved lives under You. Checkout hides the tab bar.
