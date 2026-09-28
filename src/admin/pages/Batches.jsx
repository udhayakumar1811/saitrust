import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { IconPlus, IconEdit, IconTrash } from '../AdminIcons';

// Slot labels must match exactly what the public Batches page filters on
// (pages/Batches.jsx compares batch.slot to these English keys).
const SLOTS = [
  { value: 'Morning Batch', ta: 'காலை பேட்ச்' },
  { value: 'Afternoon Batch', ta: 'மதிய பேட்ச்' },
  { value: 'Evening Batch', ta: 'மாலை பேட்ச்' },
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// <input type="time"> works in 24h "HH:MM"; batch cards show "9:00 AM".
function to12h(value) {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}
function to24h(value) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value || '');
  if (!match) return '';
  let h = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${match[2]}`;
}

// A batch stores only day + month (e.g. "09", "JUN"), so the date picker is
// rebuilt from those using the current year when editing.
function toDateInput(day, month) {
  const idx = MONTHS.indexOf(String(month || '').toUpperCase());
  if (idx < 0 || !day) return '';
  return `${new Date().getFullYear()}-${String(idx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const emptyForm = () => ({
  courseSlug: '',
  date: '',
  slot: 'Morning Batch',
  startTime: '',
  endTime: '',
  seatsAvailable: 10,
});

export default function Batches() {
  useAdminDb();
  const batches = AdminStore.getBatches();
  const courses = AdminStore.getCourses();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => setEditing(emptyForm());
  const openEdit = (b) => setEditing({
    id: b.id,
    courseSlug: b.courseSlug,
    date: toDateInput(b.day, b.month),
    slot: b.slot,
    startTime: to24h(b.startTime),
    endTime: to24h(b.endTime),
    seatsAvailable: b.seatsAvailable,
  });

  const canSave = editing && editing.courseSlug && editing.date && editing.slot && editing.startTime && editing.endTime;

  const handleSave = () => {
    if (!canSave) return;
    const course = courses.find((c) => c.slug === editing.courseSlug);
    const slot = SLOTS.find((s) => s.value === editing.slot);
    const [, mm, dd] = editing.date.split('-');
    const payload = {
      courseSlug: editing.courseSlug,
      course: course?.name || editing.courseSlug,
      courseTa: course?.nameTa || '',
      day: dd,
      month: MONTHS[Number(mm) - 1],
      slot: slot.value,
      slotTa: slot.ta,
      startTime: to12h(editing.startTime),
      endTime: to12h(editing.endTime),
      seatsAvailable: Math.max(0, Number(editing.seatsAvailable) || 0),
    };
    if (editing.id) AdminStore.updateBatch(editing.id, payload);
    else AdminStore.addBatch(payload);
    setEditing(null);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Batches</h1>
          <p>Upcoming batch timings shown on the public Batches page and the Admission form. Add, edit or remove a batch here and the public site updates automatically.</p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={openAdd}>
          <IconPlus size={15} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Add Batch
        </button>
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Course</th><th>Date</th><th>Slot</th><th>Timing</th><th>Seats</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {batches.length === 0 && <tr><td colSpan={7} className="admin-table__empty">No batches yet — click "Add Batch" to create one.</td></tr>}
              {batches.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700 }}>{b.course}</td>
                  <td>{b.day} {b.month}</td>
                  <td>{b.slot}</td>
                  <td>{b.startTime} – {b.endTime}</td>
                  <td>{b.seatsAvailable}</td>
                  <td>
                    <span className={`status-pill ${b.seatsAvailable > 0 ? 'status-pill--approved' : 'status-pill--rejected'}`}>
                      {b.status || (b.seatsAvailable > 0 ? 'Seats Available' : 'Filling Fast')}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="btn btn-sm btn-outline-dark" onClick={() => openEdit(b)}><IconEdit size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />Edit</button>
                      <button className="btn btn-sm admin-btn-danger" onClick={() => setDeleting(b)}><IconTrash size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit Batch' : 'Add Batch'} onClose={() => setEditing(null)}>
          <div className="form-row">
            <label>Course *</label>
            <select value={editing.courseSlug} onChange={(e) => setEditing((s) => ({ ...s, courseSlug: e.target.value }))}>
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            {courses.length === 0 && <p className="form-note">Add a course under Courses first.</p>}
          </div>
          <div className="form-grid-2">
            <div className="form-row">
              <label>Start Date *</label>
              <input type="date" value={editing.date} onChange={(e) => setEditing((s) => ({ ...s, date: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>Slot *</label>
              <select value={editing.slot} onChange={(e) => setEditing((s) => ({ ...s, slot: e.target.value }))}>
                {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.value}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-row">
              <label>Start Time *</label>
              <input type="time" value={editing.startTime} onChange={(e) => setEditing((s) => ({ ...s, startTime: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>End Time *</label>
              <input type="time" value={editing.endTime} onChange={(e) => setEditing((s) => ({ ...s, endTime: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <label>Seats Available</label>
            <input type="number" min="0" value={editing.seatsAvailable} onChange={(e) => setEditing((s) => ({ ...s, seatsAvailable: e.target.value }))} />
          </div>
          <button type="button" className="btn btn-gold btn-block" onClick={handleSave} disabled={!canSave}>
            {editing.id ? 'Save Changes' : 'Add Batch'}
          </button>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message={`"${deleting.course}" (${deleting.day} ${deleting.month}, ${deleting.slot}) will be removed from the public Batches page.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { AdminStore.deleteBatch(deleting.id); setDeleting(null); }}
        />
      )}
    </div>
  );
}
