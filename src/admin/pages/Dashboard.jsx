import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import { IconCalendar } from '../../components/Icons';

export default function Dashboard() {
  useAdminDb();
  const [date, setDate] = useState(AdminStore.todayStr());

  const staff = AdminStore.getStaffAccounts();
  const students = AdminStore.getStudents();
  const courses = AdminStore.getCourses();
  const posts = AdminStore.getPosts();
  const permissions = AdminStore.getPermissionRequests();
  const messages = AdminStore.getContactSubmissions();

  const attendanceForDate = staff.map((s) => ({
    staff: s,
    record: AdminStore.getEffectiveStatus(s.staffId, date),
  }));

  const presentCount = attendanceForDate.filter((r) => r.record.status === 'present').length;
  const pendingPermissions = permissions.filter((p) => p.status === 'pending').length;

  const cards = [
    { label: 'Staff Online / Active Today', value: `${presentCount} / ${staff.length}`, sub: 'Marked present on selected date' },
    { label: 'Total Students', value: students.length, sub: 'Registered on the platform' },
    { label: 'Total Courses', value: courses.length, sub: 'Live on the public site' },
    { label: 'Posts & Updates', value: posts.length, sub: 'Published by staff & admin' },
    { label: 'Pending Permission Requests', value: pendingPermissions, sub: 'Awaiting your approval' },
    { label: 'Contact Messages', value: messages.length, sub: 'Received via contact form' },
  ];

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Dashboard</h1>
          <p>At-a-glance overview of the trust's activity. Pick a date to see that day's attendance in detail.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        {cards.map((c) => (
          <div className="admin-stat-card" key={c.label}>
            <span className="admin-stat-card__label">{c.label}</span>
            <span className="admin-stat-card__value">{c.value}</span>
            <span className="admin-stat-card__sub">{c.sub}</span>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <h3>Day Details</h3>
            <p className="admin-panel__hint" style={{ marginBottom: 0 }}>Staff attendance status for the selected date.</p>
          </div>
          <div className="form-row" style={{ marginBottom: 0, minWidth: 190 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconCalendar size={14} /> Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={AdminStore.todayStr()} />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Staff ID</th>
                <th>Status</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {attendanceForDate.length === 0 && (
                <tr><td colSpan={4} className="admin-table__empty">No staff accounts yet.</td></tr>
              )}
              {attendanceForDate.map(({ staff: s, record }) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td>{s.staffId}</td>
                  <td>
                    <span className={`status-pill ${record.status === 'present' ? 'status-pill--approved' : record.status === 'absent' ? 'status-pill--rejected' : 'status-pill--pending'}`}>
                      {record.status === 'unmarked' ? 'Not marked yet' : record.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                    {record.source === 'self' && 'Self check-in'}
                    {record.source === 'auto' && 'Auto-marked absent'}
                    {record.source === 'admin' && 'Admin override'}
                    {!record.source && '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
