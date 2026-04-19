'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * useAuth — Client-side auth state hook.
 * Checks /api/auth/me on mount and caches the result in sessionStorage
 * to prevent flash of unauthenticated state on navigation.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Try sessionStorage cache first for instant render
      const cached = sessionStorage.getItem('okinte-auth');
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setLoading(false);
      }

      // Always verify with server
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        sessionStorage.setItem('okinte-auth', JSON.stringify(data.user));
      } else {
        setUser(null);
        sessionStorage.removeItem('okinte-auth');
      }
    } catch {
      setUser(null);
      sessionStorage.removeItem('okinte-auth');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    sessionStorage.removeItem('okinte-auth');
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    refresh: checkAuth,
    logout,
  };
}
