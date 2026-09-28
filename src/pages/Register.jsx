import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const initialForm = { fullName: '', email: '', phone: '', password: '' };

export default function Register() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Checked client-side first because the backend's own message for this
    // ("Validation failed.") doesn't say *why* — this way the person finds
    // out immediately, before a round trip to the server.
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setStatus('submitting');
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || t('common.somethingWrong'));
      setStatus('idle');
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('register.eyebrow')}</span>
          <h1>{t('register.title')}</h1>
          <p>{t('register.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 480 }}>
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label htmlFor="fullName">{t('admission.fullName')} *</label>
              <input id="fullName" type="text" value={form.fullName} onChange={update('fullName')} required />
            </div>
            <div className="form-row">
              <label htmlFor="email">{t('login.emailOrMobile')} *</label>
              <input id="email" type="text" value={form.email} onChange={update('email')} required />
            </div>
            <div className="form-row">
              <label htmlFor="phone">{t('admission.phone')} *</label>
              <input id="phone" type="tel" maxLength={10} value={form.phone} onChange={update('phone')} required />
            </div>
            <div className="form-row">
              <label htmlFor="password">{t('login.password')} *</label>
              <input id="password" type="password" minLength={6} value={form.password} onChange={update('password')} required />
              <small style={{ color: 'var(--text-muted, #777)', fontSize: 12 }}>At least 6 characters.</small>
            </div>

            {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}

            <button type="submit" className="btn btn-gold btn-block" disabled={status === 'submitting'}>
              {status === 'submitting' ? t('register.creating') : t('login.register')}
            </button>

            <p className="form-note">{t('register.haveAccount')} <Link to="/login">{t('nav.login')}</Link></p>
          </form>
        </div>
      </section>
    </>
  );
}
