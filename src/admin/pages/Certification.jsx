import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import FileDrop from '../ui/FileDrop';
import { IconPlus, IconEdit, IconTrash } from '../AdminIcons';

export default function Certification() {
  useAdminDb();
  const items = AdminStore.getCertification();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => setEditing({ image: null, caption: '' });
  const openEdit = (p) => setEditing({ ...p });

  const handleSave = () => {
    if (!editing.image) return;
    if (editing.id) AdminStore.updateCertification(editing.id, editing);
    else AdminStore.addCertification(editing);
    setEditing(null);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Certification</h1>
          <p>The image shown in the Certification section on the public site. Only one image is shown at a time — delete the current one to replace it, or to fall back to the default illustration.</p>
        </div>
        {items.length === 0 && (
          <button className="btn btn-gold btn-sm" onClick={openAdd}><IconPlus size={15} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Add Image</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="admin-panel admin-table__empty">No certification image yet — add one to show it on the public site. Until then, the default illustration is shown.</div>
      ) : (
        <div className="admin-card-grid">
          {items.map((p) => (
            <div className="admin-media-card" key={p.id}>
              <div className="admin-media-card__img"><img src={p.image} alt={p.caption} /></div>
              <div className="admin-media-card__body">
                <div className="admin-media-card__title">{p.caption || 'Untitled'}</div>
                <div className="admin-media-card__meta">Certification</div>
              </div>
              <div className="admin-media-card__actions">
                <button className="btn btn-sm btn-outline-dark" onClick={() => openEdit(p)}><IconEdit size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />Edit</button>
                <button className="btn btn-sm admin-btn-danger" onClick={() => setDeleting(p)}><IconTrash size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit Image' : 'Add Certification Image'} onClose={() => setEditing(null)}>
          <div className="form-row">
            <label>Image *</label>
            <FileDrop value={editing.image} onChange={(v) => setEditing((e) => ({ ...e, image: v }))} accept="image/*" kind="image" label="Choose image" />
          </div>
          <div className="form-row">
            <label>Caption</label>
            <input type="text" value={editing.caption} onChange={(e) => setEditing((s) => ({ ...s, caption: e.target.value }))} />
          </div>
          <button type="button" className="btn btn-gold btn-block" onClick={handleSave} disabled={!editing.image}>
            {editing.id ? 'Save Changes' : 'Add Image'}
          </button>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message="This certification image will be removed from the public site."
          onCancel={() => setDeleting(null)}
          onConfirm={() => { AdminStore.deleteCertification(deleting.id); setDeleting(null); }}
        />
      )}
    </div>
  );
}
