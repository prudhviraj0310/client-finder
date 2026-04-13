'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Zap, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && !loading) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  if (currentUser || loading) {
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div id="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '-150px', left: '-150px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', right: '-150px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '420px', padding: '0 24px',
        position: 'relative', zIndex: 1,
        animation: 'slideUp 500ms ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.5rem', fontWeight: '900', color: 'white',
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
          }}>
            T
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.8rem',
            fontWeight: '800', marginBottom: '8px',
          }}>
            <span className="gradient-text">Client Finder</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            Target · Analyze · Convert
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h2 style={{
            fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px',
            fontFamily: 'var(--font-display)',
          }}>
            Welcome back
          </h2>
          <p style={{
            color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '28px',
          }}>
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '0.75rem', fontWeight: '600',
                color: 'var(--text-secondary)', textTransform: 'uppercase',
                letterSpacing: '0.05em', display: 'block', marginBottom: '8px',
              }}>
                Username
              </label>
              <input
                id="login-username"
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '0.75rem', fontWeight: '600',
                color: 'var(--text-secondary)', textTransform: 'uppercase',
                letterSpacing: '0.05em', display: 'block', marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-tertiary)', cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--accent-rose-dim)', color: 'var(--accent-rose)',
                fontSize: '0.8rem', display: 'flex', alignItems: 'center',
                gap: '8px', marginBottom: '20px',
              }}>
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', fontSize: '0.95rem',
                fontWeight: '700',
              }}
            >
              {loading ? (
                <span className="animate-pulse">Signing in...</span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        {/* Credentials hint */}
        <div style={{
          marginTop: '24px', padding: '16px 20px',
          background: 'var(--accent-cyan-dim)',
          border: '1px solid rgba(0, 212, 255, 0.1)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.75rem', color: 'var(--text-secondary)',
        }}>
          <div style={{
            fontWeight: '700', color: 'var(--accent-cyan)',
            marginBottom: '8px', fontSize: '0.7rem',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <Zap size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Default Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <span>👑 Admin: <code style={{ color: 'var(--accent-cyan)' }}>admin / admin123</code></span>
            <span>🧑‍💼 Team: <code style={{ color: 'var(--accent-cyan)' }}>imran, adharash, shahid / member123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
