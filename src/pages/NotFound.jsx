import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="section container" style={{ textAlign: 'center', minHeight: '50vh' }}>
      <span className="eyebrow" style={{ justifyContent: 'center' }}>404</span>
      <h1 style={{ margin: '14px 0 12px' }}>{t('notFound.title')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 26 }}>{t('notFound.desc')}</p>
      <Link to="/" className="btn btn-gold">{t('common.backToHome')}</Link>
    </section>
  );
}
