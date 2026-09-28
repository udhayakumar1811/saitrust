import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';
import Logo from '../../components/Logo';
import { IconCheck } from '../../components/Icons';

export default function AdminLogin() {
  const { login, demoAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('submitting');
    try {
      await login(form);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
      setStatus('idle');
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <Logo size={46} showWordmark={false} />
        </div>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
          Admin Panel
        </p>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 26 }}>
          SAI International Social Service Trust — internal access only
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="admin-email">Admin Email *</label>
            <input id="admin-email" type="email" required value={form.email} onChange={update('email')} placeholder="admin@saitrustkovilpatti.org" />
          </div>
          <div className="form-row">
            <label htmlFor="admin-password">Password *</label>
            <input id="admin-password" type="password" required value={form.password} onChange={update('password')} placeholder="••••••••" />
          </div>
          {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-gold btn-block" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="form-note" style={{ marginTop: 18, opacity: 0.75 }}>
            <IconCheck size={12} style={{ verticalAlign: '-2px' }} /> Demo admin login: {demoAdmin.email} / {demoAdmin.password}
          </p>
        </form>
      </div>
    </div>
  );
}
