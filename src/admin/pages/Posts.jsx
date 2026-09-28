import { useState, useEffect } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import FileDrop from '../ui/FileDrop';
import { IconPlus, IconEdit, IconTrash } from '../AdminIcons';

const blank = { type: 'image', title: '', category: 'Training', description: '', media: null, authorName: 'Admin', author: 'admin' };
// Staff can publish a post from their own dashboard at any time, so this
// page polls for new ones instead of only fetching once — otherwise a post
// made after this page was first opened stays invisible until a hard reload.
const POLL_MS = 8000;

export default function Posts() {
  useAdminDb();
  const posts = AdminStore.getPosts();
  useEffect(() => {
    const id = setInterval(() => AdminStore.refreshPosts(), POLL_MS);
    return () => clearInterval(id);
  }, []);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => setEditing({ ...blank });
  const openEdit = (p) => setEditing({ ...p });

  const handleSave = () => {
    if (!editing.title.trim()) return;
    if (editing.id) AdminStore.updatePost(editing.id, editing);
    else AdminStore.addPost(editing);
    setEditing(null);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Posts & Updates</h1>
          <p>Full control over every post — including ones created by Staff. Each post is either an Image Post or a Video Post.</p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={openAdd}><IconPlus size={15} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Add Post</button>
      </div>

      {posts.length === 0 ? (
        <div className="admin-panel admin-table__empty">No posts yet. Posts created by Staff will also appear here.</div>
      ) : (
        <div className="admin-card-grid">
          {posts.map((p) => (
            <div className="admin-media-card" key={p.id}>
              <div className="admin-media-card__img">
                {p.media ? (p.type === 'video' ? <video src={p.media} /> : <img src={p.media} alt={p.title} />) : <span>No media</span>}
              </div>
              <div className="admin-media-card__body">
                <div className="admin-media-card__title">{p.title}</div>
                <div className="admin-media-card__meta">{p.category} · {p.type} · by {p.authorName || 'Staff'}</div>
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
        <Modal title={editing.id ? 'Edit Post' : 'Add Post'} onClose={() => setEditing(null)}>
          <div className="form-row">
            <label>Post Type</label>
            <select value={editing.type} onChange={(e) => setEditing((s) => ({ ...s, type: e.target.value, media: null }))}>
              <option value="image">Image Post</option>
              <option value="video">Video Post</option>
            </select>
          </div>
          <div className="form-row">
            <label>Title *</label>
            <input type="text" value={editing.title} onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Category</label>
            <select value={editing.category} onChange={(e) => setEditing((s) => ({ ...s, category: e.target.value }))}>
              <option>Training</option>
              <option>Admissions</option>
              <option>Events</option>
            </select>
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea rows={3} value={editing.description} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>{editing.type === 'video' ? 'Video File' : 'Image File'}</label>
            <FileDrop
              value={editing.media}
              onChange={(v) => setEditing((s) => ({ ...s, media: v }))}
              accept={editing.type === 'video' ? 'video/*' : 'image/*'}
              kind={editing.type}
              label={editing.type === 'video' ? 'Choose video' : 'Choose image'}
            />
          </div>
          <button type="button" className="btn btn-gold btn-block" onClick={handleSave} disabled={!editing.title.trim()}>
            {editing.id ? 'Save Changes' : 'Publish Post'}
          </button>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message={`"${deleting.title}" will be removed from the public Posts & Updates page.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { AdminStore.deletePost(deleting.id); setDeleting(null); }}
        />
      )}
    </div>
  );
}
