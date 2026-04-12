'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Brain, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';

// Fix Leaflet's default icon path issues in Next.js
delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (score) => {
  const color = score < 30 ? '#f43f5e' : score < 50 ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${color}20;
      border: 2px solid ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      box-shadow: 0 0 10px ${color}50;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    ">
      <div style="width: 8px; height: 8px; background-color: ${color}; border-radius: 50%;"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ businesses = [], currentCity, onSelectBusiness }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }} />;

  const centerLat = currentCity?.lat || 38.9072;
  const centerLng = currentCity?.lng || -77.0369;

  return (
    <MapContainer 
      center={[centerLat, centerLng]} 
      zoom={12} 
      style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)', background: '#111827' }}
      attributionControl={false}
      zoomControl={false} // Clean look
    >
      <MapUpdater center={[centerLat, centerLng]} zoom={12} />
      
      {/* Premium Dark Mode Map Tiles (CartoDB Dark Matter) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {businesses.map(biz => (
        <Marker 
          key={biz.id} 
          position={[biz.lat, biz.lng]}
          icon={createCustomIcon(biz.digitalScore)}
          eventHandlers={{
            click: () => onSelectBusiness(biz)
          }}
        >
          <Popup className="premium-map-popup">
            <div style={{ padding: '4px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>{biz.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {biz.address}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className={`badge badge-${biz.digitalScore < 30 ? 'rose' : biz.digitalScore < 50 ? 'amber' : 'emerald'}`}>
                  {biz.digitalScore}% Score
                </span>
                {!biz.hasWebsite && <span className="badge badge-rose">No Website</span>}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Link href={`/analyze/${biz.id}`} onClick={() => sessionStorage.setItem('currentBusiness', JSON.stringify(biz))}>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    <Brain size={12} /> Analyze
                  </button>
                </Link>
                {biz.googleMapsUrl && (
                  <a href={biz.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      <MapPin size={12} /> Maps
                    </button>
                  </a>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
