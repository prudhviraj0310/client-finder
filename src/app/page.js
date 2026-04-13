'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTasks } from '@/lib/TaskContext';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import LoadingPulse from '@/components/ui/LoadingPulse';
import { INDUSTRIES, POPULAR_LOCATIONS } from '@/lib/constants';
import {
  Radar, MapPin, Star, ExternalLink, Brain, Filter,
  Globe, Search, Zap, Eye, TrendingUp, AlertTriangle,
  Phone, ChevronDown, X, Wifi, WifiOff, Loader2,
  ArrowRight, StarOff, Users, UserPlus, PhoneCall,
  Download, Check, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/ui/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
      <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-cyan)' }} />
    </div>
  )
});

export default function ScannerPage() {
  const router = useRouter();
  const { currentUser, isAdmin, getTeamMembers } = useAuth();
  const { createTask } = useTasks();

  const [scanning, setScanning] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState('');
  const [scanComplete, setScanComplete] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [dataSource, setDataSource] = useState('');
  const [selectedBusinesses, setSelectedBusinesses] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignMember, setAssignMember] = useState('');
  const locationRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  const filteredLocations = POPULAR_LOCATIONS.filter(loc =>
    loc.label.toLowerCase().includes(locationText.toLowerCase())
  ).slice(0, 8);

  const handleScan = useCallback(async () => {
    if (!locationText.trim()) {
      setError('Please enter a location (e.g., Madanapalli, Andhra Pradesh)');
      return;
    }

    setScanning(true);
    setBusinesses([]);
    setSelectedBusiness(null);
    setScanComplete(false);
    setError('');
    setSelectedBusinesses([]);

    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) setError(`Retrying... (attempt ${attempt + 1}/3)`);
        const industryData = INDUSTRIES.find(i => i.value === selectedIndustry);
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: locationText.trim(),
            industry: industryData?.query || '',
            radius: searchRadius,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          lastError = data.error || 'Scan failed';
          if (response.status === 504 && attempt < 2) continue;
          setError(lastError);
          setScanning(false);
          return;
        }

        setBusinesses(data.businesses || []);
        setDataSource(data.source || '');
        setScanComplete(true);
        setError('');
        setScanning(false);
        return;
      } catch (err) {
        lastError = `Network error: ${err.message}`;
        if (attempt < 2) continue;
      }
    }
    setError(lastError);
    setScanning(false);
  }, [locationText, selectedIndustry, searchRadius]);

  const toggleBusinessSelection = (bizId) => {
    setSelectedBusinesses(prev =>
      prev.includes(bizId) ? prev.filter(id => id !== bizId) : [...prev, bizId]
    );
  };

  const selectAllBusinesses = () => {
    if (selectedBusinesses.length === businesses.length) {
      setSelectedBusinesses([]);
    } else {
      setSelectedBusinesses(businesses.map(b => b.id));
    }
  };

  const handleAssignToTeam = () => {
    if (!assignMember || selectedBusinesses.length === 0) return;
    const selectedBizData = businesses.filter(b => selectedBusinesses.includes(b.id));
    const industryData = INDUSTRIES.find(i => i.value === selectedIndustry);

    createTask({
      assignedTo: assignMember,
      assignedBy: currentUser.id,
      businesses: selectedBizData,
      industry: industryData?.label || selectedIndustry || 'General',
      location: locationText,
      title: `${industryData?.label || 'Business'} outreach in ${locationText}`,
    });

    setShowAssignModal(false);
    setSelectedBusinesses([]);
    setAssignMember('');
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Rating', 'Reviews', 'Address', 'Website', 'Google Maps'];
    const rows = businesses.map(b => [
      b.name, b.phone, b.rating, b.reviews, b.address, b.website, b.googleMapsUrl,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${locationText.replace(/[^a-zA-Z0-9]/g, '_')}_businesses.csv`;
    a.click();
  };

  if (!currentUser) return null;

  const sortedBusinesses = [...businesses].sort((a, b) => a.digitalScore - b.digitalScore);
  const teamMembers = isAdmin ? getTeamMembers() : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Global Scanner" breadcrumb="Scanner" scanning={scanning} />
        <div className="scanner-layout">
          {/* Map Area */}
          <div className="scanner-map">
            <div className="map-placeholder">
              {scanning && <LoadingPulse active={true} />}

              {!scanning && !scanComplete && (
                <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'var(--accent-cyan-dim)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', animation: 'float 3s ease-in-out infinite'
                  }}>
                    <Radar size={36} style={{ color: 'var(--accent-cyan)' }} />
                  </div>
                  <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>
                    <span className="gradient-text">Ready to Scan</span>
                  </h2>
                  <p style={{ color: 'var(--text-tertiary)', maxWidth: '420px', fontSize: '0.9rem', margin: '0 auto' }}>
                    Type any location — like <strong style={{ color: 'var(--accent-cyan)' }}>Madanapalli</strong> — and select an industry to discover <strong style={{ color: 'var(--text-secondary)' }}>real businesses</strong> with phone numbers and reviews.
                  </p>
                </div>
              )}

              {scanComplete && businesses.length > 0 && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: '20px', display: 'flex', flexDirection: 'column' }}>
                    {/* Stats bar */}
                    <div style={{
                      display: 'flex', gap: '16px', padding: '16px 20px',
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--glass-border)', marginBottom: '16px',
                      alignItems: 'center', zIndex: 5, flexWrap: 'wrap',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={16} style={{ color: 'var(--accent-cyan)' }} />
                        <span style={{ fontWeight: '700' }}>{locationText}</span>
                      </div>
                      <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-cyan)' }}>{businesses.length}</strong> businesses
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-emerald)' }}>
                          {businesses.filter(b => b.phone).length}
                        </strong> with phone
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-amber)' }}>
                          {businesses.filter(b => b.rating > 0).length}
                        </strong> rated
                      </span>
                      {dataSource && (
                        <span className="badge badge-cyan" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>
                          via {dataSource}
                        </span>
                      )}
                    </div>

                    <div style={{
                      flex: 1, position: 'relative',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--glass-border)',
                      overflow: 'hidden', padding: '4px'
                    }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: 'calc(var(--radius-xl) - 4px)', overflow: 'hidden' }}>
                        <MapComponent 
                          businesses={businesses} 
                          currentCity={{ label: locationText, lat: businesses[0]?.lat, lng: businesses[0]?.lng }}
                          onSelectBusiness={setSelectedBusiness}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scanComplete && businesses.length === 0 && (
                <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                  <Search size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>No businesses found</h3>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    Try a different location or industry.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="scanner-panel">
            {/* Scan Controls */}
            <div className="scan-controls">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Radar size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Scan Configuration</span>
              </div>

              {/* Location Search */}
              <div style={{ position: 'relative' }} ref={locationRef}>
                <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  📍 Location
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  }} />
                  <input
                    id="location-search"
                    className="input"
                    value={locationText}
                    onChange={(e) => {
                      setLocationText(e.target.value);
                      setShowLocationSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowLocationSuggestions(locationText.length > 0 || true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    placeholder="Type any location... e.g. Madanapalli"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>

                {/* Location suggestions */}
                {showLocationSuggestions && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)', marginTop: '4px',
                    maxHeight: '200px', overflowY: 'auto', zIndex: 50,
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                    {(locationText.length > 0 ? filteredLocations : POPULAR_LOCATIONS.slice(0, 8)).map((loc, i) => (
                      <button
                        key={i}
                        onMouseDown={() => {
                          setLocationText(loc.value);
                          setShowLocationSuggestions(false);
                        }}
                        style={{
                          width: '100%', padding: '10px 14px',
                          background: 'none', border: 'none',
                          color: 'var(--text-primary)', textAlign: 'left',
                          cursor: 'pointer', fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'background 100ms',
                          fontFamily: 'var(--font-ui)',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg-hover)'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                      >
                        <MapPin size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                        {loc.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Industry */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  🏢 Industry
                </label>
                <select
                  id="industry-select"
                  className="input select"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind.value} value={ind.value}>
                      {ind.icon} {ind.label}
                    </option>
                  ))}
                </select>
              </div>


              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-rose-dim)', color: 'var(--accent-rose)',
                  fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <AlertTriangle size={14} />
                  {error}
                  <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Scan Button */}
              <button
                id="scan-button"
                className={`btn btn-primary scan-btn ${scanning ? 'scanning' : ''}`}
                onClick={handleScan}
                disabled={scanning || !locationText.trim()}
              >
                {scanning ? (
                  <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={18} style={{ animation: 'radar-sweep 1s linear infinite' }} /> Scanning...
                  </div>
                ) : (
                  <><Zap size={18} /> Launch Scan</>
                )}
              </button>
            </div>

            {/* Action Bar */}
            {scanComplete && businesses.length > 0 && (
              <div style={{
                display: 'flex', gap: '6px', padding: '0 0 8px',
                flexWrap: 'wrap',
              }}>
                {isAdmin && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={selectAllBusinesses}
                      style={{ fontSize: '0.7rem' }}
                    >
                      <Check size={12} />
                      {selectedBusinesses.length === businesses.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedBusinesses.length > 0 && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAssignModal(true)}
                        style={{ fontSize: '0.7rem' }}
                      >
                        <UserPlus size={12} /> Assign {selectedBusinesses.length} to Team
                      </button>
                    )}
                  </>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={exportToCSV}
                  style={{ fontSize: '0.7rem', marginLeft: 'auto' }}
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>
            )}

            {/* Results Header */}
            <div className="scanner-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                  Results {businesses.length > 0 && `(${businesses.length})`}
                </span>
              </div>
            </div>

            {/* Results List */}
            <div className="scanner-panel-body">
              {businesses.length === 0 && !scanning ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>
                    {scanComplete ? 'No businesses found. Try different filters.' : 'Enter a location and launch scan'}
                  </p>
                </div>
              ) : (
                <>
                  {sortedBusinesses.map((biz, index) => {
                    const isSelected = selectedBusinesses.includes(biz.id);
                    return (
                      <div
                        key={biz.id}
                        className={`glass-card business-result-card ${selectedBusiness?.id === biz.id ? 'selected' : ''}`}
                        onClick={() => setSelectedBusiness(biz)}
                        style={{
                          animation: `slideUp 300ms ease ${index * 30}ms forwards`, opacity: 0,
                          borderColor: isSelected ? 'var(--accent-cyan)' : undefined,
                          position: 'relative',
                        }}
                      >
                        {/* Selection checkbox for admin */}
                        {isAdmin && (
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleBusinessSelection(biz.id); }}
                            style={{
                              position: 'absolute', top: '10px', right: '10px',
                              width: '20px', height: '20px', borderRadius: '4px',
                              border: isSelected ? '2px solid var(--accent-cyan)' : '2px solid var(--glass-border)',
                              background: isSelected ? 'var(--accent-cyan)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 200ms',
                            }}
                          >
                            {isSelected && <Check size={12} style={{ color: 'white' }} />}
                          </div>
                        )}

                        <div className="business-avatar" style={{
                          background: biz.digitalScore < 30 ? 'var(--accent-rose-dim)' :
                            biz.digitalScore < 50 ? 'var(--accent-amber-dim)' :
                            'var(--accent-emerald-dim)',
                          fontSize: '1.3rem',
                        }}>
                          {biz.icon}
                        </div>
                        <div className="business-info">
                          <div className="business-name truncate" title={biz.name} style={{ paddingRight: isAdmin ? '24px' : 0 }}>{biz.name}</div>
                          <div className="business-address truncate" title={biz.address}>
                            <MapPin size={10} style={{ display: 'inline', marginRight: '4px', flexShrink: 0 }} />
                            {biz.address}
                          </div>

                          {/* Rating & Reviews */}
                          <div className="business-meta" style={{ marginBottom: '6px' }}>
                            {biz.rating > 0 ? (
                              <span className="business-rating">
                                <Star size={12} fill="var(--accent-amber)" style={{ color: 'var(--accent-amber)' }} />
                                {biz.rating}
                                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                  ({biz.reviews} reviews)
                                </span>
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <StarOff size={10} /> No rating
                              </span>
                            )}
                            <span className={`badge ${biz.digitalScore < 30 ? 'badge-rose' : biz.digitalScore < 50 ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                              {biz.digitalScore}% digital
                            </span>
                          </div>

                          {/* PHONE NUMBER — Prominent */}
                          {biz.phone ? (
                            <a href={`tel:${biz.phone}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--accent-emerald-dim)',
                                color: 'var(--accent-emerald)',
                                fontSize: '0.8rem', fontWeight: '700',
                                marginBottom: '6px', cursor: 'pointer',
                                transition: 'all 200ms',
                                width: 'fit-content',
                              }}>
                                <PhoneCall size={12} />
                                {biz.phone}
                              </div>
                            </a>
                          ) : (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.7rem', color: 'var(--accent-rose)',
                              marginBottom: '6px', fontWeight: '600',
                            }}>
                              <Phone size={10} /> No phone listed
                            </div>
                          )}

                          {/* Review Snippet */}
                          {biz.reviewSnippets?.length > 0 && biz.reviewSnippets[0]?.text && (
                            <div style={{
                              fontSize: '0.7rem', color: 'var(--text-tertiary)',
                              fontStyle: 'italic', marginBottom: '6px',
                              display: 'flex', gap: '4px',
                              overflow: 'hidden', maxHeight: '36px',
                            }}>
                              <MessageCircle size={10} style={{ flexShrink: 0, marginTop: '2px' }} />
                              "{biz.reviewSnippets[0].text.substring(0, 100)}..."
                            </div>
                          )}

                          {/* Website / Digital status */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            {biz.hasWebsite ? (
                              <span style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Wifi size={8} /> Has website
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}>
                                <WifiOff size={8} /> NO WEBSITE
                              </span>
                            )}
                          </div>

                          {/* Missing items */}
                          {biz.missingItems.length > 0 && (
                            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                              {biz.missingItems.slice(0, 3).map((item, i) => (
                                <span key={i} style={{
                                  fontSize: '0.6rem', padding: '1px 5px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--accent-amber-dim)',
                                  color: 'var(--accent-amber)',
                                  fontWeight: '600',
                                }}>
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                            <Link href={`/analyze/${biz.id}`} onClick={() => sessionStorage.setItem('currentBusiness', JSON.stringify(biz))}>
                              <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }}>
                                <Brain size={12} /> Analyze
                              </button>
                            </Link>
                            {biz.googleMapsUrl && (
                              <a href={biz.googleMapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem' }}>
                                  <MapPin size={12} /> Maps
                                </button>
                              </a>
                            )}
                            {biz.hasWebsite && (
                              <a href={biz.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem' }}>
                                  <ExternalLink size={12} /> Site
                                </button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)',
          }}>
            <div className="glass-card-static animate-scale-in" style={{
              width: '440px', padding: '28px',
              border: '1px solid var(--accent-cyan)',
            }}>
              <h3 style={{ marginBottom: '4px' }}>
                <UserPlus size={18} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent-cyan)' }} />
                Assign to Team Member
              </h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {selectedBusinesses.length} businesses selected from {locationText}
              </p>

              <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Select Team Member
              </label>
              <select
                className="input select"
                value={assignMember}
                onChange={(e) => setAssignMember(e.target.value)}
              >
                <option value="">Choose a member...</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.avatar} {m.name} ({m.role})</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAssignToTeam} disabled={!assignMember}>
                  <UserPlus size={14} /> Assign Task
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
