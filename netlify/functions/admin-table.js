const { createClient } = require('@supabase/supabase-js');

// Service-role-backed reads/writes for admin.html on tables whose RLS
// policies deliberately do NOT allow anon SELECT (signups, volunteers —
// both hold real members'/volunteers' names and emails). admin.html's
// password gate is client-side only, so anything it needs to read that
// anon can't see has to go through a server function like this one,
// gated by the same secret as delete-member.js.
const ALLOWED_TABLES = ['signups', 'volunteers'];

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

  const { action, table, id, updates, password } = body;

  if (!password || password !== process.env.ADMIN_DELETE_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  if (!ALLOWED_TABLES.includes(table)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid table' }) };
  }

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (action === 'list') {
    const { data, error } = await sb.from(table).select('*').order('created_at', { ascending: false });
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true, rows: data }) };
  }

  if (action === 'get') {
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id required' }) };
    const { data, error } = await sb.from(table).select('*').eq('id', id).single();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true, row: data }) };
  }

  if (action === 'update') {
    if (!id || !updates) return { statusCode: 400, body: JSON.stringify({ error: 'id and updates required' }) };
    const { error } = await sb.from(table).update(updates).eq('id', id);
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (action === 'delete') {
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id required' }) };
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
};
