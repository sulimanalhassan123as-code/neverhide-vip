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
    setTilt({ x: (0.5 - py) * 22, y: (px - 0.5) * 22 });
  };

  const reset = () => { setTilt({ x: 0, y: 0 }); setHover(false); };

  return (
    <div
      className="card-pop-in"
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={reset}
      style={{ perspective: 1100, WebkitPerspective: 1100, animationDelay: `${index * 0.12}s` }}
    >
      <div
        className={hover ? 'gold-pulse' : ''}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hover ? 1.05 : 1})`,
          transition: hover ? 'transform 0.05s linear' : 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
          background: `linear-gradient(160deg, ${site.color} 0%, #060402 100%)`,
          borderRadius: 24, padding: '28px 24px',
          border: `1.5px solid ${site.accent}55`,
          boxShadow: hover
            ? `0 28px 55px -10px ${site.accent}66, 0 0 35px rgba(255,204,51,0.18)`
            : '0 10px 30px rgba(0,0,0,0.5)',
          transformStyle: 'preserve-3d',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {hover && <div className="shimmer-sweep" />}

        {/* Glow blob */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: `${site.accent}1a`, filter: 'blur(30px)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          fontSize: 10, fontWeight: 800, letterSpacing: 1,
          background: `${site.accent}22`, border: `1px solid ${site.accent}55`,
          color: site.accent, borderRadius: 8, padding: '3px 8px',
        }}>{site.badge}</div>

        {/* Icon */}
        <div style={{ fontSize: 52, marginBottom: 12, transform: 'translateZ(35px)' }}>{site.emoji}</div>

        {/* Title */}
        <h3 style={{ color: '#fff', fontSize: 21, margin: '0 0 4px', fontWeight: 900, transform: 'translateZ(28px)' }}>{site.name}</h3>
        <div style={{ color: site.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12, transform: 'translateZ(28px)', textTransform: 'uppercase' }}>
          {site.tagline}
        </div>

        {/* Description */}
        <p style={{ color: '#c9bfa0', fontSize: 13.5, lineHeight: 1.55, marginBottom: 14, transform: 'translateZ(18px)' }}>
          {site.description}
        </p>

        {/* VIP perks list */}
        <div style={{
          background: `${site.accent}12`, border: `1px solid ${site.accent}33`,
          borderRadius: 12, padding: '10px 12px', marginBottom: 18, transform: 'translateZ(18px)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: site.accent, letterSpacing: 1, marginBottom: 7, textTransform: 'uppercase' }}>VIP Unlocks</div>
          {(site.perks || []).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: i < site.perks.length - 1 ? 5 : 0 }}>
              <span style={{ color: site.accent, fontSize: 13, flexShrink: 0 }}>✓</span>
              <span style={{ color: '#d9cfa8', fontSize: 12.5 }}>{p}</span>
            </div>
          ))}
        </div>

        {/* CTA — paid only, no free visit link */}
        <button
          onClick={() => onUnlock(site)}
          style={{
            width: '100%', border: 'none', borderRadius: 13, padding: '13px 0',
            background: `linear-gradient(135deg, ${site.accent}, ${site.accent}cc)`,
            color: '#050a0e', fontWeight: 900, fontSize: 14, cursor: 'pointer',
            boxShadow: `0 6px 22px ${site.accent}44`, transform: 'translateZ(48px)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          🔓 Unlock VIP Access — GHS 10
        </button>
      </div>
    </div>
  );
}
