'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { Search, MapPin, Brain, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AnalyzeIndexPage() {
  const router = useRouter();
  const [analyzedBusinesses, setAnalyzedBusinesses] = useState([]);

  useEffect(() => {
    // If a currentBusiness exists in session, show it here
    const stored = sessionStorage.getItem('currentBusiness');
    if (stored) {
      setAnalyzedBusinesses([JSON.parse(stored)]);
    }
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Intelligence Hub" breadcrumb="Analyze / Local Databank" />
        
        <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ marginBottom: '8px' }}>Target Databank</h1>
              <p style={{ color: 'var(--text-tertiary)' }}>Locally saved business insights and gap analyses.</p>
            </div>
            <div className="header-search">
              <Search className="search-icon" size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search saved targets..." className="input select" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {analyzedBusinesses.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
                <Brain size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <h3>No Targets Analyzed Yet</h3>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Scan businesses and click Analyze to add them here.</p>
                <button className="btn btn-primary" onClick={() => router.push('/')}>Go to Scanner</button>
              </div>
            ) : (
              analyzedBusinesses.map(biz => (
                <Link key={biz.id} href={`/analyze/${biz.id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: '24px', height: '100%', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <div className="btn-icon" style={{ background: 'var(--bg-secondary)', fontSize: '1.2rem' }}>
                        {biz.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="truncate" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{biz.name}</h3>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {biz.address.split(',')[0]}</span>
                          {biz.rating > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)' }}><Star size={12} fill="currentColor" /> {biz.rating}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-violet)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Identified Gaps
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {biz.missingItems?.map((item, i) => (
                          <span key={i} className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
