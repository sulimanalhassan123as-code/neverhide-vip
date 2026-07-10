import { useState } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { MOMO_NUMBER, MOMO_NAME, UNLOCK_PRICE } from '../data/sites';

// Promo/free code system completely removed.
// All access is paid GHS 10 via MoMo only.

export default function UnlockModal({ site, onClose }) {
  const [step, setStep] = useState(1); // 1=payment info, 2=submit details, 3=success
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [momoRef, setMomoRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!site) return null;

  const reset = () => { setStep(1); setName(''); setPhone(''); setMomoRef(''); setError(''); };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Enter your full name');
    if (!phone.trim() || !/^\+?\d{9,13}$/.test(phone.replace(/\s/g,''))) return setError('Enter a valid WhatsApp number');
    if (!isSupabaseReady) return setError('Service unavailable — try again shortly');
    setLoading(true);
    try {
      const { error: err } = await supabase.from('unlock_requests').insert([{
        site_key: site.key, site_name: site.name,
        full_name: name.trim(), phone: phone.trim(),
        momo_ref: momoRef.trim() || null,
        status: 'pending', created_at: new Date().toISOString(),
      }]);
      if (err) throw err;
      setStep(3);
    } catch (e) {
      setError('Something went wrong — please try again');
    } finally { setLoading(false); }
  };

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(3,6,12,0.82)', backdropFilter: 'blur(6px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18,
    }} onClick={close}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #0d1524, #080f1c)',
        border: `1px solid ${site.accent}44`, borderRadius: 24,
        padding: '28px 24px', width: '100%', maxWidth: 400,
        boxShadow: `0 24px 70px rgba(0,0,0,0.6), 0 0 0 1px ${site.accent}22`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{site.emoji}</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{site.name}</div>
              <div style={{ color: site.accent, fontSize: 11, fontWeight: 600 }}>{site.tagline}</div>
            </div>
          </div>
          <button onClick={close} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#aab', fontSize: 16, cursor: 'pointer', borderRadius: 8, width: 32, height: 32 }}>✕</button>
        </div>

        {/* Step 1: Payment info */}
        {step === 1 && (
          <>
            <div style={{
              background: `linear-gradient(135deg, ${site.accent}18, ${site.accent}08)`,
              border: `1px solid ${site.accent}33`, borderRadius: 16, padding: '18px 16px', marginBottom: 16,
            }}>
              <div style={{ color: '#c9d1e0', fontSize: 13, marginBottom: 12 }}>
                Send <b style={{ color: site.accent }}>GHS {UNLOCK_PRICE}</b> via MTN MoMo to unlock 24-hour VIP access:
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: '12px 16px',
                textAlign: 'center', fontSize: 22, fontWeight: 900, color: '#ffcc33', letterSpacing: 2, marginBottom: 8,
              }}>
                {MOMO_NUMBER}
              </div>
              <div style={{ fontSize: 12, color: '#8891a8', textAlign: 'center' }}>Account name: <b style={{ color: '#c9b98a' }}>{MOMO_NAME}</b></div>
            </div>

            {/* Perks */}
            <div style={{ marginBottom: 18 }}>
              {(site.perks || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: site.accent, fontSize: 14 }}>✓</span>
                  <span style={{ color: '#c9d1e0', fontSize: 13 }}>{p}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(2)} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14,
              background: `linear-gradient(135deg, ${site.accent}, ${site.accent}cc)`,
              color: '#050a14', cursor: 'pointer',
            }}>
              ✅ I've Sent GHS {UNLOCK_PRICE} — Continue
            </button>

            <div style={{ fontSize: 11, color: '#6670a8', textAlign: 'center', marginTop: 12 }}>
              🔐 Payment verified manually within minutes · Access delivered via WhatsApp
            </div>
          </>
        )}

        {/* Step 2: Details form */}
        {step === 2 && (
          <>
            <p style={{ color: '#b0bbd0', fontSize: 13, marginBottom: 14 }}>
              Enter your details — we'll verify your payment and message you on WhatsApp the moment access is live 👇
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <input style={inp} placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} />
              <input style={inp} placeholder="WhatsApp Number * (e.g. 0599931348)" value={phone} onChange={e => setPhone(e.target.value)} />
              <input style={inp} placeholder="MoMo Transaction Ref (optional but faster)" value={momoRef} onChange={e => setMomoRef(e.target.value)} />
            </div>
            {error && (
              <div style={{ color: '#ff6b6b', fontSize: 12.5, marginBottom: 12, background: 'rgba(255,80,80,0.1)', borderRadius: 8, padding: '8px 12px' }}>
                ⚠️ {error}
              </div>
            )}
            <button onClick={submit} disabled={loading} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14,
              background: loading ? '#333' : `linear-gradient(135deg, ${site.accent}, ${site.accent}cc)`,
              color: '#050a14', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8,
            }}>
              {loading ? '⏳ Submitting...' : '🚀 Submit for Approval'}
            </button>
            <button onClick={() => setStep(1)} style={{ width: '100%', background: 'none', border: 'none', color: '#6a7490', fontSize: 12.5, cursor: 'pointer', padding: 6 }}>
              ← Back
            </button>
          </>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h3 style={{ color: '#fff', margin: '0 0 10px', fontSize: 20 }}>Request Received!</h3>
            <p style={{ color: '#a7afc5', fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
              We're verifying your MoMo payment now. You'll receive a WhatsApp message the moment your <b style={{ color: site.accent }}>24-hour VIP access</b> is active — usually within minutes.
            </p>
            <button onClick={close} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14,
              background: `linear-gradient(135deg, ${site.accent}, ${site.accent}cc)`, color: '#050a14', cursor: 'pointer',
            }}>
              Done ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
