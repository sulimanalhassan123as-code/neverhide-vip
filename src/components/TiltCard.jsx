import { useRef, useState } from 'react';

export default function TiltCard({ site, onUnlock, index = 0 }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 28;
    const rotateX = (0.5 - py) * 28;
    setTilt({ x: rotateX, y: rotateY });
  };

  const reset = () => { setTilt({ x: 0, y: 0 }); setHover(false); };

  return (
    <div
      className="card-pop-in"
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={reset}
      style={{ perspective: 1200, WebkitPerspective: 1200, animationDelay: `${index * 0.12}s` }}
    >
      <div
        className={hover ? 'gold-pulse' : ''}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hover ? 1.06 : 1})`,
          transition: hover ? 'transform 0.05s linear' : 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
          background: `linear-gradient(155deg, ${site.color} 0%, #0a0603 100%)`,
          borderRadius: 24,
          padding: 26,
          border: `1.5px solid ${site.accent}66`,
          boxShadow: hover
            ? `0 30px 60px -12px ${site.accent}77, 0 0 40px rgba(255,204,51,0.25)`
            : '0 12px 34px rgba(0,0,0,0.45), 0 0 20px rgba(255,204,51,0.08)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {hover && <div className="shimmer-sweep" />}

        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: `${site.accent}22`, filter: 'blur(20px)' }} />
        <div className="sparkle-spin" style={{ position: 'absolute', top: 14, right: 16, fontSize: 18, opacity: 0.75 }}>💎</div>

        <div style={{ fontSize: 54, marginBottom: 10, transform: 'translateZ(40px)' }}>{site.emoji}</div>
        <h3 style={{ color: '#fff', fontSize: 22, margin: '0 0 4px', transform: 'translateZ(30px)' }}>{site.name}</h3>
        <div style={{ color: site.accent, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10, transform: 'translateZ(30px)' }}>
          {site.tagline.toUpperCase()}
        </div>
        <p style={{ color: '#d9cfa8', fontSize: 13.5, lineHeight: 1.5, marginBottom: 12, transform: 'translateZ(20px)' }}>
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
