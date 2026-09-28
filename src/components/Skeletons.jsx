export function CourseCardSkeleton() {
  return (
    <div className="course-card">
      <div className="skeleton" style={{ aspectRatio: '16 / 11', borderRadius: 'var(--radius-md)' }} />
      <div className="course-card__body">
        <div className="skeleton" style={{ width: 90, height: 12, borderRadius: 6, marginBottom: 14 }} />
        <div className="skeleton" style={{ width: '80%', height: 20, borderRadius: 6, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '100%', height: 12, borderRadius: 6, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '70%', height: 12, borderRadius: 6, marginBottom: 18 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="skeleton" style={{ width: '100%', height: 38, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: '100%', height: 38, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

export function BatchCardSkeleton() {
  return (
    <div className="batch-card">
      <div className="skeleton" style={{ width: 68, borderRadius: 'var(--radius-md)' }} />
      <div className="batch-card__body">
        <div className="skeleton" style={{ width: '60%', height: 18, borderRadius: 6, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '85%', height: 12, borderRadius: 6, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '55%', height: 12, borderRadius: 6, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 38, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export function GalleryItemSkeleton() {
  return <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)' }} />;
}

export function ErrorState({ message = 'Something went wrong while loading this content.', onRetry }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-outline-dark btn-sm" onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}
