import Stripe from 'stripe';

// Creates a Stripe Checkout session for the dojo Pro upgrade. The signed-in
// username is carried in client_reference_id + metadata so the webhook knows
// who to grant Pro to. Env (Vercel project settings):
//   STRIPE_SECRET_KEY   — your Stripe secret key (sk_live_… / sk_test_…)
//   STRIPE_PRICE_ID     — a recurring or one-time Price for "Dojo Pro"
//   PUBLIC_BASE_URL     — optional; otherwise derived from the request origin

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!key || !price) {
    return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const username = String(body.username || '').toLowerCase().trim();
  if (!username) return res.status(400).json({ error: 'Missing username.' });

  const origin =
    process.env.PUBLIC_BASE_URL ||
    (req.headers.origin ? String(req.headers.origin) : `https://${req.headers.host}`);

  const stripe = new Stripe(key);
  try {
    // Recurring price → subscription; one-time → payment. Detect from the Price.
    const priceObj = await stripe.prices.retrieve(price);
    const mode = priceObj.recurring ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: username,
      metadata: { username },
      success_url: `${origin}/?pro=success`,
      cancel_url: `${origin}/?pro=cancel`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(err?.statusCode || 500).json({ error: `Stripe error: ${err?.message || 'unknown'}` });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
