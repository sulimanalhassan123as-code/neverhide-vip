import { useState, useEffect } from 'react';
import { adminApi } from '../lib/supabase';

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'NHE-';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function AdminPage() {
  const [pwInput, setPwInput] = useState('');
  const [pw, setPw] = useState(() => sessionStorage.getItem('vip_admin_pw') || '');
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(!!pw);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('requests'); // requests | promos | bookings
  const [requests, setRequests] = useState([]);
  const [promos, setPromos] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [bookingFilter, setBookingFilter] = useState('new');
  const [loading, setLoading] = useState(false);

  const [newCode, setNewCode] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [newNote, setNewNote] = useState('');

  // Verify stored password (if any) on mount
  useEffect(() => {
    if (!pw) { setCheckingAuth(false); return; }
    adminApi(pw, 'ping')
      .then(() => setAuthed(true))
      .catch(() => { sessionStorage.removeItem('vip_admin_pw'); setPw(''); })
      .finally(() => setCheckingAuth(false));
  }, []); // eslint-disable-line

  const login = async () => {
    setError('');
    try {
      await adminApi(pwInput, 'ping');
      sessionStorage.setItem('vip_admin_pw', pwInput);
      setPw(pwInput);
      setAuthed(true);
    } catch {
      setError('Wrong password');
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try { setRequests(await adminApi(pw, 'list_requests') || []); } finally { setLoading(false); }
  };
  const loadPromos = async () => {
    setLoading(true);
    try { setPromos(await adminApi(pw, 'list_promos') || []); } finally { setLoading(false); }
  };
  const loadBookings = async () => {
    setLoading(true);
    try { setBookings(await adminApi(pw, 'list_bookings') || []); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authed) return;
    if (tab === 'requests') loadRequests();
    else if (tab === 'promos') loadPromos();
    else loadBookings();
  }, [authed, tab]);

  const approve = async (r) => { await adminApi(pw, 'approve_request', { id: r.id }); loadRequests(); };
  const reject = async (r) => { await adminApi(pw, 'reject_request', { id: r.id }); loadRequests(); };

  const createPromo = async () => {
    const code = (newCode.trim() || genCode()).toUpperCase();
    const max_uses = newMaxUses.trim() ? parseInt(newMaxUses.trim(), 10) : null;
    await adminApi(pw, 'create_promo', { code, max_uses, note: newNote.trim() || null });
    setNewCode(''); setNewMaxUses(''); setNewNote('');
    loadPromos();
  };
  const togglePromo = async (p) => { await adminApi(pw, 'toggle_promo', { id: p.id, active: !p.active }); loadPromos(); };
  const deletePromo = async (p) => { await adminApi(pw, 'delete_promo', { id: p.id }); loadPromos(); };

  const setBookingStatus = async (b, status) => { await adminApi(pw, 'set_booking_status', { id: b.id, status }); loadBookings(); };

  const waLink = (r, approvedNow) => {
    const msg = approvedNow
      ? `Hi ${r.full_name}! 🎉 Your VIP access to ${r.site_name} is now ACTIVE for the next 24 hours. Enjoy! - Never Hide Tech Empire`
      : `Hi ${r.full_name}, following up on your VIP access request for ${r.site_name}.`;
    const phone = r.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const bookingWaLink = (b) => {
    const msg = `Hi ${b.full_name}! This is Never Hide Tech Empire following up on your ${b.service_label} request. Let's schedule a time to discuss your project.`;
    const phone = b.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  if (checkingAuth) {
    return <div style={{ minHeight: '100vh', background: '#070a12' }} />;
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#0d1220', border: '1px solid #2a3350', borderRadius: 20, padding: 30, width: '100%', maxWidth: 340, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <h2 style={{ color: '#fff', margin: '0 0 16px' }}>VIP Admin</h2>
          <input type="password" placeholder="Admin password" value={pwInput} onChange={e => setPwInput(e.target.value)}
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

  const filteredBookings = bookings.filter(b => bookingFilter === 'all' ? true : b.status === bookingFilter);
  const bCounts = { new: 0, contacted: 0, done: 0 };
  bookings.forEach(b => { if (bCounts[b.status] !== undefined) bCounts[b.status]++; });

  return (
    <div style={{ minHeight: '100vh', background: '#070a12', padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ color: '#fff', marginBottom: 4 }}>🎟️ VIP Access Admin</h2>
        <p style={{ color: '#8891a8', fontSize: 13, marginBottom: 18 }}>Approve payments, manage promo codes, and track service bookings.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setTab('requests')} style={{
            border: '1px solid #2a3350', borderRadius: 20, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 700,
            background: tab === 'requests' ? '#3ba7ff' : '#151b2c', color: tab === 'requests' ? '#08110a' : '#c9d1e0',
          }}>💳 Payment Requests</button>
          <button onClick={() => setTab('promos')} style={{
            border: '1px solid #2a3350', borderRadius: 20, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 700,
            background: tab === 'promos' ? '#34c471' : '#151b2c', color: tab === 'promos' ? '#08110a' : '#c9d1e0',
          }}>🎟️ Promo Codes</button>
          <button onClick={() => setTab('bookings')} style={{
            border: '1px solid #2a3350', borderRadius: 20, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 700,
            background: tab === 'bookings' ? '#ffcc33' : '#151b2c', color: tab === 'bookings' ? '#241804' : '#c9d1e0',
          }}>📅 Bookings</button>
        </div>

        {tab === 'requests' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {['pending', 'approved', 'rejected', 'all'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  border: '1px solid #2a3350', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
                  background: filter === f ? '#3ba7ff' : '#151b2c', color: filter === f ? '#08110a' : '#c9d1e0', fontWeight: 700,
                }}>
                  {f === 'pending' ? `⏳ Pending (${counts.pending})` : f === 'approved' ? `✅ Approved (${counts.approved})` : f === 'rejected' ? `❌ Rejected (${counts.rejected})` : `All (${requests.length})`}
                </button>
              ))}
              <button onClick={loadRequests} style={{ border: '1px solid #2a3350', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer', background: '#151b2c', color: '#c9d1e0' }}>
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
                    {r.promo_code && <span style={{ color: '#34c471' }}> · 🎟️ Code: {r.promo_code}</span>}
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
          </>
        )}

        {tab === 'promos' && (
          <>
            <div style={{ background: '#0d1220', border: '1px solid #2a3350', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 15, margin: '0 0 12px' }}>➕ Create Promo Code</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <input placeholder="Code (leave blank to auto-generate)" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                  style={{ flex: '1 1 200px', border: '1px solid #2a3350', borderRadius: 10, padding: '10px 12px', background: '#151b2c', color: '#fff', fontSize: 13.5, textTransform: 'uppercase' }} />
                <input placeholder="Max uses (blank = unlimited)" value={newMaxUses} onChange={e => setNewMaxUses(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ flex: '1 1 140px', border: '1px solid #2a3350', borderRadius: 10, padding: '10px 12px', background: '#151b2c', color: '#fff', fontSize: 13.5 }} />
              </div>
              <input placeholder="Note (e.g. Facebook giveaway July)" value={newNote} onChange={e => setNewNote(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #2a3350', borderRadius: 10, padding: '10px 12px', background: '#151b2c', color: '#fff', fontSize: 13.5, marginBottom: 12 }} />
              <button onClick={createPromo} style={{ border: 'none', borderRadius: 10, padding: '10px 18px', background: '#34c471', color: '#08110a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                🎟️ Create Code
              </button>
            </div>

            {loading && <p style={{ color: '#8891a8' }}>Loading...</p>}
            {!loading && promos.length === 0 && <p style={{ color: '#8891a8' }}>No promo codes yet — create one above.</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {promos.map(p => (
                <div key={p.id} style={{ background: '#0d1220', border: '1px solid #2a3350', borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ color: '#ffcc33', fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>{p.code}</div>
                    <div style={{ color: '#8891a8', fontSize: 12 }}>
                      Used {p.uses_count}{p.max_uses ? ` / ${p.max_uses}` : ' (unlimited)'}
                      {p.note ? ` · ${p.note}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12,
                      background: p.active ? '#34c47122' : '#ff6b6b22', color: p.active ? '#34c471' : '#ff6b6b',
                    }}>{p.active ? 'ACTIVE' : 'DISABLED'}</span>
                    <button onClick={() => togglePromo(p)} style={{ border: '1px solid #2a3350', borderRadius: 10, padding: '7px 12px', background: '#151b2c', color: '#c9d1e0', fontSize: 12, cursor: 'pointer' }}>
                      {p.active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deletePromo(p)} style={{ border: '1px solid #ff6b6b55', borderRadius: 10, padding: '7px 12px', background: 'transparent', color: '#ff6b6b', fontSize: 12, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'bookings' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {['new', 'contacted', 'done', 'all'].map(f => (
                <button key={f} onClick={() => setBookingFilter(f)} style={{
                  border: '1px solid #2a3350', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
                  background: bookingFilter === f ? '#ffcc33' : '#151b2c', color: bookingFilter === f ? '#241804' : '#c9d1e0', fontWeight: 700,
                }}>
                  {f === 'new' ? `🆕 New (${bCounts.new})` : f === 'contacted' ? `📞 Contacted (${bCounts.contacted})` : f === 'done' ? `✅ Done (${bCounts.done})` : `All (${bookings.length})`}
                </button>
              ))}
              <button onClick={loadBookings} style={{ border: '1px solid #2a3350', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer', background: '#151b2c', color: '#c9d1e0' }}>
                ↻ Refresh
              </button>
            </div>

            {loading && <p style={{ color: '#8891a8' }}>Loading...</p>}
            {!loading && filteredBookings.length === 0 && <p style={{ color: '#8891a8' }}>No bookings here.</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredBookings.map(b => (
                <div key={b.id} style={{ background: '#0d1220', border: '1px solid #2a3350', borderRadius: 16, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{b.full_name}</span>
                      <span style={{ color: '#8891a8', fontSize: 12.5, marginLeft: 8 }}>{b.phone}</span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12,
                      background: b.status === 'new' ? '#ffb34722' : b.status === 'contacted' ? '#3ba7ff22' : '#34c47122',
                      color: b.status === 'new' ? '#ffb347' : b.status === 'contacted' ? '#3ba7ff' : '#34c471',
                    }}>{b.status.toUpperCase()}</span>
                  </div>
                  <div style={{ color: '#c9d1e0', fontSize: 13, marginBottom: 4 }}>🛠️ {b.service_label}</div>
                  {b.details && <div style={{ color: '#a7afc5', fontSize: 12.5, marginBottom: 6, fontStyle: 'italic' }}>"{b.details}"</div>}
                  <div style={{ color: '#8891a8', fontSize: 11.5, marginBottom: 10 }}>
                    Requested {new Date(b.created_at).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {b.status === 'new' && (
                      <button onClick={() => setBookingStatus(b, 'contacted')} style={{ border: 'none', borderRadius: 10, padding: '8px 14px', background: '#3ba7ff', color: '#08110a', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                        📞 Mark Contacted
                      </button>
                    )}
                    {b.status !== 'done' && (
                      <button onClick={() => setBookingStatus(b, 'done')} style={{ border: 'none', borderRadius: 10, padding: '8px 14px', background: '#34c471', color: '#08110a', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                        ✅ Mark Done
                      </button>
                    )}
                    <a href={bookingWaLink(b)} target="_blank" rel="noreferrer" style={{
                      border: '1px solid #34c47155', borderRadius: 10, padding: '8px 14px', color: '#34c471', fontWeight: 700, fontSize: 12.5, textDecoration: 'none',
                    }}>
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
