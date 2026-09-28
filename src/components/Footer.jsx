import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { IconPhone, IconMail, IconPin, IconInstagram, IconFacebook, IconYoutube, IconWhatsapp } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { SettingsAPI } from '../services/api';

// Shown only until the real backend settings load, or if that call fails.
const FALLBACK_SETTINGS = {
  phones: ['+91 90251 16369', '+91 91509 81734'],
  whatsapp: '919025116369',
  email: 'info@saitrustkovilpatti.org',
  address: 'Kovilpatti, Thoothukudi District, Tamil Nadu',
  social: { instagram: '', facebook: '', youtube: '' },
};

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);

  useEffect(() => {
    SettingsAPI.getPublic().then((res) => {
      if (res.data) setSettings({ ...FALLBACK_SETTINGS, ...res.data });
    });
  }, []);

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__brand">
          <Logo size={42} />
          <p className="footer__about">{t('footer.about')}</p>
          <div className="footer__social">
            {settings.social?.instagram && (
              <a href={settings.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="footer__social-icon"><IconInstagram /></a>
            )}
            {settings.social?.facebook && (
              <a href={settings.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="footer__social-icon"><IconFacebook /></a>
            )}
            {settings.social?.youtube && (
              <a href={settings.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="footer__social-icon"><IconYoutube /></a>
            )}
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">{t('footer.quickLinks')}</h4>
          <ul className="footer__links">
            <li><Link to="/about">{t('nav.about')}</Link></li>
            <li><Link to="/courses">{t('nav.courses')}</Link></li>
            <li><Link to="/batches">{t('nav.batches')}</Link></li>
            <li><Link to="/gallery">{t('nav.gallery')}</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">{t('footer.important')}</h4>
          <ul className="footer__links">
            <li><Link to="/certification">{t('nav.certification')}</Link></li>
            <li><Link to="/admission">{t('admission.eyebrow')}</Link></li>
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
            <li><Link to="/courses">{t('footer.courseFees')}</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">{t('footer.contactUs')}</h4>
          <ul className="footer__contact">
            {(settings.phones || []).map((p) => (
              <li key={p}>
                <IconPhone size={16} />
                <a href={`tel:${p.replace(/\s+/g, '')}`}>{p}</a>
              </li>
            ))}
            <li>
              <IconWhatsapp size={16} />
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">{t('footer.whatsappUs')}</a>
            </li>
            <li>
              <IconMail size={16} />
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </li>
            <li>
              <IconPin size={16} />
              <span>{settings.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} SAI International Social Service Trust, Kovilpatti. {t('footer.rights')}</p>
          <p className="footer__credit">{t('footer.credit')}</p>
        </div>
      </div>
    </footer>
  );
}
