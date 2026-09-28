import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApplicationsAPI, StudentAPI } from '../services/api';
import useApplications from '../hooks/useApplications';
import ConfirmDialog from '../admin/ui/ConfirmDialog';
import Carousel from '../components/Carousel';
import { useLanguage } from '../i18n/LanguageContext';
import { IconAward, IconCalendar, IconClock, IconCheck } from '../components/Icons';

export default function CustomerDashboard() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Applications the student has made. Anything whose batch date has
  // already passed is filtered out automatically (see ApplicationsAPI.mine).
  const { applications, loading, reload } = useApplications();
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelledNote, setCancelledNote] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(null);
  // Certificate status/image Admin sets for this student (Section 7) — kept
  // separate from `user` since it lives on the linked Student record, not
  // the account itself.
  const [student, setStudent] = useState(null);

  useEffect(() => {
    StudentAPI.getProfile().then((res) => setStudent(res.data?.student || null));
  }, []);

  const STATUS_LABEL = {
    pending: t('dashboard.statusPending'),
    approved: t('dashboard.statusApproved'),
    rejected: t('dashboard.statusRejected'),
    completed: t('dashboard.statusCompleted'),
  };

  // Plain course enrolls (no specific batch chosen) show under "Applied
  // Courses"; applications tied to one exact booked batch show separately
  // under "Applied Batches", and the closest one of those also drives the
  // "Upcoming Class" card above.
  const courseApps = applications.filter((a) => a.kind !== 'batch');
  const batchApps = applications.filter((a) => a.kind === 'batch');
  const nextClass = [...batchApps]
    .filter((a) => a.batchDate)
    .sort((a, b) => new Date(a.batchDate) - new Date(b.batchDate))[0];

  // Re-check expiry when the tab regains focus, so a batch that ended
  // while the page was open drops off without a manual refresh.
  useEffect(() => {
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [reload]);

  // Cancelling always asks for confirmation in a modal first — never an
  // instant action — and only removes the course once confirmed.
  const handleCancelClick = (application) => setConfirmingCancel(application);

  const confirmCancel = async () => {
    const application = confirmingCancel;
    if (!application) return;
    setConfirmingCancel(null);
    setCancellingId(application.id);
    await ApplicationsAPI.cancel(application.id);
    setCancellingId(null);
    setCancelledNote(true);
    setTimeout(() => setCancelledNote(false), 3000);
    reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <section className="page-hero" style={{ padding: '56px 0 40px' }}>
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('dashboard.eyebrow')}</span>
          <h1>{t('dashboard.welcome')}, {user?.name || 'Student'}!</h1>
          <p>{t('dashboard.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="dash-grid" style={{ marginBottom: 32 }}>
            <div className="dash-card">
              <h4 style={{ marginBottom: 10 }}>{t('dashboard.profile')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.8 }}>
                {user?.name}<br />
                {user?.email}<br />
                {user?.phone && <>{user.phone}<br /></>}
              </p>
              <button className="btn btn-outline-dark btn-sm" style={{ marginTop: 10 }} onClick={handleLogout}>{t('nav.logout')}</button>
            </div>

            <div className="dash-card">
              <h4 style={{ marginBottom: 10 }}><IconAward size={18} style={{ verticalAlign: '-3px', marginRight: 6, color: 'var(--gold)' }} />{t('dashboard.certStatus')}</h4>
              {student?.certificateStatus?.completed && student?.certificateStatus?.certificateImage ? (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 10 }}>
                    {student.certificateStatus.certificateNote || t('dashboard.certDesc')}
                  </p>
                  <a
                    href={student.certificateStatus.certificateImage}
                    download={`${user?.name || 'certificate'}-certificate.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-dark btn-sm"
                  >
                    Download Certificate
                  </a>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
                  {student?.certificateStatus?.certificateNote || t('dashboard.certDesc')}
                </p>
              )}
            </div>

            <div className="dash-card">
              <h4 style={{ marginBottom: 10 }}><IconClock size={18} style={{ verticalAlign: '-3px', marginRight: 6, color: 'var(--gold)' }} />{t('dashboard.upcomingClass')}</h4>
              {nextClass ? (
                <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--ink)' }}>{nextClass.courseName || nextClass.course}</strong>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 0' }}>
                    <IconCalendar size={13} /> {nextClass.batchLabel}
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>{t('dashboard.upcomingClassDesc')}</p>
              )}
            </div>
          </div>

          <h3 style={{ marginBottom: 18 }}>{t('dashboard.appliedCourses')}</h3>

          {cancelledNote && (
            <p style={{ color: '#2f7d52', fontSize: 13.5, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCheck size={15} /> {t('dashboard.cancelled')}
            </p>
          )}

          {loading && (
            <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
          )}

          {!loading && applications.length === 0 && (
            <div className="dash-card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{t('dashboard.noApplications')}</p>
              <a href="/courses" className="btn btn-gold btn-sm">{t('dashboard.browseCourses')}</a>
            </div>
          )}

          {!loading && courseApps.length > 0 && (
            <div className="dash-grid" style={{ marginBottom: batchApps.length > 0 ? 36 : 0 }}>
              {courseApps.map((a) => (
                <div className="dash-card" key={a.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <strong>{a.courseName || a.course}</strong>
                    <span className={`status-pill status-pill--${a.status}`}>{STATUS_LABEL[a.status] || a.status}</span>
                  </div>
                  {a.batchLabel && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconCalendar size={14} /> {a.batchLabel}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm post-card__delete"
                    style={{ marginTop: 14 }}
                    onClick={() => handleCancelClick(a)}
                    disabled={cancellingId === a.id}
                  >
                    {cancellingId === a.id ? t('dashboard.cancelling') : t('dashboard.cancelCourse')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && batchApps.length > 0 && (
            <>
              <h3 style={{ marginBottom: 18 }}>{t('dashboard.appliedBatches')}</h3>
              <Carousel size="batches" ariaLabel={t('dashboard.appliedBatches')}>
                {batchApps.map((a) => (
                  <div className="dash-card dash-card--sm" key={a.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{a.courseName || a.course}</strong>
                      <span className={`status-pill status-pill--${a.status}`}>{STATUS_LABEL[a.status] || a.status}</span>
                    </div>
                    {a.batchLabel && (
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IconCalendar size={13} /> {a.batchLabel}
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm post-card__delete"
                      style={{ marginTop: 12, width: '100%' }}
                      onClick={() => handleCancelClick(a)}
                      disabled={cancellingId === a.id}
                    >
                      {cancellingId === a.id ? t('dashboard.cancelling') : t('dashboard.cancelCourse')}
                    </button>
                  </div>
                ))}
              </Carousel>
            </>
          )}
        </div>
      </section>

      {confirmingCancel && (
        <ConfirmDialog
          title={t('dashboard.cancelCourse')}
          message={t('dashboard.cancelConfirm')}
          confirmLabel={t('dashboard.cancelCourse')}
          onCancel={() => setConfirmingCancel(null)}
          onConfirm={confirmCancel}
        />
      )}
    </>
  );
}
