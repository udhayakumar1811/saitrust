import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import FileDrop from '../ui/FileDrop';
import { IconPlus, IconEdit, IconTrash } from '../AdminIcons';

const blank = {
  name: '', nameTa: '',
  category: '', tagline: '', taglineTa: '',
  duration: '', durationTa: '',
  description: '', descriptionTa: '',
  highlights: '', highlightsTa: '',
  benefits: '', benefitsTa: '',
  practicalProject: '', practicalProjectTa: '',
  image: null,
};

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Multi-line textarea <-> string[] helpers, used for highlights/benefits.
const toLines = (arr) => (arr || []).join('\n');
const fromLines = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);

export default function Courses() {
  useAdminDb();
  const courses = AdminStore.getCourses();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => setEditing({ ...blank });
  const openEdit = (c) =>
    setEditing({
      ...c,
      highlights: toLines(c.highlights),
      highlightsTa: toLines(c.highlightsTa),
      benefits: toLines(c.benefits),
      benefitsTa: toLines(c.benefitsTa),
    });

  const handleSave = () => {
    if (!editing.name.trim()) return;
    const payload = {
      name: editing.name.trim(),
      nameTa: editing.nameTa.trim(),
      slug: editing.slug || slugify(editing.name),
      category: editing.category.trim(),
      tagline: editing.tagline.trim(),
      taglineTa: editing.taglineTa.trim(),
      duration: editing.duration.trim(),
      durationTa: editing.durationTa.trim(),
      description: editing.description.trim(),
      descriptionTa: editing.descriptionTa.trim(),
      highlights: fromLines(editing.highlights),
      highlightsTa: fromLines(editing.highlightsTa),
      benefits: fromLines(editing.benefits),
      benefitsTa: fromLines(editing.benefitsTa),
      practicalProject: editing.practicalProject.trim(),
      practicalProjectTa: editing.practicalProjectTa.trim(),
      image: editing.image,
    };
    if (editing.id) AdminStore.updateCourse(editing.id, payload);
    else AdminStore.addCourse(payload);
    setEditing(null);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Courses</h1>
          <p>Manage the courses shown on the public Courses &amp; Course Details pages, in both English and Tamil.</p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={openAdd}><IconPlus size={15} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Add Course</button>
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Course</th><th>Category</th><th>Duration</th><th>Highlights</th><th></th></tr>
            </thead>
            <tbody>
              {courses.length === 0 && <tr><td colSpan={5} className="admin-table__empty">No courses yet.</td></tr>}
              {courses.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>{c.category || '—'}</td>
                  <td>{c.duration || '—'}</td>
                  <td>{(c.highlights || []).length} points</td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-icon-btn-table" onClick={() => openEdit(c)} aria-label="Edit"><IconEdit size={16} /></button>
                      <button className="admin-icon-btn-table danger" onClick={() => setDeleting(c)} aria-label="Delete"><IconTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit Course' : 'Add Course'} onClose={() => setEditing(null)} width={680}>
          <div className="form-row">
            <label>Course Image</label>
            <FileDrop value={editing.image} onChange={(v) => setEditing((s) => ({ ...s, image: v }))} accept="image/*" kind="image" label="Choose course image" />
          </div>

          <h4 className="admin-form-section">English</h4>
          <div className="form-row">
            <label>Course Title *</label>
            <input type="text" value={editing.name} onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div className="form-grid-2">
            <div className="form-row">
              <label>Category</label>
              <input type="text" value={editing.category} onChange={(e) => setEditing((s) => ({ ...s, category: e.target.value }))} placeholder="e.g. Tailoring, Aari Embroidery, Beautician, Cake Baking" />
            </div>
            <div className="form-row">
              <label>Duration</label>
              <input type="text" value={editing.duration} onChange={(e) => setEditing((s) => ({ ...s, duration: e.target.value }))} placeholder="e.g. 2 Months" />
            </div>
          </div>
          <div className="form-row">
            <label>Tagline / Badge <span className="form-note-inline">(small badge on the card, e.g. "Trending", "Bridal Specialist")</span></label>
            <input type="text" value={editing.tagline} onChange={(e) => setEditing((s) => ({ ...s, tagline: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea rows={3} value={editing.description} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Highlights / Key Modules (one per line)</label>
            <textarea rows={4} value={editing.highlights} onChange={(e) => setEditing((s) => ({ ...s, highlights: e.target.value }))} placeholder={'20+ Aari stitches\nZardosi & bead work\nLace work'} />
          </div>
          <div className="form-row">
            <label>Benefits / Career Paths (one per line)</label>
            <textarea rows={3} value={editing.benefits} onChange={(e) => setEditing((s) => ({ ...s, benefits: e.target.value }))} placeholder={'Offer bridal & boutique embroidery services\nWork on order-based freelance projects'} />
          </div>
          <div className="form-row">
            <label>Practical Project</label>
            <input type="text" value={editing.practicalProject} onChange={(e) => setEditing((s) => ({ ...s, practicalProject: e.target.value }))} placeholder="e.g. Design and complete a hand-embroidered bridal blouse." />
          </div>

          <h4 className="admin-form-section">தமிழ் (Tamil)</h4>
          <p className="form-note" style={{ marginTop: -8, marginBottom: 14 }}>
            Optional — if left blank, the site shows the English text when a visitor switches to Tamil.
          </p>
          <div className="form-row">
            <label>Course Title (Tamil)</label>
            <input type="text" value={editing.nameTa} onChange={(e) => setEditing((s) => ({ ...s, nameTa: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Duration (Tamil)</label>
            <input type="text" value={editing.durationTa} onChange={(e) => setEditing((s) => ({ ...s, durationTa: e.target.value }))} placeholder="e.g. 2 மாதங்கள்" />
          </div>
          <div className="form-row">
            <label>Tagline / Badge (Tamil)</label>
            <input type="text" value={editing.taglineTa} onChange={(e) => setEditing((s) => ({ ...s, taglineTa: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Description (Tamil)</label>
            <textarea rows={3} value={editing.descriptionTa} onChange={(e) => setEditing((s) => ({ ...s, descriptionTa: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Highlights / Key Modules (Tamil, one per line)</label>
            <textarea rows={4} value={editing.highlightsTa} onChange={(e) => setEditing((s) => ({ ...s, highlightsTa: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Benefits / Career Paths (Tamil, one per line)</label>
            <textarea rows={3} value={editing.benefitsTa} onChange={(e) => setEditing((s) => ({ ...s, benefitsTa: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Practical Project (Tamil)</label>
            <input type="text" value={editing.practicalProjectTa} onChange={(e) => setEditing((s) => ({ ...s, practicalProjectTa: e.target.value }))} />
          </div>

          <button type="button" className="btn btn-gold btn-block" onClick={handleSave} disabled={!editing.name.trim()}>
            {editing.id ? 'Save Changes' : 'Add Course'}
          </button>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message={`"${deleting.name}" will be removed from the public Courses page.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { AdminStore.deleteCourse(deleting.id); setDeleting(null); }}
        />
      )}
    </div>
  );
}
