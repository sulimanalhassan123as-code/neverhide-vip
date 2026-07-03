import { useState, useEffect } from 'react';
import { supabaseAdmin, isSupabaseReady } from '../lib/supabase';
import { SITES } from '../data/sites';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'neverhide2024';

export default function AdminPage() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('vip_admin_ok') === '1');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('vip_admin_ok', '1');
      setAuthed(true);
    } else {
      setError('Wrong password');
    }
  };

  const load = async () => {
    if (!isSupabaseReady) return;
    setLoading(true);
    const { data } = await supabaseAdmin.from('unlock_requests').select('*').order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const approve = async (r) => {
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin.from('unlock_requests').update({ status: 'approved', approved_at: new Date().toISOString(), expires_at }).eq('id', r.id);
    load();
  };
  const reject = async (r) => {
    await supabaseAdmin.from('unlock_requests').update({ status: 'rejected' }).eq('id', r.id);
    load();
  };

  const waLink = (r, approvedNow) => {
    const site = SITES.find(s => s.key === r.site_key);
    const msg = approvedNow
      ? `Hi ${r.full_name}! 🎉 Your VIP access to ${r.site_name} is now ACTIVE for the next 24 hours. Enjoy! - Never Hide Tech Empire`
      : `Hi ${r.full_name}, following up on your VIP access request for ${r.site_name}.`;
    const phone = r.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#0d1220', border: '1px solid #2a3350', borderRadius: 20, padding: 30, width: '100%', maxWidth: 340, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <h2 style={{ color: '#fff', margin: '0 0 16px' }}>VIP Admin</h2>
          <input type="password" placeholder="Admin password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #2a3350', borderRadius: 10, padding: '12px 14px', background: '#151b2c', color: '#fff', fontSize: 14, marginBottom: 12 }} />
          {error && <p style={{ color: '#ff6b6b', fontSize: 12.5, marginBottom: 10 }}>{error}</p>}
          <button onClick={login} style={{ width: '100%', border: 'none', borderRadius: 12, padding: 13, background: '#3ba7ff', color: '#08110a', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);
  const counts = { pending: 0, approved: 0, rejected: 0 };
  requests.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

  return (
    <div style={{ minHeight: '100vh', background: '#070a12', padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ color: '#fff', marginBottom: 4 }}>🎟️ VIP Access Requests</h2>
        <p style={{ color: '#8891a8', fontSize: 13, marginBottom: 18 }}>Approve payments to instantly unlock 24H access + notify via WhatsApp.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              border: '1px solid #2a3350', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              background: filter === f ? '#3ba7ff' : '#151b2c', color: filter === f ? '#08110a' : '#c9d1e0', fontWeight: 700,
            }}>
              {f === 'pending' ? `⏳ Pending (${counts.pending})` : f === 'approved' ? `✅ Approved (${counts.approved})` : f === 'rejected' ? `❌ Rejected (${counts.rejected})` : `All (${requests.length})`}
            </button>
          ))}
          <button onClick={load} style={{ border: '1px solid #2a3350', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer', background: '#151b2c', color: '#c9d1e0' }}>
            ↻ Refresh
          </button>
        </div>

        {loading && <p style={{ color: '#8891a8' }}>Loading...</p>}
        {!loading && filtered.length === 0 && <p style={{ color: '#8891a8' }}>No requests here.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background: '#0d1220', border: '1px solid #2a3350', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{r.full_name}</span>
                  <span style={{ color: '#8891a8', fontSize: 12.5, marginLeft: 8 }}>{r.phone}</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12,
                  background: r.status === 'pending' ? '#ffb34722' : r.status === 'approved' ? '#34c47122' : '#ff6b6b22',
                  color: r.status === 'pending' ? '#ffb347' : r.status === 'approved' ? '#34c471' : '#ff6b6b',
                }}>{r.status.toUpperCase()}</span>
              </div>
              <div style={{ color: '#c9d1e0', fontSize: 13, marginBottom: 4 }}>
                🎯 {r.site_name} {r.momo_ref && <span style={{ color: '#8891a8' }}>· Ref: {r.momo_ref}</span>}
              </div>
              <div style={{ color: '#8891a8', fontSize: 11.5, marginBottom: 10 }}>
                Requested {new Date(r.created_at).toLocaleString()}
                {r.expires_at && r.status === 'approved' && ` · Expires ${new Date(r.expires_at).toLocaleString()}`}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => approve(r)} style={{ border: 'none', borderRadius: 10, padding: '8px 14px', background: '#34c471', color: '#08110a', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                      ✅ Approve
                    </button>
                    <button onClick={() => reject(r)} style={{ border: 'none', borderRadius: 10, padding: '8px 14px', background: '#ff6b6b', color: '#08110a', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                      ❌ Reject
                    </button>
                  </>
                )}
                <a href={waLink(r, r.status === 'approved')} target="_blank" rel="noreferrer" style={{
                  border: '1px solid #34c47155', borderRadius: 10, padding: '8px 14px', color: '#34c471', fontWeight: 700, fontSize: 12.5, textDecoration: 'none',
                }}>
                  💬 WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
