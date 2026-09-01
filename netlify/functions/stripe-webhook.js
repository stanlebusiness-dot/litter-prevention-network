const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Records donations server-to-server via Stripe's webhook rather than
// trusting the browser's redirect to donate-success.html — a donor who
// closes the tab before the redirect still gets recorded here.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const signature = event.headers['stripe-signature'];
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return { statusCode: 400, body: `Webhook signature verification failed: ${e.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await sb.from('donations').insert([{
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      amount_cents: session.amount_total,
      currency: session.currency,
      donor_email: session.customer_details?.email || null,
      donor_name: session.customer_details?.name || null,
      frequency: 'one-time',
      status: session.payment_status,
    }]);

    if (error && error.code !== '23505') {
      // Stripe retries on non-2xx, so a transient DB hiccup can self-heal.
      // 23505 = unique violation on stripe_session_id, i.e. this event was
      // already recorded by an earlier delivery attempt — not an error.
      return { statusCode: 500, body: `DB insert failed: ${error.message}` };
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
