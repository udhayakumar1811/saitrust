import DynamicImage from './DynamicImage';
import { IconPlay, IconCalendar } from './Icons';
import { IconTrash } from '../admin/AdminIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PostCard({ post, onWatch, onView, onDelete }) {
  const { lang, t } = useLanguage();
  const { isStaff } = useAuth();
  const title = (lang === 'ta' && post.titleTa) || post.title;
  const description = (lang === 'ta' && post.descriptionTa) || post.description;
  const isVideo = post.type === 'video';
  const image = post.mediaUrl || post.image || post.imageUrl || null;

  const open = () => (isVideo ? onWatch?.(post) : onView?.(post));

  return (
    <article className="post-card">
      <div className="post-card__media" onClick={open} role="button" tabIndex={0}>
        <DynamicImage src={isVideo ? null : image} alt={title || ''} icon="sparkle" ratio="16 / 10" />
        {isVideo && (
          <span className="post-card__play"><IconPlay size={22} /></span>
        )}
        <span className="post-card__tag">{post.category}</span>
      </div>
      <div className="post-card__body">
        {post.date && (
          <span className="post-card__date"><IconCalendar size={13} /> {formatDate(post.date)}</span>
        )}
        <h4 className="post-card__title">{title}</h4>
        <p className="post-card__desc">{description}</p>

        <div className="post-card__actions">
          {isVideo ? (
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => onWatch?.(post)}>
              {t('common.watchVideo')}
            </button>
          ) : (
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => onView?.(post)}>
              {t('common.viewPost')}
            </button>
          )}

          {/* Delete is only ever offered to a logged-in staff member. */}
          {isStaff && onDelete && (
            <button
              type="button"
              className="btn btn-sm post-card__delete"
              onClick={() => onDelete(post)}
            >
              <IconTrash size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />
              {isVideo ? t('common.deleteVideo') : t('common.deletePost')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
