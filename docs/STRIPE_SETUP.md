# Dojo Pro — Stripe setup

The code is wired and live. To turn on real payments, add these in **Vercel →
Project → Settings → Environment Variables**, then redeploy.

## 1. Create the product
In the Stripe Dashboard → Products → add **"Dojo Pro"** with a price
(recurring monthly or one-time — both work). Copy its **Price ID** (`price_…`).

## 2. Environment variables (Vercel)

| Variable | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (`sk_live_…` or `sk_test_…`) |
| `STRIPE_PRICE_ID` | The Price ID from step 1 (`price_…`) |
| `STRIPE_WEBHOOK_SECRET` | From step 3 (`whsec_…`) |
| `PRO_GRANT_SECRET` | Must match `dojo_config.pro_grant_secret` in the DB. Read it with `select value from dojo_config where key='pro_grant_secret';` (or rotate both together). Never commit the literal value. |
| `SUPABASE_ANON_KEY` | The publishable key (same one the client uses) |

`VITE_SUPABASE_URL` is already set; the webhook reuses it. `PUBLIC_BASE_URL` is
optional (auto-derived from the request).

## 3. Register the webhook
Stripe → Developers → Webhooks → **Add endpoint**:
- URL: `https://dojoroc-dojoroc.vercel.app/api/stripe-webhook`
- Events: **`checkout.session.completed`**
- Copy the **Signing secret** (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

## How it flows
1. User taps **Go Pro** → `POST /api/checkout` creates a Checkout Session
   (carrying their username) → redirect to Stripe.
2. They pay → Stripe calls `POST /api/stripe-webhook` → signature verified →
   `dojo_grant_pro(username, PRO_GRANT_SECRET)` sets `data.pro = true`.
3. They land on `/?pro=success` → the app polls `refresh()` and Pro unlocks.

## Security notes
- No service-role key is used anywhere. Pro is granted only through the
  secret-gated `dojo_grant_pro` RPC; the secret lives in the private
  `dojo_config` table (RLS on, no policies) and in the webhook's env.
- The webhook verifies Stripe's signature on the raw body before granting.
- To rotate the grant secret: update `dojo_config.pro_grant_secret` and the
  `PRO_GRANT_SECRET` env together.

## Toggle the UI
Premium UI is on by default. Set `VITE_PREMIUM=0` to hide the Go Pro banner and
ungate the legendary Rocs (fully free again).
