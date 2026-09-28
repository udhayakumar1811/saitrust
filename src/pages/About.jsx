import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DynamicImage from '../components/DynamicImage';
import { IconHeart, IconTarget, IconUsers, IconAward, IconArrow, IconCheck } from '../components/Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { AboutAPI } from '../services/api';

export default function About() {
  const { t } = useLanguage();
  // Admin-edited "About" content (Section 3.3) for the media box + text
  // content below — falls back to the default copy/illustration whenever
  // Admin hasn't set a heading yet, so the page never shows a blank section.
  const [about, setAbout] = useState(null);

  useEffect(() => {
    AboutAPI.getPublic().then((res) => setAbout(res.data));
  }, []);

  const hasCustomContent = Boolean(about?.heading);

  const PILLARS = [
    { icon: IconHeart, title: t('about.pillar1Title'), desc: t('about.pillar1Desc') },
    { icon: IconTarget, title: t('about.pillar2Title'), desc: t('about.pillar2Desc') },
    { icon: IconUsers, title: t('about.pillar3Title'), desc: t('about.pillar3Desc') },
    { icon: IconAward, title: t('about.pillar4Title'), desc: t('about.pillar4Desc') },
  ];

  const AUDIENCE = [
    t('about.audience1'), t('about.audience2'), t('about.audience3'), t('about.audience4'), t('about.audience5'),
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('about.eyebrow')}</span>
          <h1>{t('about.title')}</h1>
          <p>{t('about.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-intro">
          <div className="about-intro__media">
            {about?.mediaType === 'video' && about?.mediaUrl ? (
              <video src={about.mediaUrl} controls style={{ width: '100%', aspectRatio: '4 / 4.5', objectFit: 'cover', borderRadius: 'inherit', display: 'block' }} />
            ) : (
              <DynamicImage src={about?.mediaType === 'image' ? about?.mediaUrl : null} icon="users" ratio="4 / 4.5" />
            )}
          </div>
          <div className="about-intro__content">
            <span className="eyebrow">{t('about.whoWeAreEyebrow')}</span>
            {hasCustomContent ? (
              <>
                <h2>{about.heading}</h2>
                {about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                {about.checklist.length > 0 && (
                  <ul className="check-list">
                    {about.checklist.map((c, i) => <li key={i}><IconCheck size={16} /> {c}</li>)}
                  </ul>
                )}
                <Link to={about.buttonLink || '/courses'} className="btn btn-gold">{about.buttonText || t('about.exploreCourses')} <IconArrow size={16} /></Link>
              </>
            ) : (
              <>
                <h2>{t('about.whoWeAreTitle')}</h2>
                <p>{t('about.p1')}</p>
                <p>{t('about.p2')}</p>
                <ul className="check-list">
                  <li><IconCheck size={16} /> {t('about.check1')}</li>
                  <li><IconCheck size={16} /> {t('about.check2')}</li>
                  <li><IconCheck size={16} /> {t('about.check3')}</li>
                  <li><IconCheck size={16} /> {t('about.check4')}</li>
                </ul>
                <Link to="/courses" className="btn btn-gold">{t('about.exploreCourses')} <IconArrow size={16} /></Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section section--tight why-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('about.focusEyebrow')}</span>
            <h2>{t('about.focusTitle')}</h2>
            <div className="divider-gold" />
          </div>
          <div className="grid-4">
            {PILLARS.map((p) => (
              <div className="why-card" key={p.title} style={{ textAlign: 'center' }}>
                <span className="why-card__icon" style={{ margin: '0 auto 16px' }}><p.icon size={24} /></span>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-audience">
          <div>
            <span className="eyebrow">{t('about.whoJoinEyebrow')}</span>
            <h2>{t('about.whoJoinTitle')}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.7 }}>
              {t('about.whoJoinDesc')}
            </p>
          </div>
          <ul className="audience-list">
            {AUDIENCE.map((a) => (
              <li key={a}><IconCheck size={16} /> {a}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta-strip">
        <div className="container cta-strip__inner">
          <div>
            <h3>{t('about.ctaTitle')}</h3>
            <p>{t('about.ctaDesc')}</p>
          </div>
          <Link to="/admission" className="btn btn-gold">{t('common.applyAdmission')} <IconArrow size={16} /></Link>
        </div>
      </section>
    </>
  );
}
