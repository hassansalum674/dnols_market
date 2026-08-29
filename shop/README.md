# Dnols Shop (seller source)

Phone app for stall owners. **Do not start this in dev.** From the repo root:

```bash
npm run dev
```

Then open **http://localhost:5173/shop**. Root Vite imports this folder (`shop/src`) into the same app. There is no second Vite and no port 5174.

Quiet black UI, blue `#1A6FD4`, Playfair Display 400/700. Marks: `logo6_dark` splash and headers (from [`../brand/`](../brand/) / root `public/brand/`).

| URL on :5173 | Tab |
| --- | --- |
| `/shop` | Today |
| `/shop/stock` | Stock |
| `/shop/orders` | Orders |
| `/shop/profile` | Shop |

Router routes live under **`/shop`** (leftover `App.tsx` still sets `basename: "/shop"`). Seller API calls use **`/api`** on this origin.

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
