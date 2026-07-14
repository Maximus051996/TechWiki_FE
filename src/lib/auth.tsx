'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from './api/admin';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'techwiki.auth';

/**
 * Admin auth provider. Persists the token in localStorage (remember) or
 * sessionStorage. Kept intentionally small; all API calls take the token
 * explicitly so there's no hidden global mutable state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }
    const { token: saved } = JSON.parse(raw) as { token: string };
    adminApi
      .me(saved)
      .then((res) => {
        setUser(res.user);
        setToken(saved);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember = false) => {
      const res = await adminApi.login(email, password, remember);
      setUser(res.user);
      setToken(res.accessToken);
      const store = remember ? localStorage : sessionStorage;
      store.setItem(STORAGE_KEY, JSON.stringify({ token: res.accessToken }));
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    router.push('/admin/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
