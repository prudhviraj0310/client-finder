'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import {
  Users, Plus, Trash2, Edit3, Save, X, Shield,
  Phone, Radar, Target, UserCheck, Crown, AlertTriangle
} from 'lucide-react';

const ROLE_CONFIG = {
  scanner: { label: 'Scanner', icon: <Radar size={14} />, color: 'var(--accent-cyan)', desc: 'Scans and discovers businesses' },
  caller: { label: 'Caller', icon: <Phone size={14} />, color: 'var(--accent-amber)', desc: 'Calls businesses and pitches' },
  closer: { label: 'Closer', icon: <Target size={14} />, color: 'var(--accent-emerald)', desc: 'Closes deals and converts' },
};

const AVATARS = ['🧑‍💼', '👨‍💻', '👩‍💼', '🧑‍🚀', '👷', '🧑‍🔬', '👨‍🎨', '👩‍🏫'];

export default function TeamPage() {
  const { currentUser, isAdmin, getTeamMembers, addMember, updateMember, deleteMember } = useAuth();
  const router = useRouter();
  const members = getTeamMembers();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', username: '', password: 'member123', role: 'caller', avatar: '🧑‍💼',
  });

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Team" breadcrumb="Team" />
          <div className="page-content" style={{ textAlign: 'center', paddingTop: '10vh' }}>
            <Shield size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 16px' }} />
            <h2>Admin Access Only</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Only admins can manage team members.</p>
          </div>
        </main>
      </div>
    );
  }

  const handleAdd = () => {
    if (!formData.name || !formData.username) return;
    addMember(formData);
    setFormData({ name: '', username: '', password: 'member123', role: 'caller', avatar: '🧑‍💼' });
    setShowAddForm(false);
  };

  const handleUpdate = (id) => {
    updateMember(id, formData);
    setEditingId(null);
    setFormData({ name: '', username: '', password: 'member123', role: 'caller', avatar: '🧑‍💼' });
  };

  const startEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      username: member.username,
      password: member.password,
      role: member.role,
      avatar: member.avatar,
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Team Management" breadcrumb="Team" />
        <div className="page-content">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '24px',
            }}>
              <div>
                <h2 style={{ marginBottom: '4px' }}>
                  <span className="gradient-text">Your Team</span>
                </h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  {members.length} members · Manage roles and access
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} /> Add Member
              </button>
            </div>

            {/* Admin Card */}
            <div className="glass-card-static" style={{
              padding: '20px', marginBottom: '24px',
              borderLeft: '3px solid var(--accent-violet)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-violet-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  👑
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{currentUser.name}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    <Crown size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Administrator · @{currentUser.username}
                  </div>
                </div>
                <span className="badge badge-violet">ADMIN</span>
              </div>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
              <div className="glass-card-static animate-slide-up" style={{
                padding: '24px', marginBottom: '24px',
                border: '1px solid var(--accent-cyan)',
              }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} style={{ color: 'var(--accent-cyan)' }} />
                  Add New Team Member
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ravi Kumar"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Username
                    </label>
                    <input
                      className="input"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. ravi"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Password
                    </label>
                    <input
                      className="input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="member123"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Role
                    </label>
                    <select
                      className="input select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label} — {cfg.desc}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Avatar
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {AVATARS.map(a => (
                      <button
                        key={a}
                        onClick={() => setFormData({ ...formData, avatar: a })}
                        style={{
                          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                          background: formData.avatar === a ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)',
                          border: formData.avatar === a ? '2px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                          fontSize: '1.2rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    <X size={14} /> Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAdd} disabled={!formData.name || !formData.username}>
                    <UserCheck size={14} /> Add Member
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map((member, idx) => {
                const role = ROLE_CONFIG[member.role] || ROLE_CONFIG.caller;
                const isEditing = editingId === member.id;

                return (
                  <div
                    key={member.id}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      animation: `slideUp 300ms ease ${idx * 60}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    {isEditing ? (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" />
                          <input className="input" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Username" />
                          <select className="input select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                            {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}><X size={12} /> Cancel</button>
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(member.id)}><Save size={12} /> Save</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-elevated)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem', border: '1px solid var(--glass-border)',
                        }}>
                          {member.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '1rem' }}>{member.name}</div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                            @{member.username} · Password: {member.password}
                          </div>
                        </div>
                        <span
                          className="badge"
                          style={{
                            background: `${role.color}20`,
                            color: role.color,
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          {role.icon} {role.label}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => startEdit(member)}>
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { if (confirm(`Delete ${member.name}?`)) deleteMember(member.id); }}
                            style={{ color: 'var(--accent-rose)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {members.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '60px 20px',
                  color: 'var(--text-muted)',
                }}>
                  <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <h3 style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }}>No team members yet</h3>
                  <p style={{ fontSize: '0.85rem' }}>Click "Add Member" to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
