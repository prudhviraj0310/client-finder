'use client';

export default function LoadingPulse({ active = true, size = 200 }) {
  if (!active) return null;

  return (
    <div className="radar-overlay">
      <div className="radar-ring" />
      <div className="radar-ring" />
      <div className="radar-ring" />
      <div className="radar-ring" />
      <div className="radar-sweep-line" />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: 'var(--accent-cyan)',
        boxShadow: '0 0 20px var(--accent-cyan), 0 0 40px var(--accent-cyan-glow)',
      }} />
    </div>
  );
}
