'use client';

import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import StatCard from '@/components/ui/StatCard';
import {
  Radar, Brain, Send, MessageCircle, Calendar,
  Trophy, TrendingUp, TrendingDown, BarChart3,
  Globe, Mail, Briefcase, Zap, Target,
  ArrowUpRight, ArrowDownRight,
  Activity
} from 'lucide-react';

const MOCK_ANALYTICS = {
  totalScanned: 0,
  totalAnalyzed: 0,
  totalContacted: 0,
  totalReplied: 0,
  totalMeetings: 0,
  totalConverted: 0,
  replyRate: 0,
  conversionRate: 0,
  avgDealValue: 0,
  weeklyGrowth: { scanned: 0, contacted: 0, replied: 0, converted: 0 },
  recentActivity: [],
  channelPerformance: [],
  topIndustries: []
};

function FunnelChart({ data }) {
  const stages = [
    { label: 'Scanned', value: data.totalScanned, color: 'var(--accent-blue)' },
    { label: 'Analyzed', value: data.totalAnalyzed, color: 'var(--accent-violet)' },
    { label: 'Contacted', value: data.totalContacted, color: 'var(--accent-cyan)' },
    { label: 'Replied', value: data.totalReplied, color: 'var(--accent-amber)' },
    { label: 'Meetings', value: data.totalMeetings, color: 'var(--accent-emerald)' },
    { label: 'Converted', value: data.totalConverted, color: 'var(--accent-emerald)' },
  ];

  const max = stages[0].value;

  return (
    <div>
      {stages.map((stage, i) => (
        <div key={stage.label} className="funnel-stage">
          <span className="funnel-label">{stage.label}</span>
          <div className="funnel-bar-container">
            <div
              className="funnel-bar"
              style={{
                width: `${(stage.value / max) * 100}%`,
                background: stage.color,
                minWidth: '40px',
              }}
            >
              {stage.value}
            </div>
          </div>
          <span className="funnel-value">{stage.value}</span>
          {i > 0 && (
            <span style={{
              fontSize: '0.7rem', fontWeight: '700',
              color: (stage.value / stages[i - 1].value * 100) > 30 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              width: '50px', textAlign: 'right',
            }}>
              {(stage.value / stages[i - 1].value * 100).toFixed(1)}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ActivityFeed({ activities }) {
  const typeIcons = {
    reply: { icon: <MessageCircle size={14} />, color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' },
    meeting: { icon: <Calendar size={14} />, color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-dim)' },
    sent: { icon: <Send size={14} />, color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-dim)' },
    scan: { icon: <Radar size={14} />, color: 'var(--accent-blue)', bg: 'var(--accent-blue-dim)' },
    converted: { icon: <Trophy size={14} />, color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-dim)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {activities.map((activity, i) => {
        const config = typeIcons[activity.type];
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            transition: 'background 200ms',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
              background: config.bg, color: config.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {config.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '1px' }}>
                {activity.business}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="truncate">
                {activity.message}
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {activity.time}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const data = MOCK_ANALYTICS;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Analytics Dashboard" breadcrumb="Analytics" />
        <div className="page-content">
          <div className="analytics-layout">
            {/* KPI Cards */}
            <div className="grid-4">
              <StatCard
                label="Businesses Scanned"
                value={data.totalScanned}
                icon={<Radar size={18} />}
                trend={data.weeklyGrowth.scanned}
                color="var(--accent-blue)"
                delay={0}
              />
              <StatCard
                label="Contacted"
                value={data.totalContacted}
                icon={<Send size={18} />}
                trend={data.weeklyGrowth.contacted}
                color="var(--accent-cyan)"
                delay={100}
              />
              <StatCard
                label="Reply Rate"
                value={`${data.replyRate}%`}
                icon={<MessageCircle size={18} />}
                trend={data.weeklyGrowth.replied}
                color="var(--accent-amber)"
                delay={200}
              />
              <StatCard
                label="Converted"
                value={data.totalConverted}
                icon={<Trophy size={18} />}
                trend={data.weeklyGrowth.converted}
                color="var(--accent-emerald)"
                delay={300}
              />
            </div>

            {/* Row 2: Funnel + Activity */}
            <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
              <div className="glass-card-static chart-card animate-slide-up" style={{ animationDelay: '150ms' }}>
                <div className="chart-card-header">
                  <h3 className="chart-card-title">Conversion Funnel</h3>
                  <span className="badge badge-emerald">
                    {data.conversionRate}% overall
                  </span>
                </div>
                <FunnelChart data={data} />
              </div>

              <div className="glass-card-static chart-card animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="chart-card-header">
                  <h3 className="chart-card-title">Recent Activity</h3>
                  <Activity size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <ActivityFeed activities={data.recentActivity} />
              </div>
            </div>

            {/* Row 3: Channel Performance + Top Industries */}
            <div className="grid-2">
              <div className="glass-card-static chart-card animate-slide-up" style={{ animationDelay: '250ms' }}>
                <div className="chart-card-header">
                  <h3 className="chart-card-title">Channel Performance</h3>
                  <Target size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.channelPerformance.map((ch, i) => {
                    const icons = {
                      Email: <Mail size={16} />, LinkedIn: <Briefcase size={16} />, WhatsApp: <MessageCircle size={16} />,
                    };
                    const colors = {
                      Email: 'var(--accent-cyan)', LinkedIn: 'var(--accent-blue)', WhatsApp: 'var(--accent-emerald)',
                    };
                    return (
                      <div key={i} className="glass-card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                              background: `${colors[ch.channel]}20`, color: colors[ch.channel],
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {icons[ch.channel]}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{ch.channel}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{ch.sent} sent · {ch.replied} replies</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: colors[ch.channel] }}>{ch.rate}%</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>reply rate</div>
                          </div>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${ch.rate}%`, height: '100%',
                            background: colors[ch.channel],
                            borderRadius: '3px',
                            transition: 'width 1s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card-static chart-card animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="chart-card-header">
                  <h3 className="chart-card-title">Top Industries</h3>
                  <BarChart3 size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.topIndustries.map((ind, i) => {
                    const colors = ['var(--accent-violet)', 'var(--accent-rose)', 'var(--accent-cyan)', 'var(--accent-amber)', 'var(--accent-emerald)'];
                    return (
                      <div key={i} style={{
                        padding: '12px 16px',
                        background: 'var(--glass-bg)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', gap: '16px',
                      }}>
                        <span style={{
                          width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                          background: `${colors[i]}20`, color: colors[i],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '800', fontSize: '0.75rem',
                        }}>
                          #{i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px' }}>{ind.industry}</div>
                          <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${ind.rate * 8}%`, height: '100%',
                              background: colors[i], borderRadius: '2px',
                              transition: 'width 1s ease',
                            }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', color: colors[i] }}>{ind.rate}%</div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{ind.converted}/{ind.contacted}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid-3">
              <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: '350ms' }}>
                <div className="stat-header">
                  <span className="stat-label">Avg Deal Value</span>
                  <div className="stat-icon" style={{ background: 'var(--accent-emerald-dim)', color: 'var(--accent-emerald)' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                  ${data.avgDealValue.toLocaleString()}
                </div>
                <div className="stat-trend positive">
                  <ArrowUpRight size={14} /> 12.5% vs last month
                </div>
              </div>

              <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="stat-header">
                  <span className="stat-label">Pipeline Value</span>
                  <div className="stat-icon" style={{ background: 'var(--accent-violet-dim)', color: 'var(--accent-violet)' }}>
                    <Zap size={18} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>
                  ${(data.avgDealValue * (data.totalReplied + data.totalMeetings)).toLocaleString()}
                </div>
                <div className="stat-trend positive">
                  <ArrowUpRight size={14} /> Active pipeline value
                </div>
              </div>

              <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: '450ms' }}>
                <div className="stat-header">
                  <span className="stat-label">Revenue Won</span>
                  <div className="stat-icon" style={{ background: 'var(--accent-emerald-dim)', color: 'var(--accent-emerald)' }}>
                    <Trophy size={18} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                  ${(data.avgDealValue * data.totalConverted).toLocaleString()}
                </div>
                <div className="stat-trend positive">
                  <ArrowUpRight size={14} /> {data.totalConverted} deals closed
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
