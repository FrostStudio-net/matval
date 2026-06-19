# Matval

Matval is an Icelandic meal-planning web app. It generates a weekly meal plan, builds a shopping list, and shows safe estimated grocery prices by default.

The Krónan access token must only live on the backend. Never put `KRONAN_API_TOKEN` in frontend code.

## Project Structure

- `index.html` - main static frontend and CSS
- `app.js` - frontend app state, quiz, meal plan UI, and saved plans
- `data.js` - recipes, ingredients, local fallback prices, and recipe metadata
- `server.js` - local Node server, static file serving, and Krónan API proxy/matching logic
- `pricingConfig.js` - pricing mode config (`estimated`, `cached`, `live`)
- `priceShoppingList.js` - price source facade for shopping-list pricing
- `estimatedPrices.js` - Matval fallback estimated price source
- `cachedPriceSource.js` - future cached Supabase price source
- `referencePriceSource.js` - future reference/observed price source
- `kronanPriceSource.js` - debug/admin live pricing guard
- `api/kronan-match-products.js` - Vercel serverless product matching endpoint
- `api/kronan-debug.js` - Vercel serverless debug endpoint
- `kronan-product-mapping.js` - ingredient-to-product matching rules
- `public/js/supabaseConfig.js` - public Supabase URL/anon-key config for optional auth
- `public/js/auth.js` - Supabase Auth helpers
- `public/js/cloudPlans.js` - cloud saved-plan helpers
- `supabase/schema.sql` - Supabase tables and RLS policies
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
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Do not commit `.env`. It contains secrets and is ignored by git.

## Optional Supabase Auth

Matval does not require login to generate a meal plan. Users can create plans first; localStorage remains the fallback for guests.

To enable cloud-saved plans across devices:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Google Auth in Supabase.
4. Add your public project URL and anon key in `public/js/supabaseConfig.js`.
5. Never put a Supabase service-role key in frontend code.

When logged in, `Mín plön` reads from `meal_plans`. When logged out, it reads from localStorage.

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

The frontend calls relative endpoints such as `/api/kronan-match-products`. The backend adds:

```text
Authorization: AccessToken <token>
```

Normal development flow does not call Krónan live. Live Krónan calls are reserved for `/debug/kronan` and future admin/scheduled import jobs.

## Pricing Modes

Matval uses `PRICE_MODE = "estimated"` by default in `pricingConfig.js`.

- `estimated` - use Matval fallback estimated prices only.
- `reference` - use cached/manual reference prices such as Neytandinn, ASÍ, or Nappið, falling back to estimated prices.
- `cached` - future mode for cached Supabase price snapshots, falling back to reference and estimated prices.
- `live` - debug/admin only. Never use live store APIs in normal user plan generation.

Normal quiz, result rendering, saved plans, tab switching, and price refreshes must not call live Krónan. Production should import store/reference prices into Supabase with controlled admin or scheduled jobs, then serve cached snapshots to users.

Price labels:

- `Verð frá Krónunni` only for approved Krónan-specific cached/live data.
- `Áætlað verð · verðviðmið` for reference sources such as Neytandinn, ASÍ, or Nappið if usage is technically and legally acceptable.
- `Áætlað verð` for Matval fallback estimates.
- `Verð gæti hafa breyst` for stale cached/reference data.

## Vercel Deployment

This project uses Vercel serverless functions for backend API routes.

Required Vercel environment variables:

- `KRONAN_API_TOKEN`
- `KRONAN_API_BASE_URL` set to `https://api.kronan.is`

Optional Supabase values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

For the current static frontend, also mirror the public Supabase URL and anon key in `public/js/supabaseConfig.js` before deploy.

Do not add `HOST` or `PORT` in Vercel unless you have a specific reason. Those are for local `server.js`.

API routes available on Vercel:

- `/api/kronan-match-products`
- `/api/kronan-debug`

The local development server still supports the older `/api/kronan/*` proxy routes. Vercel uses the explicit serverless files above to avoid catch-all routing issues.

The debug endpoint is disabled when `NODE_ENV=production`.

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
