'use client';

import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { MOCK_BUSINESSES, MOCK_ANALYSIS } from '@/lib/mockData';
import { Brain, ChevronRight, Star, MapPin, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzeIndexPage() {
  // Show the default analysis for biz-001, or a list of businesses to pick from
  const analyzedBusinesses = MOCK_BUSINESSES.filter(b =>
    MOCK_ANALYSIS[b.id] || b.status !== 'discovered'
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Intelligence Engine" breadcrumb="Intelligence" />
        <div className="page-content">
          <div className="intelligence-layout animate-fade-in">
            <div style={{ marginBottom: '8px' }}>
              <h2 style={{ marginBottom: '4px' }}>Select a Business to Analyze</h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Choose from discovered businesses or scan for new ones
              </p>
            </div>

            <div className="grid-3 stagger-children">
              {MOCK_BUSINESSES.map(biz => (
                <Link key={biz.id} href={`/analyze/${biz.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-card" style={{ padding: '20px', cursor: 'pointer', height: '100%' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                        background: biz.digitalScore < 30 ? 'var(--accent-rose-dim)' : biz.digitalScore < 50 ? 'var(--accent-amber-dim)' : 'var(--accent-emerald-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
                      }}>
                        {biz.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }} className="truncate">
                          {biz.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} /> {biz.city}, {biz.country}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>
                        <Star size={8} fill="currentColor" /> {biz.rating}
                      </span>
                      <span className={`badge ${biz.digitalScore < 30 ? 'badge-rose' : biz.digitalScore < 50 ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.6rem' }}>
                        {biz.digitalScore}% digital
                      </span>
                      {biz.missingTech.length > 0 && (
                        <span className="badge badge-rose" style={{ fontSize: '0.6rem' }}>
                          <AlertTriangle size={8} /> {biz.missingTech.length} gaps
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Brain size={12} /> View Analysis
                      </span>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
