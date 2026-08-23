const { createClient } = require('@supabase/supabase-js');

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

  const { signupId, password } = body;
  let { email } = body;

  if (!password || password !== process.env.ADMIN_DELETE_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  if (!signupId && !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'signupId or email required' }) };
  }

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // signups has no anon SELECT policy (admin.html only has the anon key),
  // so the caller can no longer look up the email itself — resolve it
  // here with the service-role client instead.
  if (signupId && !email) {
    const { data: row } = await sb.from('signups').select('email').eq('id', signupId).maybeSingle();
    email = row?.email || null;
  }

  let deletedSignup = false;
  let deletedAuthUser = false;

  if (signupId) {
    const { error, count } = await sb.from('signups').delete({ count: 'exact' }).eq('id', signupId);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: `signups delete failed: ${error.message}` }) };
    }
    deletedSignup = (count ?? 0) > 0;
  }

  if (email) {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: `auth user lookup failed: ${res.status}`, deletedSignup }) };
    }
    const { users } = await res.json();
    const match = users?.[0];
    if (match) {
      const { error } = await sb.auth.admin.deleteUser(match.id);
      if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: `auth delete failed: ${error.message}`, deletedSignup }) };
      }
      deletedAuthUser = true;
    }
  }

  return { statusCode: 200, body: JSON.stringify({ success: true, deletedSignup, deletedAuthUser }) };
};
