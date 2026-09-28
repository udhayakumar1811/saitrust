import { Link } from 'react-router-dom';
import { IconClock, IconSeat } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import useApplications from '../hooks/useApplications';
import { ApplicationsAPI } from '../services/api';

export default function BatchCard({ batch }) {
  const { lang, t } = useLanguage();
  const { isStaff } = useAuth();
  const { applications } = useApplications();
  const isTa = lang === 'ta';
  const applied = ApplicationsAPI.isApplied(applications, batch.courseSlug, batch.id);
  const isFull = batch.seatsAvailable === 0;
  const courseName = (isTa && batch.courseTa) || batch.course;
  const slot = (isTa && batch.slotTa) || batch.slot;
  const status = (isTa && batch.statusTa) || batch.status;

  return (
    <div className="batch-card">
      <div className="batch-card__date">
        <span className="batch-card__day">{batch.day}</span>
        <span className="batch-card__month">{batch.month}</span>
      </div>

      <div className="batch-card__body">
        <div className="batch-card__top">
          <h4>{courseName}</h4>
          <span className={`batch-card__status ${isFull ? 'batch-card__status--full' : ''}`}>
            {status}
          </span>
        </div>

        <div className="batch-card__row">
          <IconClock size={15} />
          <span>{slot} · {batch.startTime} – {batch.endTime}</span>
        </div>
        <div className="batch-card__row">
          <IconSeat size={15} />
          <span>{isFull ? (isTa ? 'காத்திருப்பு பட்டியல் மட்டும்' : 'Waitlist only') : `${batch.seatsAvailable} ${isTa ? 'இடங்கள் உள்ளன' : 'seats available'}`}</span>
        </div>

        {/* Applying is a student action — hidden entirely for staff logins.
            Every batch uses the same "Apply Now" action now — no separate
            waitlist button, even when the batch is full. */}
        {!isStaff && (
          applied ? (
            <span className="btn btn-sm btn-block btn-gold is-applied" aria-disabled="true">
              {t('common.applied')}
            </span>
          ) : (
            <Link
              to={`/admission?course=${batch.courseSlug}&batch=${batch.id}`}
              className="btn btn-sm btn-block btn-gold"
            >
              {t('common.applyNow')}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
