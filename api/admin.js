// Secure server-side admin API.
// The Supabase service_role key and admin password live ONLY here (Vercel serverless
// runtime) and are never sent to the browser bundle.

async function sb(path, opts = {}) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || `Supabase error ${r.status}`);
  }
  if (r.status === 204) return null;
  const ct = r.headers.get('content-type') || '';
  return ct.includes('json') ? r.json() : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { password, action, payload = {} } = body || {};

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  try {
    let data;
    switch (action) {
      case 'ping':
        data = true;
        break;

      case 'list_requests':
        data = await sb('unlock_requests?select=*&order=created_at.desc');
        break;

      case 'approve_request': {
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await sb(`unlock_requests?id=eq.${payload.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: 'approved', approved_at: new Date().toISOString(), expires_at }),
        });
        data = true;
        break;
      }

      case 'reject_request':
        await sb(`unlock_requests?id=eq.${payload.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: 'rejected' }),
        });
        data = true;
        break;

      case 'list_promos':
        data = await sb('promo_codes?select=*&order=created_at.desc');
        break;

      case 'create_promo':
        await sb('promo_codes', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            code: payload.code, max_uses: payload.max_uses ?? null, note: payload.note ?? null, active: true,
          }),
        });
        data = true;
        break;

      case 'toggle_promo':
        await sb(`promo_codes?id=eq.${payload.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ active: payload.active }),
        });
        data = true;
        break;

      case 'delete_promo':
        await sb(`promo_codes?id=eq.${payload.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        data = true;
        break;

      case 'list_bookings':
        data = await sb('service_bookings?select=*&order=created_at.desc');
        break;

      case 'set_booking_status':
        await sb(`service_bookings?id=eq.${payload.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: payload.status }),
        });
        data = true;
        break;

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
