import { useEffect, useMemo, useState } from 'react';
import GalleryCoverflow from '../components/GalleryCoverflow';
import { GalleryItemSkeleton, ErrorState } from '../components/Skeletons';
import { GalleryAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

const ICON_BY_CATEGORY = {
  Tailoring: 'scissors',
  'Aari Embroidery': 'needle',
  Beautician: 'sparkle',
  'Cake Baking': 'cake',
  Convocation: 'users',
};

export default function Gallery() {
  const { t } = useLanguage();
  const [images, setImages] = useState(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = () => {
    setError(false);
    setImages(null);
    GalleryAPI.getAll().then((res) => {
      if (res.error) setError(true);
      setImages(res.data || []);
    });
  };

  useEffect(load, []);

  const categories = useMemo(() => {
    if (!images) return ['All'];
    return ['All', ...new Set(images.map((i) => i.category))];
  }, [images]);

  const filtered = useMemo(() => {
    if (!images) return null;
    return filter === 'All' ? images : images.filter((i) => i.category === filter);
  }, [images, filter]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('gallery.eyebrow')}</span>
          <h1>{t('gallery.title')}</h1>
          <p>{t('gallery.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {images && (
            <div className="courses-toolbar">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`courses-toolbar__chip ${filter === c ? 'courses-toolbar__chip--active' : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {c === 'All' ? t('gallery.catAll') : c}
                </button>
              ))}
            </div>
          )}

          {error && <ErrorState message={t('gallery.errorMsg')} onRetry={load} />}

          {!error && images === null && (
            <div className="gallery-grid">
              {Array.from({ length: 9 }).map((_, i) => <GalleryItemSkeleton key={i} />)}
            </div>
          )}

          {!error && filtered && (
            <GalleryCoverflow items={filtered} iconFor={(category) => ICON_BY_CATEGORY[category] || 'users'} />
          )}
        </div>
      </section>
    </>
  );
}
