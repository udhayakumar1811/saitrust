import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import FileDrop from '../ui/FileDrop';
import { IconPlus, IconEdit, IconTrash } from '../AdminIcons';

export default function HeroBanner() {
  useAdminDb();
  const images = AdminStore.getHeroImages();
  const [editing, setEditing] = useState(null); // { id?, image, caption }
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => setEditing({ image: null, caption: '' });
  const openEdit = (img) => setEditing({ ...img });

  const handleSave = () => {
    if (!editing.image) return;
    if (editing.id) AdminStore.updateHeroImage(editing.id, { image: editing.image, caption: editing.caption });
    else AdminStore.addHeroImage({ image: editing.image, caption: editing.caption });
    setEditing(null);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Home Hero Banner</h1>
          <p>The image shown in the large box on the right of the homepage hero. Only one image is shown at a time — delete the current one to add a different image, or to fall back to the default illustration.</p>
        </div>
        {images.length === 0 && (
          <button className="btn btn-gold btn-sm" onClick={openAdd}><IconPlus size={15} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Add Image</button>
        )}
      </div>

      {images.length === 0 ? (
        <div className="admin-panel admin-table__empty">No hero image yet — add one to show it on the public homepage. Until then, the default illustration is shown.</div>
      ) : (
        <div className="admin-card-grid">
          {images.map((img) => (
            <div className="admin-media-card" key={img.id}>
              <div className="admin-media-card__img"><img src={img.image} alt={img.caption || 'Hero'} /></div>
              <div className="admin-media-card__body">
                <div className="admin-media-card__title">{img.caption || 'Untitled slide'}</div>
                <div className="admin-media-card__meta">Hero slide</div>
              </div>
              <div className="admin-media-card__actions">
                <button className="btn btn-sm btn-outline-dark" onClick={() => openEdit(img)}><IconEdit size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />Edit</button>
                <button className="btn btn-sm admin-btn-danger" onClick={() => setDeleting(img)}><IconTrash size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit Hero Image' : 'Add Hero Image'} onClose={() => setEditing(null)}>
          <div className="form-row">
            <label>Image *</label>
            <FileDrop value={editing.image} onChange={(v) => setEditing((e) => ({ ...e, image: v }))} accept="image/*" kind="image" label="Choose image" />
          </div>
          <div className="form-row">
            <label>Caption (optional)</label>
            <input type="text" value={editing.caption} onChange={(e) => setEditing((s) => ({ ...s, caption: e.target.value }))} placeholder="e.g. New batch admissions open" />
          </div>
          <button type="button" className="btn btn-gold btn-block" onClick={handleSave} disabled={!editing.image}>
            {editing.id ? 'Save Changes' : 'Add Image'}
          </button>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message="This image will be removed from the homepage slideshow."
          onCancel={() => setDeleting(null)}
          onConfirm={() => { AdminStore.deleteHeroImage(deleting.id); setDeleting(null); }}
        />
      )}
    </div>
  );
}
