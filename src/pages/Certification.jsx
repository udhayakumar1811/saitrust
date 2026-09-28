import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DynamicImage from '../components/DynamicImage';
import { IconArrow } from '../components/Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { CertificationAPI } from '../services/api';

export default function Certification() {
  const { t } = useLanguage();
  // Admin-uploaded certification image (Section 3.6), if any — DynamicImage
  // falls back to the illustrated ArtPanel placeholder when there's none.
  const [image, setImage] = useState(null);

  useEffect(() => {
    CertificationAPI.getActive().then((res) => setImage(res.data));
  }, []);

  const STEPS = [
    { title: t('certification.step1Title'), desc: t('certification.step1Desc') },
    { title: t('certification.step2Title'), desc: t('certification.step2Desc') },
    { title: t('certification.step3Title'), desc: t('certification.step3Desc') },
    { title: t('certification.step4Title'), desc: t('certification.step4Desc') },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('certification.eyebrow')}</span>
          <h1>{t('certification.title')}</h1>
          <p>{t('certification.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container cert-section">
          <div className="cert-frame">
            <DynamicImage src={image?.image} alt={image?.caption || ''} icon="users" ratio="4 / 3" />
          </div>
          <div>
            <span className="eyebrow">{t('certification.howItWorks')}</span>
            <h2 style={{ margin: '10px 0 22px', fontSize: 'clamp(24px, 3vw, 32px)' }}>
              {t('certification.fromClassroom')}
            </h2>
            <div className="cert-steps">
              {STEPS.map((s, i) => (
                <div className="cert-step" key={s.title}>
                  <span className="cert-step__num">{i + 1}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admission" className="btn btn-gold">{t('certification.startCourse')} <IconArrow size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section section--tight why-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('certification.whyMatters')}</span>
            <h2>{t('certification.benefitsTitle')}</h2>
            <div className="divider-gold" />
          </div>
          <div className="grid-3">
            <div className="why-card">
              <h4>{t('certification.benefit1Title')}</h4>
              <p>{t('certification.benefit1Desc')}</p>
            </div>
            <div className="why-card">
              <h4>{t('certification.benefit2Title')}</h4>
              <p>{t('certification.benefit2Desc')}</p>
            </div>
            <div className="why-card">
              <h4>{t('certification.benefit3Title')}</h4>
              <p>{t('certification.benefit3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
