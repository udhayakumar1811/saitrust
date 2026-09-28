import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import { IconTrash, IconPlus } from '../AdminIcons';

export default function FooterSettings() {
  useAdminDb();
  const settings = AdminStore.getFooterSettings();
  const [form, setForm] = useState({ ...settings, phones: [...settings.phones] });
  const [newPhone, setNewPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const addPhone = () => {
    if (!newPhone.trim()) return;
    setForm((f) => ({ ...f, phones: [...f.phones, newPhone.trim()] }));
    setNewPhone('');
  };
  const removePhone = (i) => setForm((f) => ({ ...f, phones: f.phones.filter((_, idx) => idx !== i) }));

  const handleSave = (e) => {
    e.preventDefault();
    AdminStore.updateFooterSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Footer & Contact Info</h1>
          <p>Whatever you edit here automatically reflects in the site Footer. Changing the address also updates the embedded map on the Contact page.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-panel">
          <h3>Phone Numbers</h3>
          <p className="admin-panel__hint">Shown in the footer and on the Contact page.</p>
          <div className="admin-tag-list" style={{ marginBottom: 12 }}>
            {form.phones.map((p, i) => (
              <span className="admin-tag" key={i}>
                {p}
                <button type="button" onClick={() => removePhone(i)}><IconTrash size={13} /></button>
              </span>
            ))}
          </div>
          <div className="admin-inline-form">
            <div className="form-row" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
              <input type="text" placeholder="+91 90000 00000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={addPhone}><IconPlus size={14} style={{ marginRight: 5, verticalAlign: '-2px' }} />Add Number</button>
          </div>
        </div>

        <div className="admin-panel">
          <h3>Contact Details</h3>
          <div className="form-grid-2">
            <div className="form-row">
              <label>WhatsApp Number</label>
              <input type="text" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="919025116369" />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <label>Address</label>
            <textarea rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            <p className="form-note">Updating this also updates the embedded Google Map on the Contact page.</p>
          </div>
        </div>

        <div className="admin-panel">
          <h3>Social Media Links</h3>
          <div className="form-grid-2">
            <div className="form-row">
              <label>Instagram</label>
              <input type="text" value={form.social.instagram} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, instagram: e.target.value } }))} />
            </div>
            <div className="form-row">
              <label>Facebook</label>
              <input type="text" value={form.social.facebook} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, facebook: e.target.value } }))} />
            </div>
          </div>
          <div className="form-row">
            <label>YouTube</label>
            <input type="text" value={form.social.youtube} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, youtube: e.target.value } }))} />
          </div>
        </div>

        {saved && <p className="admin-success-note">Footer & contact settings updated.</p>}
        <button type="submit" className="btn btn-gold">Save Changes</button>
      </form>
    </div>
  );
}
