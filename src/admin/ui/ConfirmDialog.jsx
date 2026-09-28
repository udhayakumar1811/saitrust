export default function ConfirmDialog({ title = 'Are you sure?', message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div className="admin-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="admin-modal" style={{ maxWidth: 400 }}>
        <div className="admin-modal__body" style={{ paddingTop: 24 }}>
          <h3 style={{ marginBottom: 10 }}>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>{message}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
            <button type="button" className="btn btn-sm admin-btn-danger" onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
