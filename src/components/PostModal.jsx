import ArtPanel from './ArtPanel';
import { IconClose, IconCalendar } from './Icons';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Opened from a post's "View Post" button — shows the post's image along
 * with its category, date, title and full description, mirroring the video
 * modal used for video posts.
 */
export default function PostModal({ post, onClose }) {
  if (!post) return null;

  const image = post.mediaUrl || post.image || post.imageUrl || null;

  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label={post.title} onClick={onClose}>
      <div className="video-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="video-modal__close" onClick={onClose} aria-label="Close post">
          <IconClose color="var(--text-on-ink)" />
        </button>

        <div className="post-modal__media">
          {image ? (
            <img src={image} alt={post.title || ''} />
          ) : (
            <div className="post-modal__placeholder">
              <ArtPanel icon="sparkle" ratio="16 / 9" />
            </div>
          )}
        </div>

        <div className="video-modal__info">
          <div className="post-modal__meta">
            {post.category && <span className="post-modal__badge">{post.category}</span>}
            {post.date && (
              <span className="post-modal__date">
                <IconCalendar size={12} /> {formatDate(post.date)}
              </span>
            )}
          </div>
          <h4>{post.title}</h4>
          {post.description && <p>{post.description}</p>}
        </div>
      </div>
    </div>
  );
}
