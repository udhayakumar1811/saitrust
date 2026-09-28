import { useState } from 'react';
import ArtPanel from './ArtPanel';

/**
 * Renders an admin-uploaded image (course photo, gallery photo, etc.) when
 * a URL is available, and falls back to the illustrated ArtPanel
 * placeholder when there's no image yet, or if the URL fails to load —
 * so a broken/missing upload never shows a broken-image icon to visitors.
 */
export default function DynamicImage({ src, alt = '', icon = 'users', tone = 'ink', ratio = '4 / 3', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ArtPanel icon={icon} tone={tone} ratio={ratio} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: ratio, borderRadius: 'inherit', display: 'block' }}
    />
  );
}
