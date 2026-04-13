'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTasks } from '@/lib/TaskContext';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import {
  CheckCircle, Circle, Phone, PhoneCall, PhoneOff, Clock,
  AlertTriangle, MessageCircle, FileText, ChevronDown, ChevronUp,
  Loader2, Target, Calendar, Users, Plus, Trash2, Send,
  BookOpen, Zap, Copy, Check, X, ArrowRight,
} from 'lucide-react';

function ObjectiveItem({ text, completed, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        cursor: 'pointer', transition: 'all 200ms',
        background: completed ? 'var(--accent-emerald-dim)' : 'var(--glass-bg)',
        border: `1px solid ${completed ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass-border)'}`,
      }}
    >
      {completed ? (
        <CheckCircle size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
      ) : (
        <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      )}
      <span style={{
        fontSize: '0.9rem', fontWeight: '500',
        textDecoration: completed ? 'line-through' : 'none',
        color: completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
      }}>
        {text}
      </span>
    </div>
  );
}

function ScriptSection({ script, loading }) {
  const [expandedSection, setExpandedSection] = useState('opening');
  const [copied, setCopied] = useState('');

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-cyan)', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Generating your call script...</p>
      </div>
    );
  }

  if (!script) return null;

  const sections = [
    { key: 'opening', label: '🎯 Opening Script', content: script.opening, icon: <PhoneCall size={16} /> },
    { key: 'painPoints', label: '⚡ Pain Points to Mention', content: script.painPoints, icon: <AlertTriangle size={16} /> },
    { key: 'objections', label: '🛡️ Objection Handling', content: script.objectionHandling, icon: <MessageCircle size={16} /> },
    { key: 'closing', label: '🎉 Closing Script', content: script.closingScript, icon: <Target size={16} /> },
    { key: 'talking', label: '📊 Key Talking Points', content: script.keyTalkingPoints, icon: <FileText size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sections.map(section => (
        <div
          key={section.key}
          className="glass-card-static"
          style={{ overflow: 'hidden' }}
        >
          <button
            onClick={() => setExpandedSection(expandedSection === section.key ? '' : section.key)}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', border: 'none',
              color: expandedSection === section.key ? 'var(--accent-cyan)' : 'var(--text-primary)',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {section.icon}
            {section.label}
            <span style={{ marginLeft: 'auto' }}>
              {expandedSection === section.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {expandedSection === section.key && (
            <div style={{ padding: '0 16px 16px', animation: 'slideUp 200ms ease' }}>
              {/* Opening / Closing — simple text */}
              {typeof section.content === 'string' && (
                <div style={{
                  padding: '16px', background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
                  lineHeight: '1.7', color: 'var(--text-secondary)',
                  position: 'relative',
                }}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{section.content}</p>
                  <button
                    onClick={() => copyText(section.content, section.key)}
                    className="btn btn-ghost btn-sm"
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    {copied === section.key ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {/* Pain Points / Talking Points — array */}
              {Array.isArray(section.content) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {section.content.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px', background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: '800', flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Objection Handling — object */}
              {section.content && typeof section.content === 'object' && !Array.isArray(section.content) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(section.content).map(([objection, response], i) => (
                    <div
                      key={i}
                      style={{
                        padding: '16px', background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--accent-amber)',
                      }}
                    >
                      <div style={{
                        fontWeight: '700', fontSize: '0.85rem',
                        color: 'var(--accent-amber)', marginBottom: '8px',
                      }}>
                        🗣️ "{objection}"
                      </div>
                      <div style={{
                        fontSize: '0.85rem', color: 'var(--text-secondary)',
                        lineHeight: '1.6', paddingLeft: '4px',
                      }}>
                        👉 {response}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CallLogEntry({ entry }) {
  const outcomeConfig = {
    'answered': { color: 'var(--accent-emerald)', label: 'Answered', icon: <PhoneCall size={12} /> },
    'interested': { color: 'var(--accent-cyan)', label: 'Interested', icon: <Target size={12} /> },
    'callback': { color: 'var(--accent-amber)', label: 'Callback', icon: <Clock size={12} /> },
    'no-answer': { color: 'var(--text-tertiary)', label: 'No Answer', icon: <PhoneOff size={12} /> },
    'rejected': { color: 'var(--accent-rose)', label: 'Rejected', icon: <X size={12} /> },
  };
  const cfg = outcomeConfig[entry.outcome] || outcomeConfig['no-answer'];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', borderRadius: 'var(--radius-md)',
      background: 'var(--glass-bg)',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: `${cfg.color}20`, color: cfg.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{entry.businessName}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {entry.phone} · {entry.notes}
        </div>
      </div>
      <span className="badge" style={{ background: `${cfg.color}20`, color: cfg.color, fontSize: '0.6rem' }}>
        {cfg.label}
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        {new Date(entry.calledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

export default function TasksPage() {
  const { currentUser, isAdmin, getTeamMembers } = useAuth();
  const { tasks, getTasksForUser, getAllTasks, toggleObjective, addCallLog, updateTask, deleteTask } = useTasks();
  const router = useRouter();

  const [selectedTask, setSelectedTask] = useState(null);
  const [script, setScript] = useState(null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [painPoints, setPainPoints] = useState(null);
  const [activeTab, setActiveTab] = useState('objectives');
  const [callForm, setCallForm] = useState({ businessName: '', phone: '', outcome: 'answered', notes: '' });
  const [journalText, setJournalText] = useState('');
  const { addJournalEntry } = useTasks();

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const myTasks = isAdmin ? getAllTasks() : getTasksForUser(currentUser.id);

  const loadScript = async (task) => {
    setScriptLoading(true);
    try {
      const res = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: task.industry,
          location: task.location,
          businessName: task.businesses?.[0]?.name || '',
        }),
      });
      const data = await res.json();
      setScript(data.script);
    } catch (err) {
      console.error('Script load error:', err);
    }
    setScriptLoading(false);
  };

  const loadPainPoints = async (task) => {
    try {
      const res = await fetch('/api/pain-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: task.industry,
          location: task.location,
        }),
      });
      const data = await res.json();
      setPainPoints(data.painPoints);
    } catch (err) {
      console.error('Pain points load error:', err);
    }
  };

  const selectTask = (task) => {
    setSelectedTask(task);
    setActiveTab('objectives');
    setScript(null);
    setPainPoints(null);
    loadScript(task);
    loadPainPoints(task);
  };

  const handleLogCall = () => {
    if (!selectedTask || !callForm.businessName) return;
    addCallLog(selectedTask.id, callForm);
    setCallForm({ businessName: '', phone: '', outcome: 'answered', notes: '' });
  };

  const handleSaveJournal = () => {
    if (!journalText.trim()) return;
    addJournalEntry(currentUser.id, journalText);
    setJournalText('');
  };

  const tabConfig = [
    { id: 'objectives', label: 'Objectives', icon: <Target size={14} /> },
    { id: 'businesses', label: 'Business List', icon: <Phone size={14} /> },
    { id: 'painpoints', label: 'Pain Points', icon: <AlertTriangle size={14} /> },
    { id: 'script', label: 'Call Script', icon: <BookOpen size={14} /> },
    { id: 'calllog', label: 'Call Log', icon: <PhoneCall size={14} /> },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title={isAdmin ? "All Team Tasks" : "My Tasks"} breadcrumb="Tasks" />
        <div className="page-content" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - var(--header-height) - 48px)' }}>

          {/* Task List (Left) */}
          <div style={{
            width: '320px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: '8px',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                {isAdmin ? 'All Tasks' : "Today's Tasks"} ({myTasks.length})
              </span>
            </div>

            {myTasks.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: 'var(--text-muted)',
              }}>
                <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>No tasks assigned yet</p>
                {isAdmin && (
                  <p style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                    Scan businesses first, then assign them to team members
                  </p>
                )}
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {myTasks.map((task, idx) => {
                const completedCount = task.completedObjectives?.length || 0;
                const totalCount = task.objectives?.length || 0;
                const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                const isSelected = selectedTask?.id === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => selectTask(task)}
                    className="glass-card"
                    style={{
                      padding: '16px', cursor: 'pointer',
                      borderColor: isSelected ? 'var(--accent-cyan)' : undefined,
                      background: isSelected ? 'var(--accent-cyan-dim)' : undefined,
                      animation: `slideUp 300ms ease ${idx * 40}ms forwards`,
                      opacity: 0, flexShrink: 0,
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '6px' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                      📍 {task.location} · 🏢 {task.industry}
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      height: '4px', background: 'var(--bg-tertiary)',
                      borderRadius: '2px', overflow: 'hidden', marginBottom: '8px',
                    }}>
                      <div style={{
                        width: `${progress}%`, height: '100%',
                        background: progress === 100 ? 'var(--accent-emerald)' : 'var(--gradient-primary)',
                        borderRadius: '2px', transition: 'width 500ms ease',
                      }} />
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.7rem', color: 'var(--text-tertiary)',
                    }}>
                      <span>{completedCount}/{totalCount} objectives</span>
                      <span>{task.callLog?.length || 0} calls</span>
                    </div>

                    {isAdmin && (
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
                          <Users size={10} /> {task.assignedTo}
                        </span>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                          style={{ color: 'var(--accent-rose)', padding: '4px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Daily Journal Form */}
            <div className="glass-card-static" style={{ padding: '16px', marginTop: '16px', flexShrink: 0, background: 'var(--bg-tertiary)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '0.85rem' }}>
                <BookOpen size={14} style={{ color: 'var(--accent-cyan)' }} /> Daily Journal
              </h4>
              <textarea
                className="input"
                placeholder="What did you learn today? Log your challenges and wins..."
                rows={3}
                style={{ resize: 'none', marginBottom: '12px', fontSize: '0.8rem', width: '100%' }}
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
              />
              <button 
                className="btn btn-primary btn-sm" 
                style={{ width: '100%' }}
                onClick={handleSaveJournal}
                disabled={!journalText.trim()}
              >
                Submit Entry
              </button>
            </div>
          </div>

          {/* Task Detail (Right) */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!selectedTask ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}>
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }}>Select a task</h3>
                <p style={{ fontSize: '0.85rem' }}>Click on a task to view objectives, scripts, and call log</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                {/* Task Header */}
                <div className="glass-card-static" style={{
                  padding: '20px', marginBottom: '16px',
                  borderLeft: '3px solid var(--accent-cyan)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{selectedTask.title}</h2>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        📍 {selectedTask.location} · 🏢 {selectedTask.industry} · 📅 {selectedTask.dueDate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        className="input select"
                        value={selectedTask.status}
                        onChange={(e) => updateTask(selectedTask.id, { status: e.target.value })}
                        style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 30px 6px 10px' }}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="in-progress">🔄 In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{
                  display: 'flex', gap: '4px', marginBottom: '16px',
                  overflowX: 'auto', paddingBottom: '4px',
                }}>
                  {tabConfig.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in" key={activeTab}>
                  {/* Objectives */}
                  {activeTab === 'objectives' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedTask.objectives?.map((obj, i) => (
                        <ObjectiveItem
                          key={i}
                          text={obj}
                          completed={selectedTask.completedObjectives?.includes(i)}
                          onToggle={() => toggleObjective(selectedTask.id, i)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Business List */}
                  {activeTab === 'businesses' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(selectedTask.businesses || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          <p>No businesses assigned yet. Admin will assign after scanning.</p>
                        </div>
                      ) : (
                        selectedTask.businesses.map((biz, i) => (
                          <div
                            key={biz.id || i}
                            className="glass-card"
                            style={{
                              padding: '16px',
                              display: 'flex', alignItems: 'center', gap: '14px',
                            }}
                          >
                            <div style={{
                              width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-elevated)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.2rem',
                            }}>
                              {biz.icon || '🏢'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{biz.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{biz.address}</div>
                            </div>
                            {biz.phone && (
                              <a href={`tel:${biz.phone}`} style={{ textDecoration: 'none' }}>
                                <button className="btn btn-primary btn-sm">
                                  <Phone size={12} /> {biz.phone}
                                </button>
                              </a>
                            )}
                            {biz.rating > 0 && (
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-amber)' }}>
                                ⭐ {biz.rating}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Pain Points */}
                  {activeTab === 'painpoints' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {!painPoints ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-cyan)', margin: '0 auto 12px' }} />
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading pain points...</p>
                        </div>
                      ) : (
                        painPoints.map((pp, i) => {
                          const severityColors = {
                            critical: 'var(--accent-rose)',
                            high: 'var(--accent-amber)',
                            medium: 'var(--accent-cyan)',
                            low: 'var(--accent-emerald)',
                          };
                          return (
                            <div
                              key={i}
                              className="glass-card"
                              style={{
                                padding: '16px',
                                borderLeft: `3px solid ${severityColors[pp.severity] || 'var(--accent-cyan)'}`,
                              }}
                            >
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
                              }}>
                                <span className="badge" style={{
                                  background: `${severityColors[pp.severity]}20`,
                                  color: severityColors[pp.severity],
                                  fontSize: '0.6rem',
                                }}>
                                  {pp.severity}
                                </span>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{pp.pain}</span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                💡 <strong>Impact:</strong> {pp.impact}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Call Script */}
                  {activeTab === 'script' && (
                    <ScriptSection script={script} loading={scriptLoading} />
                  )}

                  {/* Call Log */}
                  {activeTab === 'calllog' && (
                    <div>
                      {/* Log a call form */}
                      <div className="glass-card-static" style={{ padding: '16px', marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>📞 Log a Call</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input
                            className="input"
                            placeholder="Business name"
                            value={callForm.businessName}
                            onChange={(e) => setCallForm({ ...callForm, businessName: e.target.value })}
                          />
                          <input
                            className="input"
                            placeholder="Phone number"
                            value={callForm.phone}
                            onChange={(e) => setCallForm({ ...callForm, phone: e.target.value })}
                          />
                          <select
                            className="input select"
                            value={callForm.outcome}
                            onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                          >
                            <option value="answered">✅ Answered</option>
                            <option value="interested">🎯 Interested</option>
                            <option value="callback">🔄 Callback Later</option>
                            <option value="no-answer">📵 No Answer</option>
                            <option value="rejected">❌ Rejected</option>
                          </select>
                          <input
                            className="input"
                            placeholder="Notes..."
                            value={callForm.notes}
                            onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                          />
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleLogCall}
                          disabled={!callForm.businessName}
                          style={{ marginTop: '12px' }}
                        >
                          <Plus size={14} /> Log Call
                        </button>
                      </div>

                      {/* Call history */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(selectedTask.callLog || []).length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            <PhoneOff size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ fontSize: '0.85rem' }}>No calls logged yet. Start calling!</p>
                          </div>
                        ) : (
                          [...(selectedTask.callLog || [])].reverse().map((entry) => (
                            <CallLogEntry key={entry.id} entry={entry} />
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
