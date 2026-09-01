const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const MIN_CENTS = 100;        // Stripe's own USD floor
const MAX_CENTS = 100000000;  // $1,000,000 sanity cap against junk submissions

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { amount, frequency } = body;
  const cents = Math.round(Number(amount) * 100);

  if (!Number.isFinite(cents) || cents < MIN_CENTS || cents > MAX_CENTS) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Please enter a donation amount between $1 and $1,000,000.' }) };
  }

  // Recurring giving hook: when monthly is ready, branch here on
  // frequency === 'monthly' and create the session with mode: 'subscription'
  // plus price_data.recurring: { interval: 'month' } instead of the
  // one-time 'payment' mode below — Stripe Checkout accepts both from
  // an otherwise identical session shape.
  if (frequency === 'monthly') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Monthly giving is not available yet — please choose a one-time donation.' }) };
  }

  const siteUrl = process.env.URL || `https://${event.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Donation to Litter Prevention Network' },
          unit_amount: cents,
        },
        quantity: 1,
      }],
      submit_type: 'donate',
      success_url: `${siteUrl}/donate-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/donate-cancel.html`,
    });
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
