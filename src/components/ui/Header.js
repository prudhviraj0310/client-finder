'use client';

import { Search, Bell, Zap } from 'lucide-react';

export default function Header({ title, breadcrumb, scanning }) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          {breadcrumb && (
            <div className="page-breadcrumb">
              TAC <span>/</span> <span>{breadcrumb}</span>
            </div>
          )}
          <h1 className="header-title">{title}</h1>
        </div>
        {scanning && (
          <div className="badge badge-cyan animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={12} /> Scanning in progress...
          </div>
        )}
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search businesses, contacts..."
          />
        </div>

        <button className="btn btn-icon btn-ghost notification-btn">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-avatar">PR</div>
      </div>
    </header>
  );
}
