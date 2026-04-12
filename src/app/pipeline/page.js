'use client';

import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { MOCK_BUSINESSES, MOCK_PIPELINE } from '@/lib/mockData';
import { PIPELINE_STAGES } from '@/lib/constants';
import {
  Plus, MoreHorizontal, Star, MapPin, Mail,
  Briefcase, MessageCircle, Clock, ArrowRight,
  TrendingUp, Filter, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

function PipelineCard({ business }) {
  const sentimentColors = {
    discovered: 'var(--accent-blue)',
    analyzed: 'var(--accent-violet)',
    contacted: 'var(--accent-cyan)',
    replied: 'var(--accent-amber)',
    meeting: 'var(--accent-emerald)',
    converted: 'var(--accent-emerald)',
  };

  const lastActions = {
    discovered: 'Found via scanner',
    analyzed: 'Analysis complete',
    contacted: 'Email sent 2 days ago',
    replied: 'Replied: "Send more info"',
    meeting: 'Meeting on Friday 3pm',
    converted: 'Contract signed',
  };

  return (
    <div className="glass-card pipeline-card">
      <div className="pipeline-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>{business.icon}</span>
          <span className="pipeline-card-name">{business.name}</span>
        </div>
        <button className="btn btn-ghost" style={{ padding: '4px' }}>
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div className="pipeline-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <MapPin size={10} />
          {business.city}, {business.country}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} />
          {lastActions[business.status]}
        </div>
      </div>
      <div className="pipeline-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="business-rating" style={{ fontSize: '0.7rem' }}>
            <Star size={10} fill="var(--accent-amber)" />
            {business.rating}
          </span>
          <span className={`badge ${business.digitalScore < 30 ? 'badge-rose' : business.digitalScore < 50 ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.55rem', padding: '2px 5px' }}>
            {business.digitalScore}%
          </span>
        </div>
        <div className="pipeline-card-channel">
          <div className="channel-icon" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}>
            <Mail size={10} />
          </div>
          <div className="channel-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            <Briefcase size={10} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [pipeline] = useState(MOCK_PIPELINE);

  const totalLeads = Object.values(pipeline).flat().length;

  // Calculate conversion stats
  const stageConversions = PIPELINE_STAGES.map((stage, i) => {
    const count = pipeline[stage.id]?.length || 0;
    return { ...stage, count };
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Conversion Pipeline" breadcrumb="Pipeline" />
        <div className="pipeline-layout">
          <div className="pipeline-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2>Active Pipeline</h2>
                <span className="badge badge-cyan">{totalLeads} leads</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Track every business from discovery to conversion
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm">
                <Filter size={14} /> Filter
              </button>
              <button className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Lead
              </button>
            </div>
          </div>

          {/* Conversion flow indicator */}
          <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {stageConversions.map((stage, i) => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <div style={{
                  flex: 1, height: '4px', borderRadius: '2px', position: 'relative',
                  background: 'var(--bg-tertiary)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(stage.count / Math.max(totalLeads, 1)) * 100}%`,
                    height: '100%', borderRadius: '2px',
                    background: stage.color,
                    transition: 'width 1s ease',
                    minWidth: stage.count > 0 ? '10%' : 0,
                  }} />
                </div>
                {i < stageConversions.length - 1 && (
                  <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="pipeline-board">
            {PIPELINE_STAGES.map((stage) => {
              const stageBusinesses = (pipeline[stage.id] || [])
                .map(id => MOCK_BUSINESSES.find(b => b.id === id))
                .filter(Boolean);

              return (
                <div key={stage.id} className="pipeline-column">
                  <div className="pipeline-column-header">
                    <div className="pipeline-column-title">
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: stage.color,
                      }} />
                      {stage.icon} {stage.label}
                    </div>
                    <span className="pipeline-column-count">{stageBusinesses.length}</span>
                  </div>
                  <div className="pipeline-column-body">
                    {stageBusinesses.map(biz => (
                      <PipelineCard key={biz.id} business={biz} />
                    ))}
                    {stageBusinesses.length === 0 && (
                      <div style={{
                        padding: '24px', textAlign: 'center',
                        color: 'var(--text-muted)', fontSize: '0.8rem',
                        border: '2px dashed var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                      }}>
                        No leads in this stage
                      </div>
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
