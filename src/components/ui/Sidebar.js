'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radar, Brain, PenTool, Kanban, BarChart3,
  ChevronLeft, ChevronRight, Settings, HelpCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Scanner', icon: Radar, badge: null, section: 'operations' },
  { href: '/analyze', label: 'Intelligence', icon: Brain, badge: null, section: 'operations' },
  { href: '/compose', label: 'Compose', icon: PenTool, badge: 3, section: 'operations' },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban, badge: 12, section: 'tracking' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, badge: null, section: 'tracking' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const operationsItems = NAV_ITEMS.filter(i => i.section === 'operations');
  const trackingItems = NAV_ITEMS.filter(i => i.section === 'tracking');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">T</div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name gradient-text">HexaInd TAC</span>
          <span className="sidebar-brand-sub">Target · Analyze · Convert</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Operations</span>
        {operationsItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon">
                <Icon size={20} />
              </span>
              <span className="nav-item-label">{item.label}</span>
              {item.badge && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}

        <span className="sidebar-section-label" style={{ marginTop: '8px' }}>Tracking</span>
        {trackingItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon">
                <Icon size={20} />
              </span>
              <span className="nav-item-label">{item.label}</span>
              {item.badge && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />

        <Link href="#" className="nav-item">
          <span className="nav-item-icon"><Settings size={20} /></span>
          <span className="nav-item-label">Settings</span>
        </Link>
        <Link href="#" className="nav-item">
          <span className="nav-item-icon"><HelpCircle size={20} /></span>
          <span className="nav-item-label">Help & Docs</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
