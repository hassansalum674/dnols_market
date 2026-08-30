# Render deployment

Deploy the **marketplace API** (`api/`) to Render so seller photo processing and listings work in production.

## Your Render service

| Setting | Value |
|---------|--------|
| **URL** | `https://dnols-83jj.onrender.com` |
| **Repo** | `hassansalum674/dnols_market` (not the agent `dnols` repo) |
| **Root directory** | `api` |
| **Build command** | `npm install && npm run build` |
| **Start command** | `npm start` |
| **Health check** | `/health` |

> **Important:** Your current Render deploy runs the agent MVP from the `dnols` repo (`node src/server.js`). To use FAPIhub for marketplace photos, point this service at **`dnols_market`** with root directory **`api`**, or create a second Web Service for the marketplace API.

## Environment variables (Render → Environment)

Add these on the **API Web Service** (not the shop/buyer frontends):

| Key | Required | Description |
|-----|----------|-------------|
| `GEMINI_API_KEY` | Yes (AI covers) | Google AI — Imagen cover photos (`GEMINI_IMAGE_MODEL`, default `imagen-3.0-generate-002`) |
| `GROQ_API_KEY` | Recommended | Fast description assist (`GROQ_MODEL`, e.g. `llama-3.3-70b-versatile`) |
| `ANTHROPIC_API_KEY` | Optional | Claude fallback for descriptions |
| `GEMINI_MODEL` | Optional | Text fallback if Groq/Anthropic unset (default `gemini-2.0-flash`) |
| `OPENAI_API_KEY` | Optional | Alternative to Gemini/Groq if you prefer OpenAI |
| `FAPIAPI_API_KEY` | Optional | FAPIhub API key for uploaded cover background removal |
| `API_PUBLIC_URL` | Yes | `https://dnols-83jj.onrender.com` — used for CDN image URLs |
| `CORS_ORIGIN` | Recommended | `*` or your frontend origins |
| `RESEND_API_KEY` | Optional | Email (if you add transactional email) |

Do **not** put `FAPIAPI_API_KEY` in the buyer or shop PWA — it stays server-side only.

## Frontend builds

Buyer and seller PWAs call the API via `VITE_API_URL`:

```bash
# shop/.env.production and .env.production already set:
VITE_API_URL=https://dnols-83jj.onrender.com
```

Rebuild frontends after changing this value.

## Verify after deploy

```bash
curl https://dnols-83jj.onrender.com/health
# → {"ok":true,"service":"dnols-api",...}

curl -X POST https://dnols-83jj.onrender.com/photos/process \
  -F "file=@test.jpg" -F "mode=cover"
# → {"cdnUrl":"https://dnols-83jj.onrender.com/cdn/....webp",...}
```

## Local development

```bash
cd api && cp .env.example .env
# Add FAPIAPI_API_KEY locally if testing cover photos
npm run dev
```

Shop/buyer apps proxy `/api` → `localhost:8787` by default; no `VITE_API_URL` needed locally.
