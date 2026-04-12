'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { PIPELINE_STAGES } from '@/lib/constants';
import {
  Plus, MoreHorizontal, MapPin, Mail,
  Briefcase, Clock, Filter, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

function PipelineCard({ business }) {
  if (!business) return null;
  return (
    <div className="glass-card" style={{ padding: '16px', marginBottom: '12px', cursor: 'grab', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', paddingRight: '20px' }} className="truncate">
          {business.name}
        </h4>
        <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {business.missingItems?.slice(0, 2).map((item, i) => (
          <span key={i} className="badge badge-amber" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{item}</span>
        ))}
        {business.missingItems?.length > 2 && (
          <span className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>+{business.missingItems.length - 2}</span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <Clock size={12} /> Pending
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div className="channel-icon" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}>
            <Mail size={10} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState({
    discovered: [], analyzed: [], contacted: [], negotiating: [], won: [], lost: []
  });
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    // If a currentBusiness exists in session, mock it into the 'discovered' lane dynamically
    const stored = sessionStorage.getItem('currentBusiness');
    if (stored) {
      const biz = JSON.parse(stored);
      setBusinesses([biz]);
      setPipeline({ ...pipeline, discovered: [biz.id] });
    }
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content flex-col h-screen">
        <Header title="Sales Pipeline" breadcrumb="Pipeline" />
        <div className="page-content py-0" style={{ display: 'flex', flexDirection: 'column' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
              <button className="btn btn-secondary btn-sm">All Industries <ChevronDown size={14} /></button>
            </div>
            <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Lead</button>
          </div>

          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px', flex: 1, alignItems: 'flex-start' }}>
            {PIPELINE_STAGES.map(stage => {
              const stageBusinessIds = pipeline[stage.id] || [];
              const stageBusinesses = stageBusinessIds.map(id => businesses.find(b => b.id === id)).filter(Boolean);

              return (
                <div key={stage.id} style={{ minWidth: '280px', width: '280px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--accent-${
                        stage.id === 'won' ? 'emerald' : stage.id === 'lost' ? 'rose' :
                        stage.id === 'contacted' ? 'cyan' : stage.id === 'negotiating' ? 'violet' : 'amber'
                      })` }} />
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{stage.label}</h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      {stageBusinessIds.length}
                    </span>
                  </div>

                  <div style={{ flex: 1, minHeight: '100px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '12px', border: '1px dashed var(--glass-border)' }}>
                    {stageBusinesses.length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '20px 0' }}>
                        No leads
                      </div>
                    ) : (
                      stageBusinesses.map(biz => <PipelineCard key={biz.id} business={biz} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
