# Seller source (`shop/`)

This folder is **not a website you start**. Root Vite imports `shop/src` and serves it at `/shop`.

```bash
# repo root — one command, one origin
npm run dev
```

Then open **http://localhost:5173/shop**.

## Port 5174 is dead

Do **not** run `npm run dev`, `npm start`, `npm run preview`, or `npx vite` in this folder. Those scripts exit with an error (Vite config refuses `serve` / `preview` too).

If you see **Dnols Shop** on `http://localhost:5174`, you started the leftover standalone shop app — **stop it**. Pull, then from the repo root: `npm run dev`. Open **5173** only (`/`, `/app`, `/shop`).

Quiet black UI, blue `#1A6FD4`, Playfair Display 400/700. In-app mark is always `logo6_dark` (wordmark). `logo5_favicon` is favicon / PWA icons only.

| URL on :5173 | Tab |
| --- | --- |
| `/shop` | Today |
| `/shop/stock` | Stock |
| `/shop/orders` | Orders |
| `/shop/profile` | Shop |

Router routes live under **`/shop`**. Seller API calls use **`/api`** on this origin. Leftover `App.tsx` still sets `basename: "/shop"` for a package entry you must not start.

This folder stays in git (package.json, src, lockfile, vite.config) so it is not a wipe. It is not a server you run.

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
