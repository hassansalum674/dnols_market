# Dnols API (Kariakoo stub)

Independent Node + TypeScript + Fastify backend for the shop-only marketplace. The Vite PWA at the repo root is a separate package — this folder has its own `package.json`. Do not point the PWA `npm start` here.

Exact shop coordinates, street address, and shop name are **never** returned on listing endpoints until mock payment succeeds.

## Run

```bash
cd api
npm install
npm start
```

Dev reload: `npm run dev`

Listens on **http://localhost:8787** (override with `PORT`). JSON only. CORS defaults to `*` so Vite on `http://localhost:5173` works.

Copy `.env.example` if you want `PORT`, `HOST`, `CORS_ORIGIN`, `BUYER_LAT`, `BUYER_LNG`, `FAPIAPI_API_KEY`, `API_PUBLIC_URL`. Variables are optional; defaults match Kariakoo.

**Production (Render):** see [`docs/render.md`](../docs/render.md) — set `FAPIAPI_API_KEY` and `API_PUBLIC_URL=https://dnols-83jj.onrender.com` on the API Web Service.

```bash
curl -s http://localhost:8787/health
```

OpenAPI: [`openapi.yaml`](./openapi.yaml) and `GET /openapi.json`.

## Stable REST paths

Keep these even if the frontend uses different helper names:

| Method | Path | Notes |
|--------|------|--------|
| GET | `/health` | `{ ok: true }` |
| GET | `/places` | Mock Kariakoo `placeId`: `place_kariakoo_dsm` |
| GET | `/listings` | Query: `placeId`, `q`, `category=fashion\|electronics`, `maxDistanceMeters`, `minPrice`, `maxPrice`, `inStock`, `sort=nearest\|price_asc\|price_desc\|newest`. Optional `buyerLat`/`buyerLng` for distance (defaults to Kariakoo pin). |
| GET | `/listings/:id` | Adds `description` and `sizes` or `brand`. No coords unless `?paid=1&token=<accessToken>` after pay. |
| GET | `/cart` | In-memory. Optional header `X-Session-Id` (or `X-Cart-Id`). |
| POST | `/cart` | `{ "listingId": "...", "qty": 1 }` or `{ "items": [...] }` |
| POST | `/orders/pay` | `{ "listingIds": ["lst_..."] }` — mock mobile money **success**. Returns `orderId`, `pickupCode`, `handoverPin`, `accessToken`, then `shops[]` with `shopName`, `lat`, `lng`, `mapsHint`. |
| POST | `/orders/reserve` | Demo unpaid escrow (`reserved`) so `GET /orders/:id` can hide location. |
| GET | `/orders/:id` | Unpaid: no coordinates. Paid (`paid_held` / `handed_over`): `directions` payload. |
| POST | `/orders/:id/handover` | `{ "pin": "...." }` confirm → `handed_over`. `{ "action": "reject" }` → `rejected_refund`. |
| GET | `/trending` | In-stock SKUs for a 404 page. |

Escrow mock: **reserved → paid_held → handed_over | rejected_refund**. `POST /orders/pay` jumps to `paid_held`.

Seed: 24 SKUs (fashion + electronics) in a Kariakoo shop cluster. Distance is haversine on the server.

## Sample JSON

### Unpaid listing detail (`GET /listings/lst_kitenge_maxi_01`)

No `shopName`, street, `lat`, or `lng`:

```json
{
  "id": "lst_kitenge_maxi_01",
  "title": "Kitenge maxi dress — indigo",
  "priceTzs": 45000,
  "category": "fashion",
  "photoUrl": "https://picsum.photos/seed/dnols-kitenge-maxi/640/640",
  "distanceMeters": 76,
  "inStock": true,
  "description": "Hand-cut kitenge maxi, wrap waist. Pickup only after payment.",
  "sizes": ["S", "M", "L", "XL"],
  "locationUnlocked": false,
  "locationHint": "Exact shop name, street, and coordinates are released only after POST /orders/pay (or paid=1 with a valid access token)."
}
```

### After pay (`POST /orders/pay` then `GET /listings/:id?paid=1&token=...`)

Pay response includes location immediately. Listing unlock adds `directions`:

```json
{
  "id": "lst_kitenge_maxi_01",
  "title": "Kitenge maxi dress — indigo",
  "priceTzs": 45000,
  "category": "fashion",
  "photoUrl": "https://picsum.photos/seed/dnols-kitenge-maxi/640/640",
  "distanceMeters": 76,
  "inStock": true,
  "description": "Hand-cut kitenge maxi, wrap waist. Pickup only after payment.",
  "sizes": ["S", "M", "L", "XL"],
  "locationUnlocked": true,
  "directions": {
    "shopName": "Mama Aisha Kitenge",
    "lat": -6.82195,
    "lng": 39.27442,
    "streetAddress": "Congo St, Kariakoo",
    "mapsHint": "After payment: open Google Maps and search \"Mama Aisha Kitenge\" or pin -6.82195, 39.27442. Pickup is in Kariakoo — ask for the stall by shop name, not street number."
  }
}
```

## Frontend mapping

If the PWA talks to other path names, proxy or wrap them onto this contract. Do not change these routes without coordinating with this package.
