import { useEffect, useState } from 'react';
import ArtPanel from './ArtPanel';
import VideoModal from './VideoModal';
import { IconPlay, IconCalendar } from './Icons';
import { VideosAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * "Watch Our Latest Activities" — videos come dynamically from the admin
 * panel via VideosAPI. Hides itself entirely if there are none.
 */
export default function VideoSection() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    VideosAPI.getAll().then((res) => setVideos(res.data || []));
  }, []);

  if (videos !== null && videos.length === 0) return null;

  return (
    <section className="section section--tight video-section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('common.trainingInAction')}</span>
          <h2>{t('common.latestActivities')}</h2>
          <div className="divider-gold" />
        </div>

        <div className="grid-3">
          {videos === null && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '16 / 10', borderRadius: 'var(--radius-lg)' }} />
          ))}
          {videos && videos.map((v) => (
            <button key={v.id} type="button" className="video-thumb" onClick={() => setActive(v)}>
              <ArtPanel icon="sparkle" ratio="16 / 10" />
              <span className="video-thumb__play"><IconPlay size={26} /></span>
              <div className="video-thumb__info">
                <strong>{v.title}</strong>
                {v.date && <span><IconCalendar size={12} /> {formatDate(v.date)}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
