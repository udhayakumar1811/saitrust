import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthAPI } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'sai_auth';

function loadStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadStoredSession);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  // role: 'customer' | 'staff'
  const login = useCallback(async (role, credentials) => {
    const res = await AuthAPI.login(role, credentials);
    if (!res.data) throw new Error(res.error || 'Login failed. Please check your credentials.');
    const next = { role, user: res.data.user, token: res.data.token };
    setSession(next);
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await AuthAPI.register(payload);
    if (!res.data) throw new Error(res.error || 'Registration failed. Please try again.');
    const next = { role: 'customer', user: res.data.user, token: res.data.token };
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => setSession(null), []);

  // Client-side profile edit (name/phone/email/avatar) — attempts the real
  // backend first via ProfileAPI, then always applies the change to the
  // local session so the demo stays usable before the backend is connected.
  const updateUser = useCallback((patch) => {
    setSession((s) => (s ? { ...s, user: { ...s.user, ...patch } } : s));
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    role: session?.role || null,
    isAuthenticated: !!session,
    isCustomer: session?.role === 'customer',
    isStaff: session?.role === 'staff',
    login,
    register,
    logout,
    updateUser,
  }), [session, login, register, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
