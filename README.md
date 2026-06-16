# Matval

Matval is an Icelandic meal-planning web app. It generates a weekly meal plan, builds a shopping list, and uses a backend Krónan API layer to fetch real product prices when available.

The Krónan access token must only live on the backend. Never put `KRONAN_API_TOKEN` in frontend code.

## Project Structure

- `index.html` - main static frontend and CSS
- `app.js` - frontend app state, quiz, meal plan UI, saved plans, and Krónan client calls
- `data.js` - recipes, ingredients, local fallback prices, and recipe metadata
- `server.js` - local Node server, static file serving, and Krónan API proxy/matching logic
- `api/kronan/[...path].js` - Vercel serverless API entrypoint that reuses `server.js`
- `kronan-product-mapping.js` - ingredient-to-product matching rules
- `public/` - static image/logo assets
- `tests/` - Node regression tests for Krónan matching

## Environment Variables

Create a local `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required values:

```bash
KRONAN_API_TOKEN=
KRONAN_API_BASE_URL=https://api.kronan.is
HOST=0.0.0.0
PORT=8000
```

Do not commit `.env`. It contains secrets and is ignored by git.

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Open:

```text
http://localhost:8000
```

The frontend calls relative endpoints such as `/api/kronan/match-products`. The backend adds:

```text
Authorization: AccessToken <token>
```

## Vercel Deployment

This project uses Vercel serverless functions for backend API routes.

Required Vercel environment variables:

- `KRONAN_API_TOKEN`
- `KRONAN_API_BASE_URL` set to `https://api.kronan.is`

Do not add `HOST` or `PORT` in Vercel unless you have a specific reason. Those are for local `server.js`.

API routes available on Vercel:

- `/api/kronan/match-products`
- `/api/kronan/search`
- `/api/kronan/product/:sku`
- `/api/kronan/categories`
- `/api/kronan/category/:slug/products`

The debug endpoint `/api/kronan/debug` is disabled when `NODE_ENV=production`.

## Checks

Run:

```bash
npm test
node --check app.js
node --check data.js
node --check server.js
```

## Secret Safety

- Never commit `.env`.
- Never expose `KRONAN_API_TOKEN` to frontend JavaScript.
- In production, debug auth diagnostics hide token prefixes/suffixes.
- Create a new Krónan Access Token if `/api/v1/me/` returns `403` while the token is present and the header format is correct.
