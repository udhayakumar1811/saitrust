import { IconClose } from './Icons';

export default function VideoModal({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label={video.title} onClick={onClose}>
      <div className="video-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="video-modal__close" onClick={onClose} aria-label="Close video">
          <IconClose color="var(--text-on-ink)" />
        </button>
        <div className="video-modal__player">
          {video.videoUrl || video.url ? (
            <video src={video.videoUrl || video.url} controls autoPlay style={{ width: '100%', height: '100%' }} />
          ) : (
            <div className="video-modal__placeholder">
              <p>Video coming soon — this will play automatically once the admin uploads the file.</p>
            </div>
          )}
        </div>
        <div className="video-modal__info">
          <h4>{video.title}</h4>
          {video.description && <p>{video.description}</p>}
        </div>
      </div>
    </div>
  );
}
