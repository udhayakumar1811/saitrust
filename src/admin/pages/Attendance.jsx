import { useState, useEffect } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import { IconCalendar } from '../../components/Icons';

// Matches the page's own "visible here in real time" claim — a staff
// self-check-in should show up without the admin having to reload.
const POLL_MS = 8000;

export default function Attendance() {
  useAdminDb();
  const staff = AdminStore.getStaffAccounts();
  const [date, setDate] = useState(AdminStore.todayStr());
  useEffect(() => {
    const id = setInterval(() => AdminStore.refreshAttendance(date), POLL_MS);
    return () => clearInterval(id);
  }, [date]);

  const setStatus = (staffId, status) => AdminStore.setAttendance(staffId, date, status);

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Attendance</h1>
          <p>Staff self-check-ins are visible here in real time. Any staff member who doesn't mark themselves present by end of day is automatically marked Absent — Admin can override any record at any time.</p>
        </div>
        <div className="form-row" style={{ marginBottom: 0, minWidth: 190 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconCalendar size={14} /> Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={AdminStore.todayStr()} />
        </div>
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Staff</th><th>Staff ID</th><th>Status</th><th>Time Marked</th><th>Source</th><th>Admin Override</th></tr>
            </thead>
            <tbody>
              {staff.length === 0 && <tr><td colSpan={6} className="admin-table__empty">No staff accounts yet.</td></tr>}
              {staff.map((s) => {
                const rec = AdminStore.getEffectiveStatus(s.staffId, date);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.name}</td>
                    <td>{s.staffId}</td>
                    <td>
                      <span className={`status-pill ${rec.status === 'present' ? 'status-pill--approved' : rec.status === 'absent' ? 'status-pill--rejected' : 'status-pill--pending'}`}>
                        {rec.status === 'unmarked' ? 'Not marked yet' : rec.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {rec.updatedAt ? new Date(rec.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {rec.source === 'self' && 'Self check-in'}
                      {rec.source === 'auto' && 'Auto-marked absent'}
                      {rec.source === 'admin' && 'Admin override'}
                      {!rec.source && '—'}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="btn btn-sm btn-outline-dark"
                          disabled={rec.status === 'present'}
                          onClick={() => setStatus(s.staffId, 'present')}
                        >
                          Mark Present
                        </button>
                        <button
                          className="btn btn-sm admin-btn-danger"
                          disabled={rec.status === 'absent'}
                          onClick={() => setStatus(s.staffId, 'absent')}
                        >
                          Mark Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
