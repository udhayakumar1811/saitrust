import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DynamicImage from '../components/DynamicImage';
import { ErrorState } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import useApplications from '../hooks/useApplications';
import { ApplicationsAPI, CoursesAPI, BatchesAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { IconCheck, IconClock, IconArrow, IconWhatsapp, IconAward, IconCalendar } from '../components/Icons';

const ICON_BY_CATEGORY = {
  Tailoring: 'scissors',
  'Aari Embroidery': 'needle',
  Beautician: 'sparkle',
  'Cake Baking': 'cake',
};

export default function CourseDetails() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const isTa = lang === 'ta';
  const { isStaff } = useAuth();
  const { applications } = useApplications();
  const [course, setCourse] = useState(undefined); // undefined = loading, null = not found
  const [error, setError] = useState(false);
  const [batches, setBatches] = useState([]);
  // Staff never enroll; students who already applied see "Applied".
  const applied = ApplicationsAPI.isApplied(applications, slug);

  useEffect(() => {
    setCourse(undefined);
    setError(false);
    CoursesAPI.getBySlug(slug).then((res) => {
      // withFallback() sets `error` whenever the network call failed, even
      // if it still found matching fallback data — that's the case here
      // 99% of the time (backend not running yet), so only treat it as a
      // real error when there's genuinely no course data to show.
      if (res.error && !res.data) setError(true);
      setCourse(res.data || null);
    });
    BatchesAPI.getUpcoming().then((res) => {
      const all = res.data || [];
      setBatches(all.filter((b) => b.courseSlug === slug).slice(0, 3));
    });
  }, [slug]);

  if (error) {
    return (
      <div className="section container">
        <ErrorState message={t('courseDetails.errorMsg')} />
      </div>
    );
  }

  if (course === undefined) {
    return (
      <div className="section container">
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="section container" style={{ textAlign: 'center' }}>
        <h2>{t('courseDetails.notFoundTitle')}</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
          {t('courseDetails.notFoundDesc')}
        </p>
        <Link to="/courses" className="btn btn-gold">{t('courseDetails.browseAll')}</Link>
      </div>
    );
  }

  const name = (isTa && course.nameTa) || course.name;
  const description = (isTa && course.descriptionTa) || course.description;
  const duration = (isTa && course.durationTa) || course.duration;
  const tagline = (isTa && course.taglineTa) || course.tagline;
  const modules =
    (isTa && Array.isArray(course.highlightsTa) && course.highlightsTa.length && course.highlightsTa) ||
    (Array.isArray(course.highlights) ? course.highlights : []);
  const benefits =
    (isTa && Array.isArray(course.benefitsTa) && course.benefitsTa.length && course.benefitsTa) ||
    (Array.isArray(course.benefits) ? course.benefits : []);
  const practicalProject = (isTa && course.practicalProjectTa) || course.practicalProject;

  return (
    <>
      <section className="cd-hero">
        <div className="container">
          <p className="cd-breadcrumb">
            <Link to="/">{t('courseDetails.home')}</Link> / <Link to="/courses">{t('courseDetails.courses')}</Link> / {name}
          </p>
        </div>
        <div className="container cd-hero__grid">
          <div className="cd-hero__media">
            <DynamicImage src={course.image} alt={name} icon={ICON_BY_CATEGORY[course.category] || 'users'} ratio="4 / 3.4" />
          </div>
          <div className="cd-hero__content">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{tagline}</span>
            <h1>{name}</h1>
            <p>{description}</p>
            <div className="cd-hero__pills">
              <span className="pill" style={{ color: 'var(--gold-light)' }}><IconClock size={13} /> &nbsp;{duration}</span>
              <span className="pill" style={{ color: 'var(--gold-light)' }}><IconAward size={13} /> &nbsp;{t('courseDetails.freeTraining')}</span>
              <span className="pill" style={{ color: 'var(--gold-light)' }}><IconCalendar size={13} /> &nbsp;{t('courseDetails.isoCertified')}</span>
            </div>
            <div className="cd-hero__actions">
              {!isStaff && (
                applied ? (
                  <span className="btn btn-gold is-applied" aria-disabled="true">{t('common.applied')}</span>
                ) : (
                  <Link to={`/admission?course=${course.slug}`} className="btn btn-gold">
                    {t('courseDetails.enrollNow')} <IconArrow size={16} />
                  </Link>
                )
              )}
              <a href="https://wa.me/919025116369" target="_blank" rel="noreferrer" className="btn btn-ghost">
                <IconWhatsapp size={16} /> {t('courseDetails.whatsappUs')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cd-body">
          <div>
            <div className="cd-block">
              <h3>{t('courseDetails.courseModules')}</h3>
              <ul className="cd-modules">
                {modules.map((m) => (
                  <li key={m}><IconCheck size={15} /> {m}</li>
                ))}
              </ul>
            </div>

            <div className="cd-block">
              <div className="cd-project">
                <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('courseDetails.practicalProject')}</span>
                <p>{practicalProject}</p>
              </div>
            </div>

            <div className="cd-block">
              <h3>{t('courseDetails.benefitsCareer')}</h3>
              <ul className="cd-benefits">
                {benefits.map((b) => (
                  <li key={b}><IconCheck size={15} /> {b}</li>
                ))}
              </ul>
            </div>

            <div className="cd-block" style={{ marginBottom: 0 }}>
              <h3>{t('courseDetails.certification')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.7 }}>
                {t('courseDetails.certificationDesc')}
              </p>
            </div>
          </div>

          <aside className="cd-sidebar">
            <div className="cd-card">
              <h4>{t('courseDetails.overview')}</h4>
              <div className="cd-card__row"><span>{t('courseDetails.duration')}</span><span>{duration}</span></div>
              <div className="cd-card__row"><span>{t('courseDetails.fee')}</span><span>{t('courseDetails.free')}</span></div>
              <div className="cd-card__row"><span>{t('courseDetails.certificate')}</span><span>{t('courseDetails.isoCertified')}</span></div>
              <div className="cd-card__row"><span>{t('courseDetails.classLength')}</span><span>{t('courseDetails.classLengthValue')}</span></div>
              {!isStaff && (
                applied ? (
                  <span className="btn btn-gold btn-block is-applied" aria-disabled="true">{t('common.applied')}</span>
                ) : (
                  <Link to={`/admission?course=${course.slug}`} className="btn btn-gold btn-block">
                    {t('courseDetails.enrollNow')}
                  </Link>
                )
              )}
              <a href="https://wa.me/919025116369" target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-block" style={{ marginTop: 10 }}>
                <IconWhatsapp size={15} /> &nbsp;{t('courseDetails.chatWhatsapp')}
              </a>
            </div>

            {batches.length > 0 && (
              <div className="cd-card">
                <h4>{t('courseDetails.availableBatches')}</h4>
                <div className="cd-batches">
                  {batches.map((b) => (
                    <div className="cd-batch-mini" key={b.id}>
                      <strong style={{ minWidth: 40 }}>{b.day} {b.month}</strong>
                      <div>
                        <strong>{(isTa && b.slotTa) || b.slot}</strong>
                        <span>{b.startTime} – {b.endTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/batches" className="btn btn-outline-dark btn-block" style={{ marginTop: 14 }}>
                  {t('courseDetails.viewAllBatches')}
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
