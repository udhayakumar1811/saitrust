import { useCallback, useEffect, useRef, useState } from 'react';
import { IconArrow } from './Icons';

/**
 * Horizontal carousel used for the Courses, Batches and Posts sections.
 * Cards sit in a scrollable track so newly added items simply extend the
 * row to the right instead of pushing the grid taller, and the arrow
 * buttons page through them. The track is also swipe/scroll friendly on
 * touch devices, where the arrows are hidden.
 */
export default function Carousel({ children, size = 'default', ariaLabel = 'carousel' }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync, items.length]);

  const page = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const firstItem = el.firstElementChild;
    const step = firstItem ? firstItem.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <div className="carousel" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="carousel__nav carousel__nav--prev"
        onClick={() => page(-1)}
        disabled={!canPrev}
        aria-label="Previous"
      >
        <IconArrow size={16} />
      </button>

      <div className={`carousel__track carousel__track--${size}`} ref={trackRef}>
        {items.map((child, i) => (
          <div className="carousel__item" key={child?.key ?? i}>
            {child}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="carousel__nav carousel__nav--next"
        onClick={() => page(1)}
        disabled={!canNext}
        aria-label="Next"
      >
        <IconArrow size={16} />
      </button>
    </div>
  );
}
