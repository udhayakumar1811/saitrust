import { useEffect, useMemo, useState } from 'react';
import BatchCard from '../components/BatchCard';
import Carousel from '../components/Carousel';
import { BatchCardSkeleton } from '../components/Skeletons';
import { BatchesAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export default function Batches() {
  const { t } = useLanguage();
  const [batches, setBatches] = useState(null);
  const [filter, setFilter] = useState('All');

  const SLOTS = [
    { key: 'All', label: t('batches.slotAll') },
    { key: 'Morning Batch', label: t('batches.slotMorning') },
    { key: 'Afternoon Batch', label: t('batches.slotAfternoon') },
    { key: 'Evening Batch', label: t('batches.slotEvening') },
  ];

  const load = () => {
    BatchesAPI.getUpcoming().then((res) => setBatches(res.data || []));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!batches) return null;
    if (filter === 'All') return batches;
    return batches.filter((b) => b.slot === filter);
  }, [batches, filter]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('batches.eyebrow')}</span>
          <h1>{t('batches.title')}</h1>
          <p>{t('batches.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="batch-filter-bar">
            {SLOTS.map((s) => (
              <button
                key={s.key}
                className={`courses-toolbar__chip ${filter === s.key ? 'courses-toolbar__chip--active' : ''}`}
                onClick={() => setFilter(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {batches === null && (
            <div className="batches-grid">
              {Array.from({ length: 4 }).map((_, i) => <BatchCardSkeleton key={i} />)}
            </div>
          )}

          {filtered && filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('batches.empty')}</p>
          )}

          {filtered && filtered.length > 0 && (
            <Carousel size="batches" ariaLabel={t('batches.title')} key={filter}>
              {filtered.map((b) => <BatchCard key={b.id} batch={b} />)}
            </Carousel>
          )}
        </div>
      </section>
    </>
  );
}
