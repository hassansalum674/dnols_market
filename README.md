# Dnols

Shop-only marketplace PWA for **Kariakoo, Dar es Salaam**: search nearby stock, **pay into escrow**, then get directions. Distance before pay; stall pin after pay. Inspect-and-reject at pickup.

Product name is **Dnols** on every screen (splash, tabs, 404, PWA).

## Run

```bash
# API (distance-only listings, STK stub, escrow)
cd api && npm install && npm run dev    # http://localhost:8787

# Buyer PWA
cd .. && npm install && npm run icons && npm run dev   # http://localhost:5173

# Optional dedicated stall app
cd shop && npm install && npm run dev   # http://localhost:5174
```

Vite proxies `/api` → `:8787`. Market QR: `http://localhost:5173/?place=place_kariakoo_dsm`

Add to Home Screen from the browser. Theme `#0D0D0D`.

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

## Buyer chrome

Tabs: **Home · Cart · Orders · You**. Search in the header. Checkout hides tabs. Shop mode: **Today · Stock · Orders · Shop**.

## API contract

See [`api/README.md`](api/README.md). Unpaid listings never include lat/lng/shop name. `POST /payments/stk-push` then `POST /orders/pay` releases directions. `POST /orders/:id/handover` with PIN or `{ "action": "reject" }`.

Flutter is **not** used for this PWA. Later: Flutter Android on the same API.
