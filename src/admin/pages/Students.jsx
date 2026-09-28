import { useMemo, useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import Modal from '../ui/Modal';
import FileDrop from '../ui/FileDrop';
import { IconEdit } from '../AdminIcons';

export default function Students() {
  useAdminDb();
  const allStudents = AdminStore.getStudents();
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const students = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allStudents;
    return allStudents.filter(
      (s) => s.studentId?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q)
    );
  }, [allStudents, search]);

  const openEdit = (s) => setEditing({
    ...s,
    completed: s.certificateStatus.completed,
    certificateNote: s.certificateStatus.certificateNote || '',
    certificateImage: s.certificateStatus.certificateImage || null,
    batchTiming: s.upcomingClass.batchTiming || '',
    reminder: s.upcomingClass.reminder || '',
  });

  const handleSave = () => {
    AdminStore.updateStudent(editing.id, {
      certificateStatus: {
        completed: editing.completed,
        issuedAt: editing.completed ? (editing.issuedAt || AdminStore.todayStr()) : null,
        certificateNote: editing.certificateNote,
        certificateImage: editing.certificateImage,
      },
      upcomingClass: { batchTiming: editing.batchTiming, reminder: editing.reminder },
    });
    setEditing(null);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Students & Certificates</h1>
          <p>Controls the "Certificate Status" and "Upcoming Class" cards on each student's dashboard — no more placeholder text.</p>
        </div>
      </div>

      <div className="form-row" style={{ maxWidth: 320, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by Student ID or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Student</th><th>Course</th><th>Certificate Status</th><th>Upcoming Class</th><th></th></tr>
            </thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan={5} className="admin-table__empty">{allStudents.length === 0 ? 'No students yet.' : 'No students match that search.'}</td></tr>}
              {students.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.name}<br /><span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>{s.studentId}</span></td>
                  <td>{s.course}</td>
                  <td>
                    <span className={`status-pill ${s.certificateStatus.completed ? 'status-pill--approved' : 'status-pill--pending'}`}>
                      {s.certificateStatus.completed ? 'Certified' : 'In Progress'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{s.upcomingClass.batchTiming || '—'}</td>
                  <td>
                    <button className="admin-icon-btn-table" onClick={() => openEdit(s)} aria-label="Edit"><IconEdit size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={`Update ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="admin-panel" style={{ marginBottom: 16 }}>
            <h3>Certificate Status</h3>
            <div className="form-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={editing.completed} onChange={(e) => setEditing((s) => ({ ...s, completed: e.target.checked }))} />
                Course completed — issue ISO-certified certificate
              </label>
            </div>
            <div className="form-row">
              <label>Certificate Image</label>
              <FileDrop
                value={editing.certificateImage}
                onChange={(v) => setEditing((s) => ({ ...s, certificateImage: v }))}
                accept="image/*"
                kind="image"
                label="Choose certificate image"
              />
            </div>
            <div className="form-row">
              <label>Certificate Note (shown on student dashboard)</label>
              <input type="text" value={editing.certificateNote} onChange={(e) => setEditing((s) => ({ ...s, certificateNote: e.target.value }))} placeholder="e.g. Certificate ready for download" />
            </div>
          </div>
          <div className="admin-panel" style={{ marginBottom: 0 }}>
            <h3>Upcoming Class</h3>
            <div className="form-row">
              <label>Batch Timing</label>
              <input type="text" value={editing.batchTiming} onChange={(e) => setEditing((s) => ({ ...s, batchTiming: e.target.value }))} placeholder="e.g. Mon–Fri, 9:00 AM – 11:00 AM" />
            </div>
            <div className="form-row">
              <label>Reminder</label>
              <textarea rows={2} value={editing.reminder} onChange={(e) => setEditing((s) => ({ ...s, reminder: e.target.value }))} />
            </div>
          </div>
          <button type="button" className="btn btn-gold btn-block" style={{ marginTop: 16 }} onClick={handleSave}>Save Changes</button>
        </Modal>
      )}
    </div>
  );
}
