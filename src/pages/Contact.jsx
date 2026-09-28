import { useEffect, useState } from 'react';
import { EnquiriesAPI, SettingsAPI } from '../services/api';
import { IconPhone, IconWhatsapp, IconMail, IconPin, IconInstagram, IconFacebook, IconYoutube, IconCheck } from '../components/Icons';
import { useLanguage } from '../i18n/LanguageContext';

const initialForm = { name: '', phone: '', email: '', message: '' };

// Shown only until the real backend settings load, or if that call fails —
// never a substitute for the admin-managed values once they're available.
const FALLBACK_SETTINGS = {
  phones: ['+91 90251 16369', '+91 91509 81734'],
  whatsapp: '919025116369',
  email: 'info@saitrustkovilpatti.org',
  address: 'Kovilpatti, Thoothukudi District, Tamil Nadu',
  social: { instagram: '', facebook: '', youtube: '' },
};

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);

  useEffect(() => {
    SettingsAPI.getPublic().then((res) => {
      if (res.data) setSettings({ ...FALLBACK_SETTINGS, ...res.data });
    });
  }, []);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('contact.errName');
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = t('contact.errPhone');
    if (!form.message.trim()) e.message = t('contact.errMessage');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    try {
      await EnquiriesAPI.submit(form);
      setStatus('success');
      setForm(initialForm);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('contact.eyebrow')}</span>
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info-card">
            <h3>{t('contact.getInTouch')}</h3>

            <div className="contact-info-row">
              <span className="contact-info-row__icon"><IconPhone size={18} /></span>
              <div>
                <strong>{t('contact.phone')}</strong>
                {(settings.phones || []).map((p) => (
                  <div key={p}><a href={`tel:${p.replace(/\s+/g, '')}`}>{p}</a></div>
                ))}
              </div>
            </div>

            <div className="contact-info-row">
              <span className="contact-info-row__icon"><IconWhatsapp size={18} /></span>
              <div>
                <strong>{t('contact.whatsapp')}</strong>
                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">{t('contact.chatNow')}</a>
              </div>
            </div>

            <div className="contact-info-row">
              <span className="contact-info-row__icon"><IconMail size={18} /></span>
              <div>
                <strong>{t('contact.email')}</strong>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </div>
            </div>

            <div className="contact-info-row">
              <span className="contact-info-row__icon"><IconPin size={18} /></span>
              <div>
                <strong>{t('contact.location')}</strong>
                <span>{settings.address}</span>
              </div>
            </div>

            <div>
              <strong style={{ display: 'block', marginBottom: 10, fontSize: 13.5 }}>{t('contact.followUs')}</strong>
              <div className="contact-social">
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
          </div>

          <div>
            {status === 'success' ? (
              <div className="form-card" style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', width: 60, height: 60, borderRadius: '50%', background: 'var(--cream-2)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <IconCheck size={26} color="var(--gold)" />
                </span>
                <h3 style={{ fontSize: 22, marginBottom: 10 }}>{t('contact.successTitle')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{t('contact.successDesc')}</p>
              </div>
            ) : (
              <form className="form-card" onSubmit={handleSubmit} noValidate>
                <div className="form-grid-2">
                  <div className="form-row">
                    <label htmlFor="c-name">{t('contact.formName')} *</label>
                    <input id="c-name" type="text" placeholder="Your name" value={form.name} onChange={update('name')} aria-invalid={!!errors.name} />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-row">
                    <label htmlFor="c-phone">{t('contact.formPhone')} *</label>
                    <input id="c-phone" type="tel" maxLength={10} placeholder="10-digit mobile number" value={form.phone} onChange={update('phone')} aria-invalid={!!errors.phone} />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="c-email">{t('contact.formEmail')}</label>
                  <input id="c-email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
                </div>

                <div className="form-row">
                  <label htmlFor="c-message">{t('contact.formMessage')} *</label>
                  <textarea id="c-message" rows={5} placeholder="How can we help?" value={form.message} onChange={update('message')} aria-invalid={!!errors.message} />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                {status === 'error' && (
                  <p className="form-error" style={{ marginBottom: 12 }}>{t('contact.errorMsg')}</p>
                )}

                <button type="submit" className="btn btn-gold btn-block" disabled={status === 'submitting'}>
                  {status === 'submitting' ? t('contact.sending') : t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 84 }}>
        <div className="map-frame">
          <iframe
            title="SAI Trust Location — Kovilpatti"
            src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`}
            width="100%"
            height="360"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
