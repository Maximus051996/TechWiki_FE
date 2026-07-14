'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api/client';
import { BrandLogo } from '@/components/BrandLogo';
import { Typewriter } from '@/components/Typewriter';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password, remember);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-stage">
      {/* Flowing silk / aurora ribbons */}
      <div className="aurora" aria-hidden="true">
        <span className="ribbon r1" />
        <span className="ribbon r2" />
        <span className="ribbon r3" />
        <span className="ribbon r4" />
      </div>
      <div className="grain" aria-hidden="true" />

      <div className="auth-grid">
        {/* Left — welcome */}
        <div className="auth-welcome">
          <div className="logo-halo reveal" style={{ animationDelay: '.08s' }}>
            <div className="logo-float">
              <BrandLogo size={112} />
            </div>
          </div>

          <h1 className="welcome-line">
            <span className="welcome-kicker">Welcome to</span>
            <span className="welcome-brand">
              <Typewriter />
            </span>
          </h1>
        </div>

        {/* Right — sign in card */}
        <form onSubmit={onSubmit} className="auth-card reveal-card">
          <div className="auth-card-head">
            <h2>Sign in</h2>
          </div>

          {error && (
            <div className="auth-alert">
              <span>⛔</span>
              <span>{error}</span>
            </div>
          )}

          <div className="pill-field reveal" style={{ animationDelay: '.24s' }}>
            <span className="pill-badge" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </span>
            <input
              id="email"
              className="pill-input"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="pill-field reveal" style={{ animationDelay: '.32s' }}>
            <span className="pill-badge" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <input
              id="password"
              className="pill-input"
              type={showPass ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="pill-eye"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>

          <div className="auth-row reveal" style={{ animationDelay: '.4s' }}>
            <label className="switch">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="switch-track"><span className="switch-thumb" /></span>
              <span>Remember me</span>
            </label>
          </div>

          <button type="submit" className="btn-submit reveal" style={{ animationDelay: '.48s' }} disabled={submitting}>
            {submitting ? <><span className="spinner spinner-dark" /> Signing in…</> : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
