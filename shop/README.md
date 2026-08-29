# Dnols Shop (seller PWA)

Phone app for stall owners. Separate from the buyer PWA at the repo root (`http://localhost:5173`). Do not mix their tab chrome.

Quiet black UI, blue `#1A6FD4`, Playfair Display 400/700 (self-hosted from the buyer font files). Marks: `logo6_dark` splash, `logo4_submark` header / pulse (from [`../brand/`](../brand/)).

## How to run (shop 5174 + API 8787)

Leave the buyer app alone. In two terminals:

```bash
# 1. Mock API
cd /home/gaula/Desktop/Dnols/api
npm install
npm run dev
# http://localhost:8787  (CORS *)
```

```bash
# 2. Seller PWA
cd /home/gaula/Desktop/Dnols/shop
npm install
npm run dev
# http://localhost:5174
```

Optional buyer alongside:

```bash
cd /home/gaula/Desktop/Dnols
npm run dev
# http://localhost:5173
```

Vite in this folder proxies **`/api` → `http://localhost:8787`**. Override with `VITE_API_URL`.

Build: `npm run build` then `npm run preview` (also port **5174**). Icons: `npm run icons`.

Add to home screen. Theme `#0D0D0D`, name **Dnols Shop**.

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
| Switch to buying | Link to `http://localhost:5173`. |

Escrow on the API: **reserved → paid_held → handed_over | rejected_refund**. Pay jumps to `paid_held`.
