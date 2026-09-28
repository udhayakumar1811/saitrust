import { IconClose } from '../AdminIcons';

export default function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="admin-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: width }}>
        <div className="admin-modal__head">
          <h3>{title}</h3>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  );
}
