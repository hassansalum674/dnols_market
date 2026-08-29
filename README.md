# Dnols

Shop-only marketplace for **Kariakoo, Dar es Salaam**: search nearby stock, **pay into escrow**, then get directions. Distance before pay; stall pin after pay. Inspect-and-reject at pickup.

Product name is **Dnols** on every screen (splash, tabs, 404, PWA).

## One origin (`npm run dev`)

Buyer, seller, and API stay **separate packages**. One command from the repo root starts all three, and you only open **one** browser origin:

```bash
npm install
cd api && npm install && cd ..
cd shop && npm install && cd ..
npm run icons
npm run dev
```

Open **http://localhost:5173**

| URL | What | Process |
| --- | --- | --- |
| `/` | Marketing landing (wordmark, thesis, **Open app**). No tabs, search, or grid. | Buyer Vite **:5173** |
| `/app` | Buyer PWA — **Home · Cart · Orders · You**. PWA `start_url`. | Buyer Vite **:5173** |
| `/shop` | Seller UI — **Today · Stock · Orders · Shop**. | Proxied → seller Vite **:5174** |
| `/api` | Fastify (health, listings, escrow). | Proxied → API **:8787** |

`scripts/dev.mjs` starts API + shop Vite + buyer Vite **in parallel**. If `:8787` or `:5174` is already listening, that process is reused (no crash). It does **not** run `npm install` on boot.

`shop/` is still its own Vite app (source, lockfile, `vite.config.ts` stay there). Root is not an npm workspace.

Legacy shopper paths (`/cart`, `/product/:id`, `/search`, …) redirect under `/app`. `/?place=…` redirects to `/app?place=…`.

Market QR: `http://localhost:5173/app?place=place_kariakoo_dsm`

Health: `curl -s http://localhost:5173/api/health` (or `curl -s http://localhost:8787/health`).

Add to Home Screen from the browser (opens `/app`). Theme `#0D0D0D`.

Split processes if you need them: `npm run dev:api`, `npm run dev:shop`, `npm run dev:web`. Build the buyer site: `npm run build`. Preview: `npm run preview` (API still needed on 8787).

## Brand and type

Marks in [`brand/`](brand/) — do not redraw SVG text.

| File | Use |
| --- | --- |
| `logo6_dark.svg` | **Everywhere in-app**: splash, pulse loaders, headers, empty/error states |
| `logo5_favicon.svg` | Favicon + PWA icons **only** (the single place the "d" appears) |
| `logo4_submark.svg` | Reserved; not shown in the UI |
| `logo1_primary.svg` / `logo3_wordmark.svg` | Light/print leftovers |

UI rules: [`docs/ui-spec.md`](docs/ui-spec.md).

Blue `#1A6FD4`, black `#0D0D0D`. **Playfair Display** 400/700 self-hosted in `public/fonts` (`font-display: swap`). Prices: lining + tabular numerals.

## Docs (pre-code work in the plan)

- [`docs/field-research.md`](docs/field-research.md) — Kariakoo interview script + escrow vs deposit
- [`docs/paper-mvp.md`](docs/paper-mvp.md) + [`docs/paper-catalog.csv`](docs/paper-catalog.csv) — 10-shop hide-pin sheet
- [`docs/payments-legal.md`](docs/payments-legal.md) — Selcom/Pesapal, inspect-and-reject, 2h SLA
- [`docs/wedge-strategy.md`](docs/wedge-strategy.md) — Alibaba/Amazon/Temu research and the escrowed walk-up wedge (plan, not build)

## Chrome (never mixed)

Buyer tabs on `/app*`: **Home · Cart · Orders · You**. Search in the header. Checkout hides tabs.

Seller tabs on `/shop*`: **Today · Stock · Orders · Shop**. Landing **Sell on Dnols** and You → **Sell on Dnols** both go to `/shop`.

## API contract

See [`api/README.md`](api/README.md). Unpaid listings never include lat/lng/shop name. `POST /payments/stk-push` then `POST /orders/pay` releases directions. `POST /orders/:id/handover` with PIN or `{ "action": "reject" }`.

Seller pages call **`/api`** on this origin. SKU add/edit and hours stay in `localStorage` until a seller CRUD API exists. **Demo incoming order** on `/shop/orders` is `POST /api/orders/pay` with `lst_kitenge_maxi_01`.

Flutter is **not** used for this PWA. Later: Flutter Android on the same API.
