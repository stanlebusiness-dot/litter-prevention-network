const { createClient } = require('@supabase/supabase-js');

// Public, token-gated opt-out endpoint. Unlike admin-table.js,
// admin-announcements.js, and delete-member.js, this one is NOT gated by
// ADMIN_DELETE_SECRET — it's meant to be called by an anonymous member
// clicking an unsubscribe link in an email or text, with no login. The
// security model is the same as any "click to unsubscribe" link industry-
// wide: possession of the per-row unsubscribe_token (an unguessable uuid,
// see signups_unsubscribe_token_unique) is treated as sufficient consent to
// change that one row's own communication preferences. It can only ever
// write email_opt_out / sms_opt_out / opt_out_at on the matching row — it
// never deletes a row and never touches any other column, so a click here
// can't remove someone from the member count or the member list.
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

  const { token, scope, action } = body;
  if (!token || typeof token !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'token required' }) };
  }
  const resolvedScope = ['email', 'sms', 'all'].includes(scope) ? scope : 'all';
  const resolvedAction = action === 'resubscribe' ? 'resubscribe' : 'unsubscribe';
  const wantOptOut = resolvedAction === 'unsubscribe';

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const updates = { opt_out_at: wantOptOut ? new Date().toISOString() : null };
  if (resolvedScope === 'email' || resolvedScope === 'all') updates.email_opt_out = wantOptOut;
  if (resolvedScope === 'sms' || resolvedScope === 'all') updates.sms_opt_out = wantOptOut;

  const { data, error } = await sb
    .from('signups')
    .update(updates)
    .eq('unsubscribe_token', token)
    .select('id, email_opt_out, sms_opt_out');

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
  if (!data || data.length === 0) {
    return { statusCode: 404, body: JSON.stringify({ error: 'No matching member found for this link.' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      action: resolvedAction,
      scope: resolvedScope,
      email_opt_out: data[0].email_opt_out,
      sms_opt_out: data[0].sms_opt_out,
    }),
  };
};
