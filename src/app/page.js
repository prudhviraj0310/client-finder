'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import LoadingPulse from '@/components/ui/LoadingPulse';
import { INDUSTRIES, COUNTRIES } from '@/lib/constants';
import {
  Radar, MapPin, Star, ExternalLink, Brain, Filter,
  Globe, Search, Zap, Eye, TrendingUp, AlertTriangle,
  Phone, ChevronDown, X, Wifi, WifiOff, Loader2,
  ArrowRight, StarOff
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
  const [scanning, setScanning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('restaurant');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState('');
  const [scanComplete, setScanComplete] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const currentCountry = COUNTRIES.find(c => c.value === selectedCountry);
  const currentCity = currentCountry?.cities.find(c => c.value === selectedCity);
  const industryData = INDUSTRIES.find(i => i.value === selectedIndustry);

  const handleScan = useCallback(async (pageToken = null) => {
    if (!currentCity) {
      setError('Please select a country and city first');
      return;
    }

    if (pageToken) {
      setLoadingMore(true);
    } else {
      setScanning(true);
      setBusinesses([]);
      setSelectedBusiness(null);
      setScanComplete(false);
      setError('');
    }

    // Retry logic for timeout errors
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) setError(`Retrying... (attempt ${attempt + 1}/3)`);

        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: currentCity.lat,
            lng: currentCity.lng,
            industry: industryData?.query || '',
            radius: searchRadius,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          lastError = data.error || 'Scan failed';
          if (response.status === 504 && attempt < 2) continue; // retry on timeout
          setError(lastError);
          return;
        }

        setBusinesses(data.businesses || []);
        setScanComplete(true);
        setError('');
        setScanning(false);
        setLoadingMore(false);
        return; // success — exit retry loop
      } catch (err) {
        lastError = `Network error: ${err.message}`;
        if (attempt < 2) continue; // retry
      }
    }
    setError(lastError);
    setScanning(false);
    setLoadingMore(false);
  }, [currentCity, industryData, searchRadius]);

  const handleLoadMore = () => {
    if (nextPageToken) {
      handleScan(nextPageToken);
    }
  };

  // Sort businesses by opportunity (low digital score = high opportunity)
  const sortedBusinesses = [...businesses].sort((a, b) => a.digitalScore - b.digitalScore);

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
                    Select a country, city, and industry — then launch the scanner to discover <strong style={{ color: 'var(--text-secondary)' }}>real businesses</strong> via Google Maps.
                  </p>
                </div>
              )}

              {scanComplete && businesses.length > 0 && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: '20px',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* Stats bar */}
                    <div style={{
                      display: 'flex', gap: '16px', padding: '16px 20px',
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--glass-border)', marginBottom: '16px',
                      alignItems: 'center', zIndex: 5,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={16} style={{ color: 'var(--accent-cyan)' }} />
                        <span style={{ fontWeight: '700' }}>{currentCity?.label}</span>
                      </div>
                      <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-cyan)' }}>{businesses.length}</strong> businesses found
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-rose)' }}>
                          {businesses.filter(b => !b.hasWebsite).length}
                        </strong> without website
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-amber)' }}>
                          {businesses.filter(b => b.rating > 0 && b.rating < 4).length}
                        </strong> below 4★
                      </span>
                    </div>

                    <div style={{
                      flex: 1, position: 'relative',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--glass-border)',
                      overflow: 'hidden',
                      padding: '4px'
                    }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: 'calc(var(--radius-xl) - 4px)', overflow: 'hidden' }}>
                        <MapComponent 
                          businesses={businesses} 
                          currentCity={currentCity}
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
                    Try a different industry or increase the search radius.
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

              {/* Country */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  🌍 Country
                </label>
                <select
                  className="input select"
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setSelectedCity(''); }}
                >
                  <option value="">Select a country...</option>
                  {COUNTRIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  📍 City
                </label>
                <select
                  className="input select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedCountry}
                >
                  <option value="">
                    {selectedCountry ? 'Select a city...' : 'Select country first'}
                  </option>
                  {currentCountry?.cities.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Industry */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  🏢 Industry
                </label>
                <select
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

              {/* Radius */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📡 Radius
                  </label>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    {(searchRadius / 1000).toFixed(1)} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
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
                className={`btn btn-primary scan-btn ${scanning ? 'scanning' : ''}`}
                onClick={() => handleScan(null)}
                disabled={scanning || !selectedCity}
              >
                {scanning ? (
                  <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={18} style={{ animation: 'radar-sweep 1s linear infinite' }} /> Scanning businesses...
                  </div>
                ) : (
                  <>
                    <Zap size={18} /> Launch Scan
                  </>
                )}
              </button>
            </div>

            {/* Results Header */}
            <div className="scanner-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                  Results {businesses.length > 0 && `(${businesses.length})`}
                </span>
                {businesses.length > 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    Sorted by opportunity
                  </span>
                )}
              </div>
            </div>

            {/* Results List */}
            <div className="scanner-panel-body">
              {businesses.length === 0 && !scanning ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>
                    {scanComplete
                      ? 'No businesses found. Try different filters.'
                      : 'Select a location and launch scan to find real businesses'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {sortedBusinesses.map((biz, index) => (
                    <div
                      key={biz.id}
                      className={`glass-card business-result-card ${selectedBusiness?.id === biz.id ? 'selected' : ''}`}
                      onClick={() => setSelectedBusiness(biz)}
                      style={{ animation: `slideUp 300ms ease ${index * 30}ms forwards`, opacity: 0 }}
                    >
                      <div
                        className="business-avatar"
                        style={{
                          background: biz.digitalScore < 30 ? 'var(--accent-rose-dim)' :
                            biz.digitalScore < 50 ? 'var(--accent-amber-dim)' :
                            'var(--accent-emerald-dim)',
                          fontSize: '1.3rem',
                        }}
                      >
                        {biz.icon}
                      </div>
                      <div className="business-info">
                        <div className="business-name truncate" title={biz.name}>{biz.name}</div>
                        <div className="business-address truncate" title={biz.address}>
                          <MapPin size={10} style={{ display: 'inline', marginRight: '4px', flexShrink: 0 }} />
                          {biz.address}
                        </div>
                        <div className="business-meta" style={{ marginBottom: '6px' }}>
                          {biz.rating > 0 ? (
                            <span className="business-rating">
                              <Star size={12} fill="var(--accent-amber)" />
                              {biz.rating}
                              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                ({biz.reviews})
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

                        {/* Key insights */}
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
                          {biz.phone && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Phone size={8} /> {biz.phone}
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
                          {biz.hasWebsite && (
                            <a href={biz.website} target="_blank" rel="noopener noreferrer">
                              <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem' }}>
                                <ExternalLink size={12} /> Site
                              </button>
                            </a>
                          )}
                          {biz.googleMapsUrl && (
                            <a href={biz.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                              <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem' }}>
                                <MapPin size={12} /> Maps
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More */}
                  {nextPageToken && (
                    <button
                      className="btn btn-secondary w-full"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{ marginTop: '8px' }}
                    >
                      {loadingMore ? (
                        <><Loader2 size={14} className="animate-pulse" /> Loading more...</>
                      ) : (
                        <><ArrowRight size={14} /> Load More Results</>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
