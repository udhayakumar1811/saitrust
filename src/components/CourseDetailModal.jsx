import DynamicImage from './DynamicImage';
import { IconCheck, IconClock, IconArrow, IconWhatsapp, IconAward, IconCalendar, IconClose } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import useApplications from '../hooks/useApplications';
import { ApplicationsAPI } from '../services/api';

const ICON_BY_CATEGORY = {
  Tailoring: 'scissors',
  'Aari Embroidery': 'needle',
  Beautician: 'sparkle',
  'Cake Baking': 'cake',
};

/**
 * Opened from a course card's "View Details" — uses the course object the
 * list already has in memory, so unlike the old dedicated page this never
 * has anything of its own to fetch (and so nothing of its own to fail).
 */
export default function CourseDetailModal({ course, onClose, onEnroll }) {
  const { lang, t } = useLanguage();
  const isTa = lang === 'ta';
  const { isStaff } = useAuth();
  const { applications } = useApplications();

  if (!course) return null;

  const applied = ApplicationsAPI.isApplied(applications, course.slug);
  const name = (isTa && course.nameTa) || course.name || '';
  const description = (isTa && course.descriptionTa) || course.description || '';
  const duration = (isTa && course.durationTa) || course.duration || '';
  const tagline = (isTa && course.taglineTa) || course.tagline || '';
  const modules =
    (isTa && Array.isArray(course.highlightsTa) && course.highlightsTa.length && course.highlightsTa) ||
    (Array.isArray(course.highlights) ? course.highlights : []);
  const benefits =
    (isTa && Array.isArray(course.benefitsTa) && course.benefitsTa.length && course.benefitsTa) ||
    (Array.isArray(course.benefits) ? course.benefits : []);

  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label={name} onClick={onClose}>
      <div className="video-modal__panel course-detail-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="video-modal__close" onClick={onClose} aria-label="Close">
          <IconClose color="var(--text-on-ink)" />
        </button>

        <div className="post-modal__media">
          <DynamicImage src={course.image} alt={name} icon={ICON_BY_CATEGORY[course.category] || 'users'} ratio="16 / 9" />
        </div>

        <div className="video-modal__info course-detail-modal__body">
          {tagline && <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{tagline}</span>}
          <h3 style={{ margin: '6px 0 10px' }}>{name}</h3>

          <div className="cd-hero__pills" style={{ marginBottom: 16 }}>
            <span className="pill" style={{ color: 'var(--gold-light)' }}><IconClock size={13} /> &nbsp;{duration}</span>
            <span className="pill" style={{ color: 'var(--gold-light)' }}><IconAward size={13} /> &nbsp;{t('courseDetails.freeTraining')}</span>
            <span className="pill" style={{ color: 'var(--gold-light)' }}><IconCalendar size={13} /> &nbsp;{t('courseDetails.isoCertified')}</span>
          </div>

          <p style={{ marginBottom: 18 }}>{description}</p>

          {modules.length > 0 && (
            <>
              <h4 style={{ color: 'var(--text-on-ink)', fontSize: 14.5, marginBottom: 10 }}>{t('courseDetails.courseModules')}</h4>
              <ul className="cd-modules" style={{ marginBottom: 18 }}>
                {modules.map((m) => (
                  <li key={m}><IconCheck size={14} /> {m}</li>
                ))}
              </ul>
            </>
          )}

          {benefits.length > 0 && (
            <>
              <h4 style={{ color: 'var(--text-on-ink)', fontSize: 14.5, marginBottom: 10 }}>{t('courseDetails.benefitsCareer')}</h4>
              <ul className="cd-benefits" style={{ marginBottom: 22 }}>
                {benefits.map((b) => (
                  <li key={b}><IconCheck size={14} /> {b}</li>
                ))}
              </ul>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!isStaff && (
              applied ? (
                <span className="btn btn-gold is-applied" aria-disabled="true">{t('common.applied')}</span>
              ) : (
                <button type="button" className="btn btn-gold" onClick={() => onEnroll?.(course)}>
                  {t('courseDetails.enrollNow')} <IconArrow size={16} />
                </button>
              )
            )}
            <a href="https://wa.me/919025116369" target="_blank" rel="noreferrer" className="btn btn-outline-dark">
              <IconWhatsapp size={15} /> {t('courseDetails.chatWhatsapp')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
