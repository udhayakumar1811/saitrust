import { useState, useEffect } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
  { key: 'completed', label: 'Completed' },
];

const PILL_CLASS = { pending: 'pending', approved: 'approved', declined: 'rejected', completed: 'completed' };
// Staff can submit a request at any time, so poll instead of fetching once —
// otherwise a request made after this page was first opened stays invisible
// until a hard reload.
const POLL_MS = 8000;

export default function Permissions() {
  useAdminDb();
  useEffect(() => {
    const id = setInterval(() => AdminStore.refreshPermissionRequests(), POLL_MS);
    return () => clearInterval(id);
  }, []);
  const [tab, setTab] = useState('pending');
  const all = [...AdminStore.getPermissionRequests()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const shown = all.filter((r) => r.status === tab);

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Permission Requests</h1>
          <p>Staff leave/step-out requests start Pending — Admin approves or declines, and once approved, Staff marks it Complete themselves. This full history is kept permanently; only the staff member's own dashboard view resets at midnight.</p>
        </div>
      </div>

      <div className="admin-tag-list" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className="admin-tag"
            style={tab === t.key ? { background: 'var(--grad-gold)', color: '#241a06' } : undefined}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({all.filter((r) => r.status === t.key).length})
          </button>
        ))}
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Staff</th><th>Date</th><th>Time</th><th>Description</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={6} className="admin-table__empty">No {tab} requests.</td></tr>}
              {shown.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.staffName}</td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td style={{ maxWidth: 320 }}>{r.description}</td>
                  <td>
                    <span className={`status-pill status-pill--${PILL_CLASS[r.status] || 'pending'}`}>{r.status}</span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      {r.status === 'pending' && (
                        <>
                          <button className="btn btn-sm btn-gold" onClick={() => AdminStore.approvePermissionRequest(r.id)}>Approve</button>
                          <button className="btn btn-sm btn-outline-dark" onClick={() => AdminStore.declinePermissionRequest(r.id)}>Decline</button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button className="btn btn-sm btn-outline-dark" onClick={() => AdminStore.completePermissionRequest(r.id)}>Mark Complete</button>
                      )}
                    </div>
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
