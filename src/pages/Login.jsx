import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { IconUsers, IconAward, IconCheck } from '../components/Icons';

export default function Login() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const next = searchParams.get('next');

  const [role, setRole] = useState(null); // 'customer' | 'staff' | null
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('submitting');
    try {
      await login(role, form);
      if (role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate(next ? decodeURIComponent(next) : '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('login.eyebrow')}</span>
          <h1>{t('login.title')}</h1>
          <p>{t('login.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 480 }}>
          {!role && (
            <>
              <p style={{ textAlign: 'center', fontWeight: 700, marginBottom: 20 }}>{t('login.continueAs')}</p>
              <div className="role-select">
                <button type="button" className="role-card" onClick={() => setRole('customer')}>
                  <span className="role-card__icon"><IconUsers size={24} /></span>
                  <h4>{t('login.studentTitle')}</h4>
                  <p>{t('login.studentDesc')}</p>
                </button>
                <button type="button" className="role-card" onClick={() => setRole('staff')}>
                  <span className="role-card__icon"><IconAward size={24} /></span>
                  <h4>{t('login.staffTitle')}</h4>
                  <p>{t('login.staffDesc')}</p>
                </button>
              </div>
            </>
          )}

          {role && (
            <form className="form-card" onSubmit={handleSubmit} noValidate>
              <p style={{ fontWeight: 700, marginBottom: 18, textTransform: 'capitalize' }}>
                {role === 'staff' ? t('login.staffLogin') : t('login.customerLogin')}
                <button type="button" onClick={() => { setRole(null); setError(''); }} className="btn btn-sm" style={{ float: 'right', color: 'var(--gold)', padding: 0 }}>
                  {t('login.change')}
                </button>
              </p>

              <div className="form-row">
                <label htmlFor="email">{role === 'staff' ? t('login.staffEmail') : t('login.emailOrMobile')} *</label>
                <input id="email" type="text" value={form.email} onChange={update('email')} placeholder={role === 'staff' ? 'you@saitrustkovilpatti.org' : 'Email or mobile number'} required />
              </div>

              <div className="form-row">
                <label htmlFor="password">{t('login.password')} *</label>
                <input id="password" type="password" value={form.password} onChange={update('password')} placeholder="••••••••" required />
              </div>

              {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}

              <button type="submit" className="btn btn-gold btn-block" disabled={status === 'submitting'}>
                {status === 'submitting' ? t('login.signingIn') : t('nav.login')}
              </button>

              {role === 'customer' && (
                <p className="form-note">
                  <Link to="#" onClick={(e) => e.preventDefault()}>{t('login.forgot')}</Link> ·{' '}
                  {t('login.newHere')} <Link to="/register">{t('login.register')}</Link>
                </p>
              )}

              <p className="form-note" style={{ marginTop: 18, opacity: 0.7 }}>
                <IconCheck size={12} style={{ verticalAlign: '-2px' }} /> Demo {role} login: {role === 'staff' ? 'staff@saitrust.demo / Staff@123' : 'customer@saitrust.demo / Customer@123'}
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
