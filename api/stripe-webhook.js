import Stripe from 'stripe';

// Stripe webhook: on a completed checkout, grant the user Pro by calling the
// secret-gated dojo_grant_pro RPC (no service-role key in this function).
// Env (Vercel): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRO_GRANT_SECRET,
//               VITE_SUPABASE_URL (+ anon key), SUPABASE_ANON_KEY optional.
//
// IMPORTANT: Stripe signature verification needs the RAW body, so we disable
// Vercel's body parser for this route.
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) return res.status(500).json({ error: 'Stripe webhook not configured.' });

  const stripe = new Stripe(key);
  const raw = await readRaw(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (err) {
    return res.status(400).json({ error: `Signature verification failed: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const username = (s.client_reference_id || s.metadata?.username || '').toLowerCase().trim();
      if (username) await grantPro(username, s.id);
    }
  } catch (err) {
    // Log and 500 so Stripe retries, but never throw raw.
    return res.status(500).json({ error: `Grant failed: ${err?.message || 'unknown'}` });
  }

  return res.status(200).json({ received: true });
}

async function grantPro(username, sessionId) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const grant = process.env.PRO_GRANT_SECRET;
  if (!url || !anon || !grant) throw new Error('Supabase / grant secret env missing');

  const r = await fetch(`${url}/rest/v1/rpc/dojo_grant_pro`, {
    method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_username: username, p_secret: grant, p_session: sessionId }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data?.error) throw new Error(data?.error || `RPC ${r.status}`);
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
