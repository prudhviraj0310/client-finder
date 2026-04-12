'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import LoadingPulse from '@/components/ui/LoadingPulse';
import {
  MapPin, Star, Globe, Users, Calendar, Phone,
  AlertTriangle, AlertCircle, Info, CheckCircle,
  TrendingUp, Zap, PenTool, ChevronRight, ExternalLink,
  Shield, Smartphone, Gauge, Search, Eye, MonitorSmartphone,
  Loader2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

function GaugeChart({ value, label, color, size = 100 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="gauge-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle className="gauge-bg" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="gauge-fill"
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <span className="gauge-value" style={{ color, fontSize: size > 100 ? '1.5rem' : '1.1rem' }}>{value}</span>
      <span className="gauge-label">{label}</span>
    </div>
  );
}

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.id;
  
  const [business, setBusiness] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('gaps');

  useEffect(() => {
    // 1. Get business from sessionStorage
    const stored = sessionStorage.getItem('currentBusiness');
    if (!stored) {
      setError('No business data found. Please run a scan first.');
      setLoading(false);
      return;
    }

    try {
      const biz = JSON.parse(stored);
      setBusiness(biz);
      
      // 2. Fetch AI analysis
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: biz })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAnalysis(data);
      })
      .catch(err => {
        console.error('Analysis failed:', err);
        setError('Failed to generate AI analysis. Using fallback data.');
      })
      .finally(() => {
        setLoading(false);
      });
      
    } catch (e) {
      console.error(e);
      setError('Invalid business data.');
      setLoading(false);
    }
  }, [businessId]);

  const tabs = [
    { id: 'gaps', label: 'Gap Analysis', icon: <AlertTriangle size={14} /> },
    { id: 'website', label: 'Website Audit', icon: <MonitorSmartphone size={14} /> },
    { id: 'competitors', label: 'Competitors', icon: <Users size={14} /> },
    { id: 'tech', label: 'Tech Stack', icon: <Zap size={14} /> },
  ];

  const severityIcons = {
    critical: <AlertCircle size={16} style={{ color: 'var(--accent-rose)' }} />,
    high: <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />,
    medium: <Info size={16} style={{ color: 'var(--accent-cyan)' }} />,
    low: <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />,
  };

  if (error && !business) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Intelligence Report" breadcrumb="Intelligence" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: 'var(--accent-amber)', margin: '0 auto 20px' }} />
            <h2>{error}</h2>
            <button className="btn btn-primary" onClick={() => router.push('/')} style={{ marginTop: '20px' }}>
              Go to Scanner
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header 
          title={business ? `Intelligence: ${business.name}` : "Intelligence Report"} 
          breadcrumb="Intelligence" 
        />
        <div className="page-content">
          {loading ? (
            <div style={{ position: 'relative', width: '100%', minHeight: '60vh' }}>
              <LoadingPulse active={true} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, textAlign: 'center' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px' }} />
                <h3 className="gradient-text">Generating AI Intelligence...</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '8px' }}>
                  Analyzing footprint for {business?.name || 'this business'}
                </p>
              </div>
            </div>
          ) : (
            <div className="intelligence-layout animate-fade-in">
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => router.push('/')}
                style={{ width: 'fit-content', marginBottom: '16px' }}
              >
                <ArrowLeft size={14} /> Back to Scanner
              </button>

              {/* Business Header */}
              {business && (
                <div className="glass-card-static intel-header-card">
                  <div
                    className="intel-company-logo"
                    style={{
                      background: `${business.digitalScore < 30 ? 'var(--accent-rose-dim)' : business.digitalScore < 50 ? 'var(--accent-amber-dim)' : 'var(--accent-emerald-dim)'}`,
                    }}
                  >
                    {business.icon}
                  </div>
                  <div className="intel-company-info">
                    <h2 className="intel-company-name">{business.name}</h2>
                    <div className="intel-company-meta">
                      <span className="intel-meta-item"><MapPin size={14} /> {business.address}</span>
                      {business.rating > 0 && (
                        <span className="intel-meta-item"><Star size={14} fill="var(--accent-amber)" style={{ color: 'var(--accent-amber)' }} /> {business.rating}</span>
                      )}
                      {business.phone && (
                        <span className="intel-meta-item"><Phone size={14} /> {business.phone}</span>
                      )}
                      {business.hasWebsite && (
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="intel-meta-item" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                          <Globe size={14} /> Website
                        </a>
                      )}
                      {business.googleMapsUrl && (
                        <a href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="intel-meta-item" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                          <MapPin size={14} /> Maps
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <GaugeChart
                        value={business.digitalScore}
                        label="Digital"
                        color={business.digitalScore < 30 ? 'var(--accent-rose)' : business.digitalScore < 50 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}
                        size={90}
                      />
                    </div>
                    <Link href={`/compose?business=${businessId}`}>
                      <button className="btn btn-primary btn-lg" style={{ height: '100%' }}>
                        <PenTool size={18} /> Craft Outreach
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid-4 stagger-children">
                <div className="glass-card stat-card">
                  <span className="stat-label">Opportunity Score</span>
                  <span className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-emerald)' }}>
                    {100 - (business?.digitalScore || 0)}%
                  </span>
                </div>
                <div className="glass-card stat-card">
                  <span className="stat-label">Gaps Found</span>
                  <span className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-rose)' }}>{analysis?.gaps?.length || 0}</span>
                </div>
                <div className="glass-card stat-card">
                  <span className="stat-label">Missing Tech</span>
                  <span className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-amber)' }}>{analysis?.missingTech?.length || 0}</span>
                </div>
                <div className="glass-card stat-card">
                  <span className="stat-label">Competitors</span>
                  <span className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-violet)' }}>{analysis?.competitors?.length || 0}</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="intel-tab-nav">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`intel-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {tab.icon} {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in" key={activeTab}>
                {activeTab === 'gaps' && analysis?.gaps && (
                  <div>
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={20} style={{ color: 'var(--accent-amber)' }} />
                      <h3>AI Identified Gaps</h3>
                      <span className="badge badge-rose">{analysis.gaps.filter(g => g.severity === 'critical').length} Critical</span>
                    </div>
                    {analysis.gaps.map(gap => (
                      <div key={gap.id} className={`glass-card gap-card ${gap.severity}`}>
                        <div className="gap-title">
                          {severityIcons[gap.severity] || severityIcons.high}
                          {gap.title}
                          <span className={`badge badge-${gap.severity === 'critical' ? 'rose' : gap.severity === 'high' ? 'amber' : gap.severity === 'medium' ? 'cyan' : 'emerald'}`}>
                            {gap.severity}
                          </span>
                        </div>
                        <div className="gap-description">{gap.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                          <strong style={{ color: 'var(--text-secondary)' }}>Evidence:</strong> {gap.evidence}
                        </div>
                        <div className="gap-opportunity">
                          💡 <strong>Opportunity:</strong> {gap.opportunity}
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px 14px', background: 'var(--accent-violet-dim)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--accent-violet)', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                            🎯 AI Generated Pitch Angle
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            &ldquo;{gap.pitchAngle}&rdquo;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'website' && analysis?.websiteAudit && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ marginBottom: '16px' }}>Website Health Score</h3>
                      <div className="grid-4" style={{ gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <GaugeChart value={analysis.websiteAudit.overall} label="Overall" color="var(--accent-cyan)" size={120} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <GaugeChart value={analysis.websiteAudit.mobile} label="Mobile" color="var(--accent-rose)" size={120} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <GaugeChart value={analysis.websiteAudit.speed} label="Speed" color="var(--accent-amber)" size={120} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <GaugeChart value={analysis.websiteAudit.seo} label="SEO" color="var(--accent-violet)" size={120} />
                        </div>
                      </div>
                    </div>

                    <h3 style={{ marginBottom: '12px' }}>Issues Found</h3>
                    {analysis.websiteAudit.issues.map((issue, i) => (
                      <div key={i} className="glass-card" style={{
                        padding: '12px 16px', marginBottom: '8px',
                        borderLeft: `3px solid ${issue.type === 'critical' ? 'var(--accent-rose)' : issue.type === 'high' ? 'var(--accent-amber)' : issue.type === 'medium' ? 'var(--accent-cyan)' : 'var(--accent-emerald)'}`,
                        display: 'flex', alignItems: 'center', gap: '12px',
                      }}>
                        <span className={`badge badge-${issue.type === 'critical' ? 'rose' : issue.type === 'high' ? 'amber' : issue.type === 'medium' ? 'cyan' : 'emerald'}`}>
                          {issue.type}
                        </span>
                        <span style={{ fontSize: '0.85rem' }}>{issue.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'competitors' && analysis?.competitors && (
                  <div>
                    <h3 style={{ marginBottom: '16px' }}>Competitor Comparison</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Current business */}
                      <div className="glass-card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-cyan)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{business?.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target prospect</div>
                          </div>
                          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Score</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{business?.digitalScore}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rating</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={14} fill="var(--accent-amber)" style={{ color: 'var(--accent-amber)' }} />
                                {business?.rating || 0}
                              </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Reviews</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{business?.reviews || 0}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Competitors */}
                      {analysis.competitors.map((comp, i) => (
                        <div key={i} className="glass-card" style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontWeight: '700', marginBottom: '4px' }}>{comp.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Competitor #{i + 1}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Score</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: comp.score > (business?.digitalScore || 0) ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{comp.score}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rating</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Star size={14} fill="var(--accent-amber)" style={{ color: 'var(--accent-amber)' }} />
                                  {comp.rating}
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Reviews</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{comp.reviews}</div>
                              </div>
                            </div>
                          </div>
                          {/* Score bar */}
                          <div style={{ marginTop: '12px', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${comp.score}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'tech' && analysis && (
                  <div>
                    <h3 style={{ marginBottom: '16px' }}>Detected Technology</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                      {analysis.techStack?.map((tech, i) => (
                        <div key={i} className="glass-card" style={{
                          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{tech}</span>
                        </div>
                      ))}
                      {(!analysis.techStack || analysis.techStack.length === 0) && (
                        <div className="glass-card" style={{ padding: '16px', width: '100%', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                          No technology detected — possible no website
                        </div>
                      )}
                    </div>

                    <h3 style={{ marginBottom: '16px', color: 'var(--accent-amber)' }}>
                      ⚠️ Missing / Recommended Technology
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {analysis.missingTech?.map((tech, i) => (
                        <div key={i} className="glass-card" style={{
                          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
                          borderColor: 'var(--accent-amber)',
                          borderWidth: '1px',
                        }}>
                          <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />
                          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{tech}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>OPPORTUNITY</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
