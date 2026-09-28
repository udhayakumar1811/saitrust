import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

// Admin login is intentionally separate from the student/staff auth used on
// the public site (Backend Spec Section 1) — its own storage key, its own
// endpoint (POST /api/admin/auth/login), its own context.
const AdminAuthContext = createContext(null);
const STORAGE_KEY = 'sai_admin_auth';

const DEMO_ADMIN = {
  email: 'admin@saitrust.demo',
  password: 'Admin@1234',
  user: { id: 'admin-1', name: 'Trust Admin', email: 'admin@saitrust.demo' },
};

const authApi = axios.create({ baseURL: API_BASE_URL, timeout: 12000, headers: { 'Content-Type': 'application/json' } });

function loadSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await authApi.post('/admin/auth/login', { email, password });
      const next = res.data.data; // { user, token }
      setSession(next);
      return next;
    } catch (err) {
      // Falls back to the local demo admin if the backend itself is
      // unreachable (network/timeout), OR if it responded but has no
      // admin-login route at all (404 — happens when BACKEND doesn't
      // implement /admin/auth/login yet). A real 401/403 from an actual
      // admin-login endpoint is always treated as a genuine
      // invalid-credentials error, never silently retried against the
      // demo account.
      const backendUnavailable = !err.response || err.response.status === 404;
      if (backendUnavailable && email?.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        const next = { user: DEMO_ADMIN.user, token: 'demo-admin-token' };
        setSession(next);
        return next;
      }
      throw new Error(err?.response?.data?.message || 'Invalid admin email or password.');
    }
  }, []);

  const logout = useCallback(() => setSession(null), []);

  const value = useMemo(() => ({
    session,
    admin: session?.user || null,
    isAdminAuthenticated: !!session,
    login,
    logout,
    demoAdmin: DEMO_ADMIN,
  }), [session, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
