'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import LoadingPulse from '@/components/ui/LoadingPulse';
import { MESSAGE_TONES, CHANNELS } from '@/lib/constants';
import {
  PenTool, Sparkles, Copy, Send, RefreshCw,
  Building2, User, Clock, ChevronRight, Check,
  Mail, Briefcase, MessageCircle, Eye, Layers, ArrowLeft, AlertTriangle
} from 'lucide-react';

function ComposeContent() {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  
  const [tone, setTone] = useState('professional');
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentBusiness');
    if (stored) {
      const biz = JSON.parse(stored);
      setBusiness(biz);
      // Auto-generate on first load
      handleGenerate(biz, 'professional', 'email');
    }
    setLoading(false);
  }, []);

  const handleGenerate = async (biz = business, currentTone = tone, currentChannel = channel) => {
    if (!biz) return;
    
    setGenerating(true);
    setGenerated(false);
    setSubject('');
    setBody('');

    try {
      const res = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: biz, tone: currentTone, channel: currentChannel })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Typing effect
      let i = 0;
      const text = data.body || '';
      if (data.subject) setSubject(data.subject);

      const interval = setInterval(() => {
        if (i < text.length) {
          setBody(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setGenerating(false);
          setGenerated(true);
        }
      }, 10); // Super fast typing
    } catch (err) {
      console.error(err);
      setBody('Drafting failed. Ensure your API keys are configured correctly.');
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = channel === 'email' ? `Subject: ${subject}\n\n${body}` : body;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const channelIcons = {
    email: <Mail size={14} />,
    linkedin: <Briefcase size={14} />,
    whatsapp: <MessageCircle size={14} />,
  };

  if (loading) return null;

  if (!business) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: '10vh' }}>
        <h2>No Prospect Selected</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must select a business from the Scanner directly.</p>
        <button className="btn btn-primary" onClick={() => router.push('/')} style={{ marginTop: '20px' }}>
           Go to Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="page-content py-0">
      <div className="compose-layout animate-fade-in">
        
        {/* Left Column: Configuration */}
        <div className="compose-sidebar panel-border space-y-xl h-full">
          <div>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => router.push(`/analyze/${business.id}`)}
              style={{ padding: 0, marginBottom: '20px' }}
            >
              <ArrowLeft size={14} /> Back to Analysis
            </button>
            <h3 style={{ marginBottom: '16px' }}>Target Profile</h3>
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', border: '1px solid var(--glass-border)'
                }}>
                  {business.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '700' }}>{business.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{business.industry}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {business.missingItems?.slice(0, 3).map((item, i) => (
                  <span key={i} className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '16px' }}>Outreach Channel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CHANNELS.map(ch => (
                <button
                  key={ch.value}
                  className={`channel-btn ${channel === ch.value ? 'active' : ''}`}
                  onClick={() => { setChannel(ch.value); handleGenerate(business, tone, ch.value); }}
                >
                  <div className="channel-icon">
                    {channelIcons[ch.value]}
                  </div>
                  {ch.label}
                  {channel === ch.value && <Check size={14} style={{ marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              AI Voice Tone
              <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}><Sparkles size={10} style={{ display: 'inline', marginRight: '4px' }}/> Gemini AI</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MESSAGE_TONES.map(t => (
                <button
                  key={t.value}
                  className={`tone-btn ${tone === t.value ? 'active' : ''}`}
                  onClick={() => { setTone(t.value); handleGenerate(business, t.value, channel); }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{t.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '400' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="compose-editor">
          <div className="editor-toolbar">
            <div className="flex align-center gap-xs text-sm font-semibold text-secondary">
              <PenTool size={16} className="text-cyan" />
              AI Composer
            </div>
            <div className="flex align-center gap-sm">
              <button className="btn btn-secondary btn-sm" onClick={() => handleGenerate()} disabled={generating}>
                <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                Regenerate
              </button>
              <button className="btn btn-primary btn-sm" disabled={generating || !generated}>
                <Send size={14} /> Add to Pipeline
              </button>
            </div>
          </div>
          
          <div className="editor-paper">
            {generating && !body && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <LoadingPulse active={true} />
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '16px' }}>
                  Crafting hyper-personalized pitch...
                </div>
              </div>
            )}
            
            <div style={{ opacity: generating && !body ? 0 : 1, transition: 'opacity 0.3s ease' }}>
              {channel === 'email' && (
                <div className="editor-field">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Email subject line..."
                    disabled={generating}
                  />
                </div>
              )}
              
              <div className="editor-field" style={{ flex: 1 }}>
                <label>Message Body {generating && <span className="text-cyan tracking-pulse" style={{ fontSize: '0.7rem' }}>● AI IS TYPING</span>}</label>
                <textarea 
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Your composed message will appear here..."
                  disabled={generating}
                  style={{ height: channel === 'email' ? '400px' : '500px' }}
                />
              </div>

              {generated && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    <span><AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--accent-amber)' }} /> Mentioned {business.missingItems?.length} gaps</span>
                    <span><Sparkles size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--accent-cyan)' }} /> {body.split(' ').length} words</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={copyToClipboard}>
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Copy</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComposePage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content flex-col h-screen">
        <Header title="AI Composer" breadcrumb="Compose" />
        <Suspense fallback={
          <div className="page-content relative flex-center h-full">
            <LoadingPulse active={true} />
          </div>
        }>
          <ComposeContent />
        </Suspense>
      </main>
    </div>
  );
}
