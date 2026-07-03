import { useState } from 'react';
import TiltCard from '../components/TiltCard';
import UnlockModal from '../components/UnlockModal';
import { SITES } from '../data/sites';

export default function HubPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#070a12', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', top: -120, left: -100, width: 300, height: 300, borderRadius: '50%', background: '#3ba7ff22', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', top: 200, right: -120, width: 350, height: 350, borderRadius: '50%', background: '#34c47122', filter: 'blur(70px)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: '40%', width: 300, height: 300, borderRadius: '50%', background: '#ffb34722', filter: 'blur(70px)' }} />

      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '48px 20px 70px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8c98ff',
            background: '#8c98ff18', border: '1px solid #8c98ff44', borderRadius: 20, padding: '6px 16px', marginBottom: 18,
          }}>
            🚀 NEVER HIDE TECH EMPIRE
          </div>
          <h1 style={{
            color: '#fff', fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 900, margin: '0 0 14px', lineHeight: 1.15,
          }}>
            Unlock <span style={{ background: 'linear-gradient(90deg,#3ba7ff,#34c471,#ffb347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VIP Access</span><br />to Our Apps
          </h1>
          <p style={{ color: '#a7afc5', fontSize: 15.5, maxWidth: 520, margin: '0 auto' }}>
            Pay just <b style={{ color: '#ffcc33' }}>GHS 10</b> via MTN MoMo and unlock full premium features for <b>24 hours</b> — instant approval, straight to your WhatsApp.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22, marginBottom: 40,
        }}>
          {SITES.map(site => (
            <TiltCard key={site.key} site={site} onUnlock={setSelected} />
          ))}
        </div>

        <div style={{
          textAlign: 'center', color: '#8891a8', fontSize: 12.5, borderTop: '1px solid #1c2338', paddingTop: 20,
        }}>
          🔐 Payments verified manually within minutes · Never Hide Tech Empire · GHS {10} = 24H full access
        </div>
      </div>

      <UnlockModal site={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
