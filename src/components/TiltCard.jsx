import { useRef, useState } from 'react';

export default function TiltCard({ site, onUnlock }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 18;
    const rotateX = (0.5 - py) * 18;
    setTilt({ x: rotateX, y: rotateY });
  };

  const reset = () => { setTilt({ x: 0, y: 0 }); setHover(false); };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={reset}
      style={{
        perspective: 1000,
        WebkitPerspective: 1000,
      }}
    >
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hover ? 1.03 : 1})`,
          transition: hover ? 'transform 0.05s linear' : 'transform 0.4s ease-out',
          background: `linear-gradient(155deg, ${site.color} 0%, #0b0f1a 100%)`,
          borderRadius: 22,
          padding: 26,
          border: `1px solid ${site.accent}55`,
          boxShadow: hover
            ? `0 25px 50px -12px ${site.accent}66, 0 0 0 1px ${site.accent}33`
            : '0 10px 30px rgba(0,0,0,0.35)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 140, height: 140,
          borderRadius: '50%', background: `${site.accent}22`, filter: 'blur(20px)',
        }} />

        <div style={{ fontSize: 54, marginBottom: 10, transform: 'translateZ(40px)' }}>{site.emoji}</div>
        <h3 style={{ color: '#fff', fontSize: 22, margin: '0 0 4px', transform: 'translateZ(30px)' }}>{site.name}</h3>
        <div style={{ color: site.accent, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10, transform: 'translateZ(30px)' }}>
          {site.tagline.toUpperCase()}
        </div>
        <p style={{ color: '#c9d1e0', fontSize: 13.5, lineHeight: 1.5, marginBottom: 12, transform: 'translateZ(20px)' }}>
          {site.description}
        </p>
        <div style={{
          background: `${site.accent}18`, border: `1px solid ${site.accent}44`, borderRadius: 12,
          padding: '10px 12px', fontSize: 12, color: site.accent, marginBottom: 16, transform: 'translateZ(20px)',
        }}>
          ✨ {site.perk}
        </div>

        <div style={{ display: 'flex', gap: 8, transform: 'translateZ(50px)' }}>
          <a href={site.url} target="_blank" rel="noreferrer" style={{
            flex: 1, textAlign: 'center', padding: '11px 0', borderRadius: 12,
            border: `1px solid ${site.accent}66`, color: '#fff', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', background: 'rgba(255,255,255,0.06)',
          }}>
            Visit Free →
          </a>
          <button onClick={() => onUnlock(site)} style={{
            flex: 1.4, border: 'none', borderRadius: 12, padding: '11px 0',
            background: `linear-gradient(135deg, ${site.accent}, ${site.accent}cc)`,
            color: '#08110a', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: `0 6px 18px ${site.accent}55`,
          }}>
            🔓 Unlock 24H · GHS {10}
          </button>
        </div>
      </div>
    </div>
  );
}
