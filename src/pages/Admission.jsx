import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicationsAPI, CoursesAPI, BatchesAPI, resolveBatchDate } from '../services/api';
import { IconCheck, IconPhone, IconWhatsapp } from '../components/Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  fullName: '',
  studentId: '',
  phone: '',
  course: '',
  batch: '',
  location: '',
  message: '',
};

export default function Admission() {
  const { t, lang } = useLanguage();
  const isTa = lang === 'ta';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  // Coming here from a specific batch's Apply Now (link carries ?batch=) is
  // a different flow from a plain course Enroll: it identifies the
  // logged-in student for a real seat, so it asks for their Student ID
  // instead of a free-text name, and checks it against their own account.
  const isBatchMode = Boolean(searchParams.get('batch'));

  useEffect(() => {
    CoursesAPI.getAll().then((res) => setCourses(res.data || []));
    BatchesAPI.getUpcoming().then((res) => setBatches(res.data || []));
  }, []);

  useEffect(() => {
    const courseParam = searchParams.get('course');
    const batchParam = searchParams.get('batch');
    setForm((f) => ({
      ...f,
      course: courseParam || f.course,
      batch: batchParam || f.batch,
      // Batch flow: pre-fill with the logged-in student's own details —
      // they only need to confirm it, not retype it.
      studentId: batchParam ? (user?.studentId || '') : f.studentId,
      phone: batchParam ? (user?.phone || f.phone) : f.phone,
    }));
  }, [searchParams, user]);

  const relevantBatches = batches.filter((b) => !form.course || b.courseSlug === form.course);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (isBatchMode) {
      // Batch seats are for a specific, already-registered student — so the
      // Student ID and phone entered here must match the logged-in account
      // exactly, or the application is refused.
      if (!form.studentId.trim()) e.studentId = t('admission.errStudentId');
      else if (form.studentId.trim().toUpperCase() !== String(user?.studentId || '').toUpperCase()) {
        e.studentId = t('admission.errStudentIdMismatch');
      }
    } else if (!form.fullName.trim()) {
      e.fullName = t('admission.errFullName');
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = t('admission.errPhone');
    else if (isBatchMode && form.phone.trim() !== String(user?.phone || '')) {
      e.phone = t('admission.errPhoneMismatch');
    }
    if (!form.course) e.course = t('admission.errCourse');
    if (!form.location.trim()) e.location = t('admission.errLocation');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('submitting');

    // The chosen batch's readable label and calendar date travel with the
    // application, so the Student Dashboard can show the batch and drop it
    // by itself once that date has passed.
    const selectedBatch = batches.find((b) => String(b.id) === String(form.batch));
    const selectedCourse = courses.find((c) => c.slug === form.course);

    const payload = {
      ...form,
      // Batch applications are tied to the logged-in student's own name and
      // (verified) Student ID rather than free-text entry.
      fullName: isBatchMode ? (user?.name || form.fullName) : form.fullName,
      studentId: isBatchMode ? form.studentId.trim() : undefined,
      kind: isBatchMode ? 'batch' : 'course',
      courseName: selectedCourse?.name || form.course,
      batchLabel: selectedBatch
        ? `${selectedBatch.day} ${selectedBatch.month} · ${selectedBatch.slot} (${selectedBatch.startTime}-${selectedBatch.endTime})`
        : '',
      batchDate: selectedBatch ? resolveBatchDate(selectedBatch) : '',
    };

    try {
      await ApplicationsAPI.submit(payload);
      setStatus('success');
      setForm(initialForm);
    } catch {
      setStatus('error');
    }
  };

  // Closing the confirmation sends the student on to their dashboard, where
  // the new application now shows under "Applied Courses".
  const closeSuccess = () => {
    setStatus('idle');
    navigate('/dashboard');
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('admission.eyebrow')}</span>
          <h1>{t('admission.title')}</h1>
          <p>{t('admission.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <form className="form-card" onSubmit={handleSubmit} noValidate aria-hidden={status === 'success'}>
            {isBatchMode ? (
              <div className="form-row">
                <label htmlFor="studentId">{t('admission.studentId')} *</label>
                <input
                  id="studentId" type="text" placeholder={t('admission.studentIdPh')}
                  value={form.studentId} onChange={update('studentId')}
                  aria-invalid={!!errors.studentId}
                />
                {errors.studentId && <span className="form-error">{errors.studentId}</span>}
              </div>
            ) : (
              <div className="form-row">
                <label htmlFor="fullName">{t('admission.fullName')} *</label>
                <input
                  id="fullName" type="text" placeholder={t('admission.fullNamePh')}
                  value={form.fullName} onChange={update('fullName')}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </div>
            )}

            <div className="form-row">
              <label htmlFor="phone">{t('admission.phone')} *</label>
              <input
                id="phone" type="tel" placeholder={t('admission.phonePh')} maxLength={10}
                value={form.phone} onChange={update('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-grid-2">
              <div className="form-row">
                <label htmlFor="course">{t('admission.course')} *</label>
                <select id="course" value={form.course} onChange={update('course')} aria-invalid={!!errors.course}>
                  <option value="">{t('admission.selectCourse')}</option>
                  {courses.map((c) => (
                    <option key={c.slug} value={c.slug}>{(isTa && c.nameTa) || c.name}</option>
                  ))}
                </select>
                {errors.course && <span className="form-error">{errors.course}</span>}
              </div>

              <div className="form-row">
                <label htmlFor="batch">{t('admission.batch')}</label>
                <select id="batch" value={form.batch} onChange={update('batch')}>
                  <option value="">{t('admission.anyBatch')}</option>
                  {relevantBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.day} {b.month} — {(isTa && b.slotTa) || b.slot} ({b.startTime}-{b.endTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="location">{t('admission.location')} *</label>
              <input
                id="location" type="text" placeholder={t('admission.locationPh')}
                value={form.location} onChange={update('location')}
                aria-invalid={!!errors.location}
              />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>

            <div className="form-row">
              <label htmlFor="message">{t('admission.message')}</label>
              <textarea
                id="message" rows={4} placeholder={t('admission.messagePh')}
                value={form.message} onChange={update('message')}
              />
            </div>

            {status === 'error' && (
              <p className="form-error" style={{ marginBottom: 12 }}>
                {t('admission.submitError')}
              </p>
            )}

            <button type="submit" className="btn btn-gold btn-block" disabled={status === 'submitting'}>
              {status === 'submitting' ? t('admission.submitting') : t('admission.submit')}
            </button>

            <p className="form-note">
              {t('admission.preferToTalk')} <a href="tel:+919025116369">+91 90251 16369</a> {t('admission.or')}{' '}
              <a href="tel:+919150981734">+91 91509 81734</a>.
            </p>
          </form>
        </div>
      </section>

      {status === 'success' && (
        <div className="admin-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeSuccess(); }}>
          <div className="admin-modal" style={{ maxWidth: 460, textAlign: 'center', padding: '36px 28px' }}>
            <span style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: 'var(--grad-ink)', marginBottom: 20 }}>
              <IconCheck size={26} color="var(--gold-light)" />
            </span>
            <h2 style={{ fontSize: 22, marginBottom: 10 }}>{t('admission.successTitle')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24, fontSize: 14 }}>
              {t('admission.successDesc')}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
              <a href="tel:+919025116369" className="btn btn-gold btn-sm"><IconPhone size={15} /> {t('admission.callUs')}</a>
              <a href="https://wa.me/919025116369" target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm">
                <IconWhatsapp size={15} /> {t('admission.whatsappUs')}
              </a>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={closeSuccess}>
              {t('admission.viewDashboard') || 'Go to My Dashboard'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
