import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import api, { AttendanceAPI, ApplicationsAPI, CoursesAPI, PresenceAPI, StaffPostsAPI } from '../services/api';
import { AdminStore, useAdminDb } from '../admin/adminStore';
import FileDrop from '../admin/ui/FileDrop';
import ConfirmDialog from '../admin/ui/ConfirmDialog';
import { IconCheck, IconCalendar, IconPhone } from '../components/Icons';
import { IconEdit, IconTrash, IconSearch } from '../admin/AdminIcons';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function StaffDashboard() {
  useAdminDb();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  // Posts this staff member has published — read back from the same source
  // the public "Posts & Updates" page uses, so what they publish here is
  // exactly what visitors see there.
  const [myPosts, setMyPosts] = useState([]);

  // Presence (self check-in) — synced to the shared admin store so it's
  // visible on the Admin Dashboard in real time (Section 11).
  const staffId = user?.staffId;
  // Uses the staff member's own session token (PresenceAPI), not the admin
  // one — the admin-only /attendance list would reject a staff login, and if
  // an admin is signed in on the same browser the admin token would be
  // rejected by the staff-only check-in route.
  const [isPresentToday, setIsPresentToday] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState('idle');
  const [presenceError, setPresenceError] = useState('');

  // Image post form
  const [imgForm, setImgForm] = useState({ title: '', category: 'Training', description: '', media: null });
  const [imgStatus, setImgStatus] = useState('idle');
  const [imgError, setImgError] = useState('');

  // Video post form
  const [vidForm, setVidForm] = useState({ title: '', category: 'Training', description: '', media: null });
  const [vidStatus, setVidStatus] = useState('idle');
  const [vidError, setVidError] = useState('');

  // Permission / leave request
  const [permForm, setPermForm] = useState({ time: '', description: '' });
  const [permStatus, setPermStatus] = useState('idle');
  const [permError, setPermError] = useState('');
  const [permOpen, setPermOpen] = useState(false);

  // Attendance (staff marking a student's attendance)
  const [attForm, setAttForm] = useState({ studentId: '', courseSlug: '', date: todayStr(), status: 'present' });
  const [attStatus, setAttStatus] = useState('idle');
  const [attError, setAttError] = useState('');
  const [attLog, setAttLog] = useState([]);
  const attendanceFormRef = useRef(null);

  // Students who booked a specific batch — backs the "Batch Applied
  // Students" search below, and also the only students attendance can be
  // marked for (a student who never booked a batch has nothing to attend).
  const [batchStudents, setBatchStudents] = useState([]);
  const [batchSearch, setBatchSearch] = useState('');

  const [deletingPost, setDeletingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const loadMyPosts = useCallback(() => {
    StaffPostsAPI.mine(user).then(setMyPosts);
  }, [user]);

  useEffect(() => {
    CoursesAPI.getAll().then((res) => setCourses(res.data || []));
    setAttLog(AttendanceAPI.getLog().data || []);
    loadMyPosts();
    ApplicationsAPI.allBatchApplications().then(setBatchStudents);
  }, [user, loadMyPosts]);

  useEffect(() => {
    if (!staffId) return;
    PresenceAPI.getTodayStatus(staffId).then((rec) => setIsPresentToday(rec?.status === 'present'));
  }, [staffId]);

  const filteredBatchStudents = batchStudents.filter(
    (a) => !batchSearch.trim() || String(a.studentId || '').toUpperCase().includes(batchSearch.trim().toUpperCase())
  );

  // Clicking a searched student jumps straight into Mark Attendance with
  // their Student ID and course already filled in.
  const handlePickBatchStudent = (application) => {
    setAttError('');
    setAttForm((f) => ({ ...f, studentId: application.studentId, courseSlug: application.course }));
    attendanceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleMarkPresent = async () => {
    setPresenceStatus('saving');
    setPresenceError('');
    try {
      await PresenceAPI.markPresent(staffId);
      setIsPresentToday(true);
      // Pull the fresh record into the admin cache so the Attendance screen
      // is current if it's open in this same browser.
      AdminStore.refreshAttendance(todayStr());
    } catch (err) {
      setPresenceError(err?.response?.data?.message || 'Could not mark attendance. Please log in again with your staff account and retry.');
    }
    setPresenceStatus('idle');
  };

  const handleImgSubmit = async (e) => {
    e.preventDefault();
    if (!imgForm.title.trim()) return;
    setImgStatus('saving');
    setImgError('');
    try {
      const res = await StaffPostsAPI.create({
        title: imgForm.title,
        category: imgForm.category,
        description: imgForm.description,
        mediaUrl: imgForm.media,
        type: 'image',
        author: user,
      });
      // If the backend was unreachable, StaffPostsAPI quietly falls back to
      // saving the post only in this browser's local storage — it still
      // shows up under "My Posts" here, but the Admin Panel (and the public
      // site) will never see it until it's re-published from a working
      // connection. Surfacing that now beats the staff member assuming
      // it's live when it isn't.
      setImgStatus(res.source === 'local' ? 'local' : 'done');
      setImgForm({ title: '', category: 'Training', description: '', media: null });
      loadMyPosts();
      setTimeout(() => setImgStatus('idle'), res.source === 'local' ? 6000 : 2500);
    } catch (err) {
      setImgStatus('idle');
      setImgError(err?.message || t('staffDashboard.postSaveFailed'));
    }
  };

  const handleVidSubmit = async (e) => {
    e.preventDefault();
    if (!vidForm.title.trim()) return;
    setVidStatus('saving');
    setVidError('');
    try {
      const res = await StaffPostsAPI.create({
        title: vidForm.title,
        category: vidForm.category,
        description: vidForm.description,
        mediaUrl: vidForm.media,
        type: 'video',
        author: user,
      });
      setVidStatus(res.source === 'local' ? 'local' : 'done');
      setVidForm({ title: '', category: 'Training', description: '', media: null });
      loadMyPosts();
      setTimeout(() => setVidStatus('idle'), res.source === 'local' ? 6000 : 2500);
    } catch (err) {
      setVidStatus('idle');
      setVidError(err?.message || t('staffDashboard.postSaveFailed'));
    }
  };

  const handlePermSubmit = async (e) => {
    e.preventDefault();
    if (!permForm.description.trim()) return;
    setPermStatus('saving');
    setPermError('');
    try {
      // Sent with the staff member's own session token so the backend files
      // it under this staff ID for Admin's Permission Requests table.
      await api.post('/permission-requests', {
        date: todayStr(),
        time: permForm.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        description: permForm.description,
      });
      AdminStore.refreshPermissionRequests();
      setPermStatus('done');
      setPermForm({ time: '', description: '' });
      setTimeout(() => { setPermStatus('idle'); setPermOpen(false); }, 1200);
    } catch (err) {
      setPermStatus('idle');
      setPermError(err?.response?.data?.message || 'Could not send the request. Please log in again with your staff account and retry.');
    }
  };

  // Only today's requests show here — once the date rolls over past
  // midnight, a staff member's dashboard naturally goes back to "no active
  // request" (whatever it ended as: approved/declined/completed) while
  // Admin's Permission Requests screen keeps the full permanent history.
  const myPermissionRequests = AdminStore.getPermissionRequests()
    .filter((r) => r.staffId === staffId && r.date === todayStr());

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!attForm.studentId.trim()) return;
    setAttError('');

    // A student who never booked a batch has no class to be marked present
    // or absent for — block it here with a clear message instead of
    // silently logging attendance for someone who isn't enrolled.
    if (!ApplicationsAPI.hasBookedBatch(batchStudents, attForm.studentId)) {
      setAttError(t('staffDashboard.attendanceNoBooking'));
      return;
    }

    setAttStatus('saving');
    const res = await AttendanceAPI.mark(attForm);
    setAttLog((log) => [res.data, ...log]);
    setAttStatus('done');
    setAttForm((f) => ({ ...f, studentId: '' }));
    setTimeout(() => setAttStatus('idle'), 2000);
  };

  return (
    <>
      <section className="page-hero" style={{ padding: '56px 0 40px' }}>
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('staffDashboard.eyebrow')}</span>
          <h1>{t('staffDashboard.welcome')}, {user?.name || 'Staff'}!</h1>
          <p>{t('staffDashboard.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Presence self check-in */}
          <div className="staff-card" style={{ marginBottom: 24 }}>
            <h3>{t('staffDashboard.presenceTitle')}</h3>
            <p className="staff-card__hint">{t('staffDashboard.presenceDesc')}</p>
            <div className="staff-presence">
              {isPresentToday ? (
                <div className="staff-presence__status">
                  <IconCheck size={18} />
                  <span>
                    {t('staffDashboard.alreadyPresent')}
                    <br />
                    <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 12 }}>
                      {todayStr()}
                    </span>
                  </span>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>{todayStr()}</span>
              )}
              <button
                type="button"
                className="btn btn-gold btn-sm"
                onClick={handleMarkPresent}
                disabled={isPresentToday || presenceStatus === 'saving'}
              >
                {presenceStatus === 'saving' ? t('staffDashboard.markingPresent') : t('staffDashboard.markPresent')}
              </button>
            </div>
            {presenceError && <p className="form-error" style={{ marginTop: 10 }}>{presenceError}</p>}
            <p className="form-note" style={{ marginTop: 12 }}>{t('staffDashboard.syncedNote')}</p>
          </div>

          {/* Permission / leave requests */}
          <div className="staff-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3>{t('staffDashboard.permissionTitle')}</h3>
                <p className="staff-card__hint" style={{ marginBottom: 0 }}>{t('staffDashboard.permissionHint')}</p>
              </div>
              <button type="button" className="btn btn-gold btn-sm" onClick={() => setPermOpen((v) => !v)}>
                {permOpen ? t('staffDashboard.cancel') : t('staffDashboard.requestPermission')}
              </button>
            </div>

            {permOpen && (
              <form onSubmit={handlePermSubmit} style={{ marginTop: 16 }}>
                <div className="form-row">
                  <label>{t('staffDashboard.descriptionLabel')}</label>
                  <textarea
                    rows={2} required value={permForm.description}
                    placeholder={t('staffDashboard.descriptionPlaceholder')}
                    onChange={(e) => setPermForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                {permStatus === 'done' && <p className="admin-success-note">{t('staffDashboard.requestSent')}</p>}
                {permError && <p className="form-error" style={{ marginBottom: 10 }}>{permError}</p>}
                <button type="submit" className="btn btn-gold" disabled={permStatus === 'saving'}>
                  {permStatus === 'saving' ? t('staffDashboard.sending') : t('staffDashboard.submitRequest')}
                </button>
              </form>
            )}

            {myPermissionRequests.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <h4 style={{ fontSize: 13.5, marginBottom: 10, color: 'var(--text-muted)' }}>{t('staffDashboard.myRequests')}</h4>
                <div className="attendance-log">
                  {myPermissionRequests.slice(0, 6).map((r) => (
                    <div className="attendance-log__row" key={r.id}>
                      <span style={{ fontWeight: 700 }}>{r.description}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{r.date} · {r.time}</span>
                      <span className={`status-pill status-pill--${r.status === 'pending' ? 'pending' : r.status === 'approved' ? 'approved' : r.status === 'declined' ? 'rejected' : 'completed'}`}>
                        {r.status}
                      </span>
                      {r.status === 'approved' && (
                        <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => AdminStore.completePermissionRequest(r.id)}>
                          {t('staffDashboard.markComplete')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="staff-grid">
            {/* Create Image Post */}
            <div className="staff-card">
              <h3>{t('staffDashboard.createImagePost')}</h3>
              <form onSubmit={handleImgSubmit}>
                <div className="form-row">
                  <label>{t('staffDashboard.postTitleLabel')}</label>
                  <input
                    type="text" required value={imgForm.title}
                    onChange={(e) => setImgForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.postCategoryLabel')}</label>
                  <select value={imgForm.category} onChange={(e) => setImgForm((f) => ({ ...f, category: e.target.value }))}>
                    <option>{t('staffDashboard.categoryTraining')}</option>
                    <option>{t('staffDashboard.categoryAdmissions')}</option>
                    <option>{t('staffDashboard.categoryEvents')}</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.postDescLabel')}</label>
                  <textarea
                    rows={3} required value={imgForm.description}
                    onChange={(e) => setImgForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.mediaTypeImage')}</label>
                  <FileDrop value={imgForm.media} onChange={(v) => setImgForm((f) => ({ ...f, media: v }))} accept="image/*" kind="image" label="Choose image" />
                </div>
                {imgStatus === 'done' && (
                  <p className="admin-success-note">{t('staffDashboard.postPublished')}</p>
                )}
                {imgStatus === 'local' && (
                  <p className="form-error" style={{ marginBottom: 10 }}>
                    Saved on this device only — couldn't reach the server, so this post won't show up in the Admin Panel or the public site until you republish with a working connection.
                  </p>
                )}
                {imgError && <p className="form-error" style={{ marginBottom: 10 }}>{imgError}</p>}
                <button type="submit" className="btn btn-gold btn-block" disabled={imgStatus === 'saving'}>
                  {imgStatus === 'saving' ? t('staffDashboard.publishing') : t('staffDashboard.publishPost')}
                </button>
              </form>
            </div>

            {/* Create Video Post */}
            <div className="staff-card">
              <h3>{t('staffDashboard.createVideoPost')}</h3>
              <form onSubmit={handleVidSubmit}>
                <div className="form-row">
                  <label>{t('staffDashboard.videoTitleLabel')}</label>
                  <input
                    type="text" required value={vidForm.title}
                    onChange={(e) => setVidForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.postCategoryLabel')}</label>
                  <select value={vidForm.category} onChange={(e) => setVidForm((f) => ({ ...f, category: e.target.value }))}>
                    <option>{t('staffDashboard.categoryTraining')}</option>
                    <option>{t('staffDashboard.categoryAdmissions')}</option>
                    <option>{t('staffDashboard.categoryEvents')}</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.videoDescLabel')}</label>
                  <textarea
                    rows={3} required value={vidForm.description}
                    onChange={(e) => setVidForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.mediaTypeVideo')}</label>
                  <FileDrop value={vidForm.media} onChange={(v) => setVidForm((f) => ({ ...f, media: v }))} accept="video/*" kind="video" label="Choose video" />
                </div>
                {vidStatus === 'done' && (
                  <p className="admin-success-note">{t('staffDashboard.videoUploaded')}</p>
                )}
                {vidStatus === 'local' && (
                  <p className="form-error" style={{ marginBottom: 10 }}>
                    Saved on this device only — couldn't reach the server, so this post won't show up in the Admin Panel or the public site until you republish with a working connection.
                  </p>
                )}
                {vidError && <p className="form-error" style={{ marginBottom: 10 }}>{vidError}</p>}
                <button type="submit" className="btn btn-gold btn-block" disabled={vidStatus === 'saving'}>
                  {vidStatus === 'saving' ? t('staffDashboard.uploading') : t('staffDashboard.uploadVideo')}
                </button>
              </form>
            </div>
          </div>

          {/* My posts — staff can now edit/delete their own posts */}
          {myPosts.length > 0 && (
            <div className="staff-card" style={{ marginTop: 24 }}>
              <h3>{t('staffDashboard.myPosts')}</h3>
              <div className="admin-card-grid" style={{ marginTop: 14 }}>
                {myPosts.map((p) => (
                  <div className="admin-media-card" key={p.id}>
                    <div className="admin-media-card__img">
                      {p.mediaUrl ? (p.type === 'video' ? <video src={p.mediaUrl} /> : <img src={p.mediaUrl} alt={p.title} />) : <span>{t('staffDashboard.noMedia')}</span>}
                    </div>
                    <div className="admin-media-card__body">
                      <div className="admin-media-card__title">{p.title}</div>
                      <div className="admin-media-card__meta">{p.category} · {p.type}</div>
                    </div>
                    <div className="admin-media-card__actions">
                      <button className="btn btn-sm btn-outline-dark" onClick={() => setEditingPost(p)}><IconEdit size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />{t('staffDashboard.edit')}</button>
                      <button className="btn btn-sm admin-btn-danger" onClick={() => setDeletingPost(p)}><IconTrash size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />{t('staffDashboard.delete')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batch Applied Students — search by Student ID, click a result
              to jump into Mark Attendance with it pre-filled. */}
          <div className="staff-card" style={{ marginTop: 24 }}>
            <h3>{t('staffDashboard.batchStudentsTitle')}</h3>
            <p className="staff-card__hint">{t('staffDashboard.batchStudentsHint')}</p>

            <div className="form-row" style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type="text"
                placeholder={t('staffDashboard.batchStudentsSearchPh')}
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-3px)', color: 'var(--text-muted)' }}>
                <IconSearch size={15} />
              </span>
            </div>

            {filteredBatchStudents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                {batchStudents.length === 0 ? t('staffDashboard.noBatchStudents') : t('staffDashboard.noSearchMatch')}
              </p>
            ) : (
              <div className="attendance-log">
                {filteredBatchStudents.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    className="attendance-log__row"
                    onClick={() => handlePickBatchStudent(a)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                  >
                    <span style={{ fontWeight: 700 }}>{a.studentId}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <IconPhone size={12} /> {a.phone}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{a.courseName || a.course}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <IconCalendar size={12} /> {a.batchLabel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Attendance (staff marks a student's attendance) */}
          <div className="staff-card" style={{ marginTop: 24 }} ref={attendanceFormRef}>
            <h3>{t('staffDashboard.attendanceTitle')}</h3>
            <form onSubmit={handleAttendanceSubmit}>
              <div className="form-grid-2">
                <div className="form-row">
                  <label>{t('staffDashboard.studentIdLabel')}</label>
                  <input
                    type="text" placeholder={t('staffDashboard.studentIdPh')} required
                    value={attForm.studentId}
                    onChange={(e) => { setAttForm((f) => ({ ...f, studentId: e.target.value })); setAttError(''); }}
                  />
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.courseLabel')}</label>
                  <select value={attForm.courseSlug} onChange={(e) => setAttForm((f) => ({ ...f, courseSlug: e.target.value }))}>
                    <option value="">—</option>
                    {courses.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-row">
                  <label>{t('staffDashboard.dateLabel')}</label>
                  <input
                    type="date" value={attForm.date}
                    onChange={(e) => setAttForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label>{t('staffDashboard.statusLabel')}</label>
                  <select value={attForm.status} onChange={(e) => setAttForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="present">{t('staffDashboard.statusPresent')}</option>
                    <option value="absent">{t('staffDashboard.statusAbsent')}</option>
                  </select>
                </div>
              </div>
              {attError && (
                <p className="form-error" style={{ marginBottom: 10 }}>{attError}</p>
              )}
              {attStatus === 'done' && (
                <p style={{ color: '#2f7d52', fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>
                  {t('staffDashboard.attendanceMarked')}
                </p>
              )}
              <button type="submit" className="btn btn-gold" disabled={attStatus === 'saving'}>
                {attStatus === 'saving' ? t('staffDashboard.marking') : t('staffDashboard.markAttendance')}
              </button>
            </form>

            <h4 style={{ fontSize: 13.5, marginTop: 22, marginBottom: 10, color: 'var(--text-muted)' }}>
              {t('staffDashboard.recentAttendance')}
            </h4>
            {attLog.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{t('staffDashboard.noAttendance')}</p>
            ) : (
              <div className="attendance-log">
                {attLog.slice(0, 8).map((a) => (
                  <div className="attendance-log__row" key={a.id}>
                    <span style={{ fontWeight: 700 }}>{a.studentId}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <IconCalendar size={12} /> {a.date}
                    </span>
                    <span className={`status-pill ${a.status === 'present' ? 'status-pill--approved' : 'status-pill--rejected'}`}>
                      {a.status === 'present' ? t('staffDashboard.statusPresent') : t('staffDashboard.statusAbsent')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {deletingPost && (
        <ConfirmDialog
          message={`"${deletingPost.title}" will be removed from Posts & Updates.`}
          onCancel={() => setDeletingPost(null)}
          onConfirm={async () => { await StaffPostsAPI.remove(deletingPost.id); setDeletingPost(null); loadMyPosts(); }}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => { setEditingPost(null); loadMyPosts(); }}
        />
      )}
    </>
  );
}

function EditPostModal({ post, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...post });
  const [saveError, setSaveError] = useState('');
  const save = async () => {
    setSaveError('');
    try {
      await StaffPostsAPI.update(post.id, {
        title: form.title,
        description: form.description,
        mediaUrl: form.mediaUrl,
        category: form.category,
        type: form.type,
      });
      onClose();
    } catch (err) {
      setSaveError(err?.message || t('staffDashboard.postSaveFailed'));
    }
  };
  return (
    <div className="admin-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 560 }}>
        <div className="admin-modal__head"><h3>{t('staffDashboard.editPostTitle')}</h3></div>
        <div className="admin-modal__body">
          <div className="form-row">
            <label>{t('staffDashboard.titleLabel')}</label>
            <input type="text" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>{t('staffDashboard.descriptionLabel')}</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>{form.type === 'video' ? t('staffDashboard.mediaTypeVideo') : t('staffDashboard.mediaTypeImage')}</label>
            <FileDrop
              value={form.mediaUrl}
              onChange={(v) => setForm((s) => ({ ...s, mediaUrl: v }))}
              accept={form.type === 'video' ? 'video/*' : 'image/*'}
              kind={form.type}
            />
          </div>
          {saveError && <p className="form-error" style={{ marginBottom: 10 }}>{saveError}</p>}
          <button type="button" className="btn btn-gold btn-block" onClick={save}>{t('staffDashboard.saveChanges')}</button>
        </div>
      </div>
    </div>
  );
}
