import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import ConfirmDialog from '../ui/ConfirmDialog';
import { IconTrash } from '../AdminIcons';

export default function ContactSubmissions() {
  useAdminDb();
  const messages = [...AdminStore.getContactSubmissions()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [deleting, setDeleting] = useState(null);

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Contact Form Submissions</h1>
          <p>Messages submitted via the public Contact form. These are also sent to WhatsApp and Email.</p>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Message</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {messages.length === 0 && <tr><td colSpan={6} className="admin-table__empty">No submissions yet.</td></tr>}
              {messages.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 700 }}>{m.name}</td>
                  <td>{m.phone}</td>
                  <td>{m.email}</td>
                  <td style={{ maxWidth: 320 }}>{m.message}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{m.date}</td>
                  <td>
                    <button className="admin-icon-btn-table danger" onClick={() => setDeleting(m)} aria-label="Delete"><IconTrash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleting && (
        <ConfirmDialog
          message="This message will be permanently removed from the inbox."
          onCancel={() => setDeleting(null)}
          onConfirm={() => { AdminStore.deleteContactSubmission(deleting.id); setDeleting(null); }}
        />
      )}
    </div>
  );
}
