# Dnols Shop (seller PWA)

Phone app for stall owners. Source stays in this folder — it is a real Vite package on port **5174**. Do not mix its tab chrome with the buyer PWA.

Quiet black UI, blue `#1A6FD4`, Playfair Display 400/700. Marks: `logo6_dark` splash and headers (from [`public/brand/`](public/brand/) / [`../brand/`](../brand/)).

## One origin (preferred)

From the **repo root**:

```bash
cd shop && npm install && cd ..
npm run dev
```

Then open **http://localhost:5173/shop** (not :5174). Root Vite proxies `/shop` → this app, including HMR. `base` is `/shop/` so assets and client routes work under that prefix. Router `basename` is `/shop`.

| URL on :5173 | Tab |
| --- | --- |
| `/shop` | Today |
| `/shop/stock` | Stock |
| `/shop/orders` | Orders |
| `/shop/profile` | Shop |

## This package alone

```bash
cd shop
npm install
npm run dev
# http://localhost:5174/shop/  (base is /shop/)
```

Vite here also proxies **`/api` → `http://127.0.0.1:8787`**. Override with `VITE_API_URL`.

Build: `npm run build` then `npm run preview` (port **5174**). Icons: `npm run icons`.

Add to home screen. Theme `#0D0D0D`, name **Dnols Shop**, `start_url` `/shop/`.

## Tabs (shop chrome)

**Today · Stock · Orders · Shop** — not the buyer Home/Cart/Orders/You set.

## Mocked vs API

| Surface | Behavior |
|---|---|
| Catalog | `GET /listings` (and `/listings/:id` unused on list). |
| SKU add/edit / notes | **Local only** (`localStorage`). No seller listing CRUD on the mock API. |
| Incoming pickups | Order ids in `localStorage` after pay. `GET /orders/:id`. |
| Handover | `POST /orders/:id/handover` with `{ pin }`. PIN comes from `POST /orders/pay` (`handoverPin` or `pickupCode`). **Seller confirm** posts that stored PIN — the API has no separate seller PIN. |
| Demo incoming | Orders tab: `POST /orders/pay` with `lst_kitenge_maxi_01`, then handover. API memory resets on restart. |
| Hours / payout | Local mock. Payout amount = handed_over totals minus stub payouts. |
| Place | `GET /places` (Kariakoo). |
| 404 in-shell | `GET /trending`. |
| Switch to buying | `/app` on the same origin. |

Escrow on the API: **reserved → paid_held → handed_over | rejected_refund**. Pay jumps to `paid_held`.
