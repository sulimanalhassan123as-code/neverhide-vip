import { useState, useMemo } from 'react';
import TiltCard from '../components/TiltCard';
import UnlockModal from '../components/UnlockModal';
import BookingModal from '../components/BookingModal';
import { SITES, SERVICES } from '../data/sites';

export default function HubPage() {
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null);

  const stars = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2.5 + 0.8,
    delay: Math.random() * 5,
    dur: 2.5 + Math.random() * 3,
  })), []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 0%, #1a1200 0%, #0c0900 40%, #040302 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} className="star-particle" style={{
          top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size,
          animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
        }} />
      ))}

      {/* Orbs */}
      <div style={{ position: 'absolute', top: -140, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,204,51,0.18), transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 60, left: -120, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,150,30,0.14), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 1020, margin: '0 auto', padding: '52px 20px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            fontSize: 11.5, fontWeight: 700, letterSpacing: 2, color: '#ffdb7a',
            background: 'rgba(255,204,51,0.1)', border: '1px solid rgba(255,204,51,0.35)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 22,
          }}>
            <span>👑</span> NEVER HIDE TECH EMPIRE
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(30px, 6.5vw, 50px)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 18px', letterSpacing: -0.5 }}>
            Premium Access.<br />
            <span style={{ background: 'linear-gradient(90deg, #ffdb7a, #ffcc33, #ff9f2e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One Payment.
            </span>
          </h1>

          <p style={{ color: '#b9a878', fontSize: 16, maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.65 }}>
            Pay <b style={{ color: '#ffcc33' }}>GHS 10</b> via MTN MoMo and unlock full VIP access to any of our apps for <b>24 hours</b> — verified instantly, delivered straight to your WhatsApp.
          </p>

          {/* Trust bar */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 10 }}>
            {[['⚡', 'Instant Verification'], ['📲', 'WhatsApp Delivery'], ['🔐', 'Secure MoMo Payment'], ['🇬🇭', 'Ghana-Built']].map(([e, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#a08d5e', fontWeight: 600 }}>
                <span>{e}</span> {l}
              </div>
            ))}
          </div>
        </div>

        {/* App cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, marginBottom: 56 }}>
          {SITES.map((site, i) => (
            <TiltCard key={site.key} site={site} index={i} onUnlock={setSelected} />
          ))}
        </div>

        {/* Custom build section */}
        <div style={{
          background: 'linear-gradient(155deg, rgba(255,204,51,0.07), rgba(0,0,0,0.25))',
          border: '1px solid rgba(255,204,51,0.28)', borderRadius: 28, padding: '36px 28px',
          marginBottom: 36, textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,50,0.08), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ fontSize: 38, marginBottom: 10 }}>💎</div>
          <h2 style={{ color: '#fff', fontSize: 22, margin: '0 0 10px', fontWeight: 900 }}>Need Something Built?</h2>
          <p style={{ color: '#c9b988', fontSize: 14, maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.65 }}>
            Security sites, business apps, payment systems, custom platforms — Never Hide Tech Empire builds it for you, fast.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SERVICES.map(s => (
              <button key={s.key} onClick={() => setBooking(s)} style={{
                border: '1px solid rgba(255,204,51,0.4)', borderRadius: 14, padding: '11px 18px',
                background: 'rgba(255,204,51,0.07)', color: '#ffdb7a',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,204,51,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,204,51,0.07)'}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#7a6d4a', fontSize: 12, borderTop: '1px solid rgba(255,204,51,0.12)', paddingTop: 22, lineHeight: 1.8 }}>
          🔐 All payments manually verified · Access confirmed via WhatsApp<br />
          <b style={{ color: '#a08c56' }}>Never Hide Tech Empire</b> · GHS 10 = 24H Full VIP Access
        </div>
      </div>

      <UnlockModal site={selected} onClose={() => setSelected(null)} />
      <BookingModal service={booking} onClose={() => setBooking(null)} />
    </div>
  );
}
