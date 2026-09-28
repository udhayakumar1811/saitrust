import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import FileDrop from '../ui/FileDrop';
import { IconPlus, IconEdit, IconTrash } from '../AdminIcons';

const CATEGORIES = ['Tailoring', 'Aari Embroidery', 'Beautician', 'Cake Baking', 'Convocation'];

export default function Gallery() {
  useAdminDb();
  const photos = AdminStore.getGallery();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('All');

  const openAdd = () => setEditing({ image: null, category: CATEGORIES[0], caption: '' });
  const openEdit = (p) => setEditing({ ...p });

  const handleSave = () => {
    if (!editing.image) return;
    if (editing.id) AdminStore.updateGalleryImage(editing.id, editing);
    else AdminStore.addGalleryImage(editing);
    setEditing(null);
  };

  const shown = filter === 'All' ? photos : photos.filter((p) => p.category === filter);

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Gallery</h1>
          <p>Photos shown in the public Gallery carousel, grouped by category filter tags.</p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={openAdd}><IconPlus size={15} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Add Photo</button>
      </div>

      <div className="admin-tag-list" style={{ marginBottom: 18 }}>
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            className="admin-tag"
            style={filter === c ? { background: 'var(--grad-gold)', color: '#241a06' } : undefined}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="admin-panel admin-table__empty">No photos in this category yet.</div>
      ) : (
        <div className="admin-card-grid">
          {shown.map((p) => (
            <div className="admin-media-card" key={p.id}>
              <div className="admin-media-card__img"><img src={p.image} alt={p.caption || p.category} /></div>
              <div className="admin-media-card__body">
                <div className="admin-media-card__title">{p.caption || 'Untitled'}</div>
                <div className="admin-media-card__meta">{p.category}</div>
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
        <Modal title={editing.id ? 'Edit Photo' : 'Add Photo'} onClose={() => setEditing(null)}>
          <div className="form-row">
            <label>Photo *</label>
            <FileDrop value={editing.image} onChange={(v) => setEditing((e) => ({ ...e, image: v }))} accept="image/*" kind="image" label="Choose photo" />
          </div>
          <div className="form-row">
            <label>Category</label>
            <select value={editing.category} onChange={(e) => setEditing((s) => ({ ...s, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Caption</label>
            <input type="text" value={editing.caption} onChange={(e) => setEditing((s) => ({ ...s, caption: e.target.value }))} />
          </div>
          <button type="button" className="btn btn-gold btn-block" onClick={handleSave} disabled={!editing.image}>
            {editing.id ? 'Save Changes' : 'Add Photo'}
          </button>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message="This photo will be removed from the public gallery."
          onCancel={() => setDeleting(null)}
          onConfirm={() => { AdminStore.deleteGalleryImage(deleting.id); setDeleting(null); }}
        />
      )}
    </div>
  );
}
