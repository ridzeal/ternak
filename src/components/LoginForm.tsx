'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Navigate to home - cookie will be sent with next request
      router.push('/');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0ead8',
      padding: 20,
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        padding: 32,
        background: '#faf6ee',
        borderRadius: 14,
        border: '1px solid #e0d4c0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 48 }}>🐄</span>
          <h1 style={{ fontSize: 24, margin: '12px 0 4px', color: '#2e2416' }}>
            Ranch OS
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a7d6b' }}>
            Manajer Peternakan Sapi
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#8a7d6b',
              marginBottom: 6,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1.5px solid #d6cbba',
                background: '#fff',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
              placeholder="you@farm.com"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#8a7d6b',
              marginBottom: 6,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1.5px solid #d6cbba',
                background: '#fff',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px',
              background: '#fdecea',
              border: '1px solid #f1a1a1',
              borderRadius: 8,
              color: '#c0392b',
              fontSize: 12,
              marginBottom: 16,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9a8a72' : '#2e2416',
              color: loading ? '#d6cbba' : '#f5f0e8',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'monospace',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
