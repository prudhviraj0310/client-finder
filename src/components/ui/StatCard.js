'use client';

import { useEffect, useRef, useState } from 'react';

export default function StatCard({ label, value, icon, trend, trendValue, color, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1200;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(numericValue * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay);
    return () => clearTimeout(timeout);
  }, [numericValue, delay]);

  const formattedValue = typeof value === 'string' ? value : displayValue.toLocaleString();

  return (
    <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div
          className="stat-icon"
          style={{ background: `${color}20`, color: color }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-value" style={{ color }}>
        {formattedValue}
      </div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}%</span>
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
            {trendValue || 'vs last week'}
          </span>
        </div>
      )}
    </div>
  );
}
