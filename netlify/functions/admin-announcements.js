const { createClient } = require('@supabase/supabase-js');

// Admin → member announcements/notifications. Only this service-role
// function (gated by ADMIN_DELETE_SECRET, same as admin-table.js and
// delete-member.js) can create announcements or recipient rows — members
// read their own recipient rows and mark them read directly, under RLS.
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

  const { action, password } = body;

  if (!password || password !== process.env.ADMIN_DELETE_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  async function listAllAuthUsers() {
    let users = [];
    let page = 1;
    for (;;) {
      const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      if (!res.ok) throw new Error(`auth user list failed: ${res.status}`);
      const json = await res.json();
      const pageUsers = json.users || [];
      users = users.concat(pageUsers);
      if (pageUsers.length < 200) break;
      page++;
    }
    return users;
  }

  if (action === 'list_members') {
    try {
      const users = await listAllAuthUsers();
      const { data: profiles } = await sb.from('profiles').select('id, account_type');
      const accountTypeById = new Map((profiles || []).map(p => [p.id, p.account_type]));
      const members = users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || '',
        account_type: accountTypeById.get(u.id) || 'adult',
      }));
      return { statusCode: 200, body: JSON.stringify({ success: true, members }) };
    } catch (e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
  }

  if (action === 'send') {
    const { title, bodyText, type, attachments, audience, memberIds } = body;
    if (!title || !bodyText) {
      return { statusCode: 400, body: JSON.stringify({ error: 'title and body are required' }) };
    }
    const resolvedAudience = audience === 'selected' ? 'selected' : 'all';
    if (resolvedAudience === 'selected' && (!Array.isArray(memberIds) || !memberIds.length)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'memberIds required for a "selected" send' }) };
    }

    try {
      const { data: announcement, error: insertError } = await sb.from('announcements').insert([{
        title,
        body: bodyText,
        type: type || 'general',
        attachments: Array.isArray(attachments) ? attachments : [],
        audience: resolvedAudience,
        created_by: 'admin',
      }]).select().single();
      if (insertError) throw insertError;

      let targetIds;
      if (resolvedAudience === 'selected') {
        targetIds = memberIds;
      } else {
        const users = await listAllAuthUsers();
        targetIds = users.map(u => u.id);
      }

      const recipientRows = targetIds.map(id => ({ announcement_id: announcement.id, member_id: id }));
      if (recipientRows.length) {
        const { error: recipientError } = await sb.from('announcement_recipients').insert(recipientRows);
        if (recipientError) throw recipientError;
      }

      return { statusCode: 200, body: JSON.stringify({ success: true, announcementId: announcement.id, recipientCount: recipientRows.length }) };
    } catch (e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
  }

  if (action === 'list_sent') {
    try {
      const { data: announcements, error } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const { data: recipients } = await sb.from('announcement_recipients').select('announcement_id, is_read');
      const statsByAnnouncement = new Map();
      (recipients || []).forEach(r => {
        const stats = statsByAnnouncement.get(r.announcement_id) || { total: 0, read: 0 };
        stats.total += 1;
        if (r.is_read) stats.read += 1;
        statsByAnnouncement.set(r.announcement_id, stats);
      });
      const rows = (announcements || []).map(a => ({
        ...a,
        recipient_count: statsByAnnouncement.get(a.id)?.total || 0,
        read_count: statsByAnnouncement.get(a.id)?.read || 0,
      }));
      return { statusCode: 200, body: JSON.stringify({ success: true, announcements: rows }) };
    } catch (e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
};
