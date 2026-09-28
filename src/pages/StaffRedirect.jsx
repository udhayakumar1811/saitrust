import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SettingsAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Staff land here right after a successful staff login. The full admin
 * dashboard is a separate app (Developer 2) — this page just resolves the
 * configured dashboard URL from settings/env and forwards staff there.
 */
export default function StaffRedirect() {
  const { t } = useLanguage();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    SettingsAPI.getPublic().then((res) => {
      const url = res.data?.staffDashboardUrl;
      setTarget(url || '/staff/pending');
      if (url && /^https?:\/\//.test(url)) {
        window.location.href = url;
      }
    });
  }, []);

  return (
    <section className="section container" style={{ maxWidth: 520, textAlign: 'center' }}>
      <h1 style={{ fontSize: 26, marginBottom: 14 }}>{t('staff.redirecting')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 22 }}>
        {target && !/^https?:\/\//.test(target) ? t('staff.notConnected') : t('staff.manualLink')}
      </p>
      {target && /^https?:\/\//.test(target) && (
        <a href={target} className="btn btn-gold">{t('staff.goToDashboard')}</a>
      )}
      <div style={{ marginTop: 18 }}>
        <Link to="/" className="btn btn-outline-dark btn-sm">{t('common.backToHome')}</Link>
      </div>
    </section>
  );
}
