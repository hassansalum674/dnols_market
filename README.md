# Dnols

Shop-only marketplace for **Kariakoo, Dar es Salaam**: search nearby stock, **pay into escrow**, then get directions. Distance before pay; stall pin after pay. Inspect-and-reject at pickup.

Product name is **Dnols** on every screen (splash, tabs, 404, PWA).

## One command (`npm run dev`)

One Vite, one origin. The API starts as a child of the same command.

```bash
npm install && npm run icons && npm run dev
```

Open **http://localhost:5173** only.

| URL | What |
| --- | --- |
| `/` | Marketing landing (wordmark, thesis, **Open app**). No tabs, search, or grid. |
| `/app` | Buyer PWA — **Home · Cart · Orders · You**. PWA `start_url`. |
| `/shop` | Seller UI — **Today · Stock · Orders · Shop**. Same Vite, source in `shop/src`. |
| `/api` | Fastify (health, listings, escrow), proxied to `:8787`. |

Do **not** run `cd shop && npm run dev`. There is no port **5174**.

`scripts/dev.mjs` starts API + **one** root Vite. If `:8787` is already listening, that process is reused (no crash). Seller pages are imported from `shop/` into the root app.

`shop/` stays on disk as seller source (`shop/src` is imported by the root Vite app). Root `npm install` also installs the API (npm workspace). Do not start a second Vite in `shop/`.

Legacy shopper paths (`/cart`, `/product/:id`, `/search`, …) redirect under `/app`. `/?place=…` redirects to `/app?place=…`.

Market QR: `http://localhost:5173/app?place=place_kariakoo_dsm`

Health: `curl -s http://localhost:5173/api/health` (or `curl -s http://localhost:8787/health`).

Add to Home Screen from the browser (opens `/app`). Theme `#0D0D0D`.

Split processes if you need them: `npm run dev:api`, `npm run dev:web`. Build (buyer + seller routes): `npm run build`. Preview: `npm run preview` (API still needed on 8787).

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

Seller tabs on `/shop*`: **Today · Stock · Orders · Shop**. Landing **Sell on Dnols** and You → **Sell on Dnols** both go to `/shop`. Seller **Switch to buying** goes to `/app`.

## API contract

See [`api/README.md`](api/README.md). Unpaid listings never include lat/lng/shop name. `POST /payments/stk-push` then `POST /orders/pay` releases directions. `POST /orders/:id/handover` with PIN or `{ "action": "reject" }`.

Seller pages call **`/api`** on this origin. SKU add/edit and hours stay in `localStorage` until a seller CRUD API exists. **Demo incoming order** on `/shop/orders` is `POST /api/orders/pay` with `lst_kitenge_maxi_01`.

Flutter is **not** used for this PWA. Later: Flutter Android on the same API.
