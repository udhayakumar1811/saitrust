import { Link } from 'react-router-dom';
import DynamicImage from './DynamicImage';
import { IconClock, IconArrow } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import useApplications from '../hooks/useApplications';
import { ApplicationsAPI } from '../services/api';

// Course category -> fallback icon shown only while no real photo has been
// uploaded yet (DynamicImage falls back to this automatically).
const ICON_BY_CATEGORY = {
  Tailoring: 'scissors',
  'Aari Embroidery': 'needle',
  Beautician: 'sparkle',
  'Cake Baking': 'cake',
};

export default function CourseCard({ course, onViewDetails }) {
  const { lang, t } = useLanguage();
  const { isStaff } = useAuth();
  const { applications } = useApplications();
  const isTa = lang === 'ta';

  // Staff members never enroll in courses, so the action is hidden for
  // them; students who already applied see an "Applied" state instead.
  const applied = ApplicationsAPI.isApplied(applications, course.slug);

  const name = (isTa && course.nameTa) || course.name || '';
  const description = (isTa && course.descriptionTa) || course.description || '';
  const duration = (isTa && course.durationTa) || course.duration || '';
  const tagline = (isTa && course.taglineTa) || course.tagline || '';

  // "Key modules" on the card is the same content as the admin's
  // "highlights" field — one field, shown in two places.
  const highlights =
    (isTa && Array.isArray(course.highlightsTa) && course.highlightsTa.length && course.highlightsTa) ||
    (Array.isArray(course.highlights) ? course.highlights : []);

  return (
    <article className="course-card">
      <div className="course-card__media">
        <DynamicImage
          src={course.image}
          alt={name}
          icon={ICON_BY_CATEGORY[course.category] || 'users'}
          ratio="16 / 11"
        />
        {tagline && <span className="course-card__tag">{tagline}</span>}
      </div>

      <div className="course-card__body">
        <div className="course-card__meta">
          <IconClock size={15} />
          <span>{duration}</span>
        </div>

        <h3 className="course-card__title">{name}</h3>

        <p className="course-card__desc">{description}</p>

        <ul className="course-card__modules">
          {highlights.slice(0, 3).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>

        <div className="course-card__actions">
          <button
            type="button"
            className="btn btn-outline-dark btn-sm"
            onClick={() => onViewDetails?.(course)}
          >
            {t('common.viewDetails')}
          </button>

          {!isStaff && (
            applied ? (
              <span className="btn btn-gold btn-sm is-applied" aria-disabled="true">
                {t('common.applied')}
              </span>
            ) : (
              <Link
                to={`/admission?course=${course.slug}`}
                className="btn btn-gold btn-sm"
              >
                {t('hero.enroll')} <IconArrow size={14} />
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
