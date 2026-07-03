import { useState, useMemo } from 'react';
import TiltCard from '../components/TiltCard';
import UnlockModal from '../components/UnlockModal';
import BookingModal from '../components/BookingModal';
import { SITES, SERVICES } from '../data/sites';

export default function HubPage() {
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null);

  const stars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
  })), []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #241804 0%, #100c04 45%, #050403 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {stars.map(s => (
        <div key={s.id} className="star-particle" style={{
          top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`,
        }} />
      ))}

      <div className="float-orb" style={{ position: 'absolute', top: -120, left: -100, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,204,51,0.22), transparent 70%)', filter: 'blur(60px)' }} />
      <div className="float-orb" style={{ position: 'absolute', top: 220, right: -130, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,40,0.2), transparent 70%)', filter: 'blur(70px)', animationDelay: '1.5s' }} />
      <div className="float-orb" style={{ position: 'absolute', bottom: -110, left: '38%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,224,130,0.18), transparent 70%)', filter: 'blur(70px)', animationDelay: '3s' }} />

      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '48px 20px 70px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#ffdb7a',
            background: 'rgba(255,204,51,0.12)', border: '1px solid rgba(255,204,51,0.4)', borderRadius: 20, padding: '6px 16px', marginBottom: 18,
          }}>
            👑 NEVER HIDE TECH EMPIRE
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 6vw, 46px)', fontWeight: 900, margin: '0 0 14px', lineHeight: 1.15 }}>
            Unlock <span style={{ background: 'linear-gradient(90deg,#ffdb7a,#ffcc33,#ffb347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VIP Access</span><br />to Our Apps
          </h1>
          <p style={{ color: '#c9b98a', fontSize: 15.5, maxWidth: 520, margin: '0 auto' }}>
            Pay just <b style={{ color: '#ffcc33' }}>GHS 10</b> via MTN MoMo and unlock full premium features for <b>24 hours</b> — instant approval, straight to your WhatsApp.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22, marginBottom: 48 }}>
          {SITES.map((site, i) => (
            <TiltCard key={site.key} site={site} index={i} onUnlock={setSelected} />
          ))}
        </div>

        <div style={{
          background: 'linear-gradient(155deg, rgba(255,204,51,0.08), rgba(0,0,0,0.3))',
          border: '1px solid rgba(255,204,51,0.35)', borderRadius: 26, padding: '32px 26px', marginBottom: 30,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>💎</div>
          <h2 style={{ color: '#fff', fontSize: 24, margin: '0 0 8px', fontWeight: 800 }}>Need a Custom Build?</h2>
          <p style={{ color: '#d9cfa8', fontSize: 14, maxWidth: 480, margin: '0 auto 22px' }}>
            Book a security site, business website, payment system, or any custom app — Never Hide Tech Empire builds it for you.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SERVICES.map(s => (
              <button key={s.key} onClick={() => setBooking(s)} style={{
                border: '1px solid rgba(255,204,51,0.5)', borderRadius: 16, padding: '12px 18px',
                background: 'rgba(255,204,51,0.08)', color: '#ffdb7a', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
              }}>
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#a99a6e', fontSize: 12.5, borderTop: '1px solid rgba(255,204,51,0.15)', paddingTop: 20 }}>
          🔐 Payments verified manually within minutes · Never Hide Tech Empire · GHS {10} = 24H full access
        </div>
      </div>

      <UnlockModal site={selected} onClose={() => setSelected(null)} />
      <BookingModal service={booking} onClose={() => setBooking(null)} />
    </div>
  );
}
