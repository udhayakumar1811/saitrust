import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ProfileAPI, UploadAPI } from '../services/api';
import { IconCamera, IconUser, IconCheck } from '../components/Icons';

export default function Profile() {
  const { t } = useLanguage();
  const { user, role, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [status, setStatus] = useState('idle');
  const [photoStatus, setPhotoStatus] = useState('idle');
  const [photoError, setPhotoError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Uploads the chosen photo to the backend (Section 2) and stores the
  // returned URL, instead of the previous base64 data-URL-in-localStorage
  // approach, which the spec flags as a demo-only trick that must not
  // carry over to the real backend.
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoStatus('uploading');
    setPhotoError('');
    try {
      const { url } = await UploadAPI.uploadFile(file);
      setAvatar(url);
      // Apply it to the session straight away so the new photo shows in the
      // header/avatar immediately, not only after "Save".
      updateUser({ avatar: url });
      ProfileAPI.update(role, { ...form, avatar: url });
    } catch {
      setPhotoError(t('profile.photoError') || 'Could not add that photo. Please try another image.');
    } finally {
      setPhotoStatus('idle');
      // Allows picking the same file again after a failed attempt.
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('saving');
    const payload = { ...form, avatar };
    await ProfileAPI.update(role, payload);
    updateUser(payload);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const idLabel = role === 'staff' ? t('profile.staffId') : t('profile.studentId');
  const idValue = role === 'staff' ? user?.staffId : user?.studentId;

  return (
    <>
      <section className="page-hero" style={{ padding: '56px 0 40px' }}>
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('profile.title')}</span>
          <h1>{form.name || (role === 'staff' ? t('login.staffTitle') : t('login.studentTitle'))}</h1>
          <p>{t('profile.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <form className="form-card" onSubmit={handleSave} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 26 }}>
              <div className="profile-avatar">
                {avatar ? (
                  <img src={avatar} alt="" />
                ) : (
                  <IconUser size={40} color="var(--gold)" />
                )}
                <button
                  type="button"
                  className="profile-avatar__edit"
                  onClick={() => fileRef.current?.click()}
                  aria-label={t('profile.changePhoto')}
                >
                  <IconCamera size={15} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
                <button type="button" className="btn btn-sm" style={{ color: 'var(--gold)', padding: 0 }} onClick={() => fileRef.current?.click()} disabled={photoStatus === 'uploading'}>
                  {photoStatus === 'uploading' ? t('profile.uploadingPhoto') || 'Uploading…' : t('profile.changePhoto')}
                </button>
                {avatar && (
                  <button type="button" className="btn btn-sm" style={{ color: 'var(--text-muted)', padding: 0 }} onClick={() => { setAvatar(null); updateUser({ avatar: null }); ProfileAPI.update(role, { ...form, avatar: null }); }}>
                    {t('profile.removePhoto')}
                  </button>
                )}
              </div>
              {photoError && <span className="form-error" style={{ marginTop: 8 }}>{photoError}</span>}
            </div>

            <div className="form-row">
              <label htmlFor="name">{t('profile.fullName')}</label>
              <input id="name" type="text" value={form.name} onChange={update('name')} />
            </div>

            <div className="form-row">
              <label htmlFor="pf-email">{t('profile.email')}</label>
              <input id="pf-email" type="email" value={form.email} onChange={update('email')} />
            </div>

            <div className="form-row">
              <label htmlFor="pf-phone">{t('profile.phone')}</label>
              <input id="pf-phone" type="tel" maxLength={10} value={form.phone} onChange={update('phone')} />
            </div>

            {idValue && (
              <div className="form-row">
                <label>{idLabel}</label>
                <input type="text" value={idValue} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <span className="form-note" style={{ marginTop: 6 }}>{t('profile.idNote')}</span>
              </div>
            )}

            {status === 'saved' && (
              <p style={{ color: '#2f7d52', fontSize: 13.5, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconCheck size={15} /> {t('profile.saved')}
              </p>
            )}

            <button type="submit" className="btn btn-gold btn-block" disabled={status === 'saving'}>
              {status === 'saving' ? t('profile.saving') : t('profile.save')}
            </button>

            <p className="form-note" style={{ marginTop: 14 }}>{t('profile.demoNote')}</p>

            <button type="button" className="btn btn-outline-dark btn-block" style={{ marginTop: 16 }} onClick={handleLogout}>
              {t('profile.logout')}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
