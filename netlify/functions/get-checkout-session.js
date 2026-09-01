const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Lets donate-success.html show the amount/email that was actually
// charged without ever handling Stripe data client-side — the secret
// key stays server-side, the browser only gets back the fields it needs.
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'session_id required' }) };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        email: session.customer_details?.email || null,
      }),
    };
  } catch (e) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Session not found' }) };
  }
};
