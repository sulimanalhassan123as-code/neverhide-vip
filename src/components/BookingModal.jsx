import { useState } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';

export default function BookingModal({ service, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!service) return null;

  const close = () => {
    setName(''); setPhone(''); setDetails(''); setError(''); setDone(false);
    onClose();
  };

  const submit = async () => {
    setError('');
    if (!name.trim() || !phone.trim()) { setError('Enter your name and WhatsApp number'); return; }
    if (!isSupabaseReady) { setError('Not configured yet, try again shortly'); return; }
    setLoading(true);
    const { error: err } = await supabase.from('service_bookings').insert([{
      service_key: service.key,
      service_label: service.label,
      full_name: name.trim(),
      phone: phone.trim(),
      details: details.trim() || null,
      status: 'new',
    }]);
    setLoading(false);
    if (err) { setError('Something went wrong, please try again'); return; }
    setDone(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(5,3,1,0.8)', backdropFilter: 'blur(4px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18,
    }} onClick={close}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #1a1305, #0d0a03)', border: '1px solid rgba(255,204,51,0.4)',
        borderRadius: 22, padding: 26, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 26 }}>{service.emoji}</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>{service.label}</span>
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', color: '#a99a6e', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {!done ? (
          <>
            <p style={{ color: '#d9cfa8', fontSize: 13, marginBottom: 14 }}>
              Tell us a bit about what you need — we'll reach out on WhatsApp to schedule your build.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              <input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              <input placeholder="WhatsApp Number *" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
              <textarea placeholder="Tell us about your project (optional)" value={details} onChange={e => setDetails(e.target.value)} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {error && <p style={{ color: '#ff6b6b', fontSize: 12.5, marginBottom: 10 }}>⚠️ {error}</p>}
            <button onClick={submit} disabled={loading} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: 13, fontWeight: 800, fontSize: 14,
              background: loading ? '#555' : 'linear-gradient(135deg,#ffdb7a,#ffcc33)', color: '#241804',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? '⏳ Sending...' : '📅 Book Appointment'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Request Sent!</h3>
            <p style={{ color: '#d9cfa8', fontSize: 13, marginBottom: 18 }}>
              We'll contact you on WhatsApp shortly to schedule your {service.label.toLowerCase()}.
            </p>
            <button onClick={close} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: 13, fontWeight: 700, fontSize: 14,
              background: 'linear-gradient(135deg,#ffdb7a,#ffcc33)', color: '#241804', cursor: 'pointer',
            }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  border: '1px solid rgba(255,204,51,0.3)', borderRadius: 10, padding: '12px 14px', background: '#150f04',
  color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
};
