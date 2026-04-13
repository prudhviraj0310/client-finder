'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  Radar, Brain, PenTool, Kanban, BarChart3,
  ChevronLeft, ChevronRight, Settings, HelpCircle,
  Users, ClipboardList, LogOut, Crown, Phone
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();

  if (!currentUser) return null;

  const NAV_ITEMS = [
    { href: '/', label: 'Scanner', icon: Radar, badge: null, section: 'operations' },
    { href: '/analyze', label: 'Intelligence', icon: Brain, badge: null, section: 'operations' },
    { href: '/compose', label: 'Compose', icon: PenTool, badge: null, section: 'operations' },
    { href: '/tasks', label: isAdmin ? 'All Tasks' : 'My Tasks', icon: ClipboardList, badge: null, section: 'team' },
    ...(isAdmin ? [{ href: '/team', label: 'Team', icon: Users, badge: null, section: 'team' }] : []),
    { href: '/pipeline', label: 'Pipeline', icon: Kanban, badge: null, section: 'tracking' },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, badge: null, section: 'tracking' },
  ];

  const operationsItems = NAV_ITEMS.filter(i => i.section === 'operations');
  const teamItems = NAV_ITEMS.filter(i => i.section === 'team');
  const trackingItems = NAV_ITEMS.filter(i => i.section === 'tracking');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">T</div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name gradient-text">Client Finder</span>
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

        <span className="sidebar-section-label" style={{ marginTop: '8px' }}>Team</span>
        {teamItems.map((item) => {
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

        {/* User info */}
        <div style={{
          padding: '12px', marginTop: '8px',
          background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--glass-border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
              background: isAdmin ? 'var(--accent-violet-dim)' : 'var(--accent-cyan-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
            }}>
              {currentUser.avatar}
            </div>
            <div className="nav-item-label" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {isAdmin ? '👑 Admin' : `📋 ${currentUser.role}`}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="nav-item-label"
              style={{
                background: 'none', border: 'none',
                color: 'var(--accent-rose)', cursor: 'pointer',
                padding: '4px', borderRadius: 'var(--radius-sm)',
                flexShrink: 0,
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
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
