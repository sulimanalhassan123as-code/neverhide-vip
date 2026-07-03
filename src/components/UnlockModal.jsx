import { useState } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { MOMO_NUMBER, UNLOCK_PRICE } from '../data/sites';

export default function UnlockModal({ site, onClose }) {
  const [step, setStep] = useState(1); // 1 = payment info, 2 = form, 3 = success
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [momoRef, setMomoRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!site) return null;

  const submit = async () => {
    setError('');
    if (!name.trim() || !phone.trim()) { setError('Enter your name and WhatsApp number'); return; }
    if (!isSupabaseReady) { setError('Not configured yet, try again shortly'); return; }
    setLoading(true);
    const { error: err } = await supabase.from('unlock_requests').insert([{
      site_key: site.key,
      site_name: site.name,
      full_name: name.trim(),
      phone: phone.trim(),
      momo_ref: momoRef.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    }]);
    setLoading(false);
    if (err) { setError('Something went wrong, please try again'); return; }
    setStep(3);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(3,6,12,0.75)', backdropFilter: 'blur(4px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0d1220', border: `1px solid ${site.accent}55`, borderRadius: 22,
        padding: 26, width: '100%', maxWidth: 400, boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 26 }}>{site.emoji}</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>{site.name}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8891a8', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {step === 1 && (
          <>
            <div style={{ color: site.accent, fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
              🔓 Unlock 24-Hour VIP Access — GHS {UNLOCK_PRICE}
            </div>
            <div style={{ background: `${site.accent}14`, border: `1px solid ${site.accent}33`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <p style={{ color: '#e6e9f5', fontSize: 13.5, margin: '0 0 10px' }}>
                <b>Step 1.</b> Send <b>GHS {UNLOCK_PRICE}</b> via MTN MoMo to:
              </p>
              <div style={{
                background: '#111827', borderRadius: 10, padding: '10px 14px', textAlign: 'center',
                fontSize: 20, fontWeight: 800, color: '#ffcc33', letterSpacing: 1, marginBottom: 10,
              }}>
                {MOMO_NUMBER}
              </div>
              <p style={{ color: '#a7afc5', fontSize: 12, margin: 0 }}>Name on account: Never Hide Tech Empire</p>
            </div>
            <p style={{ color: '#a7afc5', fontSize: 12.5, marginBottom: 16 }}>
              <b>Step 2.</b> Fill your details next — we verify and approve within minutes and message you on WhatsApp the second it's active.
            </p>
            <button onClick={() => setStep(2)} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: 13, fontWeight: 800, fontSize: 14,
              background: site.accent, color: '#08110a', cursor: 'pointer',
            }}>
              ✅ I've Sent It — Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: '#c9d1e0', fontSize: 13, marginBottom: 14 }}>
              Enter your details so we can verify your payment and message you when it's live 👇
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              <input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              <input placeholder="WhatsApp Number * (e.g. +233XXXXXXXXX)" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
              <input placeholder="MoMo Transaction Ref (optional)" value={momoRef} onChange={e => setMomoRef(e.target.value)} style={inputStyle} />
            </div>
            {error && <p style={{ color: '#ff6b6b', fontSize: 12.5, marginBottom: 10 }}>⚠️ {error}</p>}
            <button onClick={submit} disabled={loading} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: 13, fontWeight: 800, fontSize: 14,
              background: loading ? '#555' : site.accent, color: '#08110a', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8,
            }}>
              {loading ? '⏳ Sending...' : '🚀 Submit for Approval'}
            </button>
            <button onClick={() => setStep(1)} style={{ width: '100%', background: 'none', border: 'none', color: '#8891a8', fontSize: 12.5, cursor: 'pointer', padding: 6 }}>
              ← Back
            </button>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Request Sent!</h3>
            <p style={{ color: '#a7afc5', fontSize: 13, marginBottom: 18 }}>
              We're verifying your payment now. You'll get a WhatsApp message the moment your VIP access is approved — usually within minutes.
            </p>
            <button onClick={onClose} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: 13, fontWeight: 700, fontSize: 14,
              background: site.accent, color: '#08110a', cursor: 'pointer',
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
  border: '1px solid #2a3350', borderRadius: 10, padding: '12px 14px', background: '#151b2c',
  color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
};
