import { useEffect, useRef } from 'react';
import DynamicImage from './DynamicImage';

/**
 * Continuous, auto-scrolling "coverflow" strip: the track drifts smoothly
 * left-to-right forever (CSS animation, items duplicated once so the loop
 * is seamless), while a small rAF loop scales/fades each card by how close
 * it is to the strip's center — the middle image pops forward, the rest
 * recede — instead of the old grid where new photos just popped in below.
 * Hovering (or touching) pauses the drift so a photo can be looked at.
 */
export default function GalleryCoverflow({ items, iconFor }) {
  const trackRef = useRef(null);

  useEffect(() => {
    if (!items.length) return undefined;
    let frameId;
    const tick = () => {
      const track = trackRef.current;
      const container = track?.parentElement;
      if (track && container) {
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const halfWidth = containerRect.width / 2 || 1;
        Array.from(track.children).forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const norm = Math.min(Math.abs(cardCenter - centerX) / halfWidth, 1); // 0 = dead center, 1 = edge
          const scale = 1.18 - norm * 0.38;
          const opacity = 1 - norm * 0.6;
          card.style.transform = `scale(${scale.toFixed(3)})`;
          card.style.opacity = opacity.toFixed(3);
          card.style.zIndex = String(Math.round((1 - norm) * 100));
        });
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [items]);

  if (!items.length) return null;
  // Duplicated once so translateX(-50%) -> translateX(0) always lines up
  // with an identical copy, giving an endless loop with no visible seam.
  const loopItems = [...items, ...items];

  return (
    <div className="gallery-coverflow">
      <div className="gallery-coverflow__track" ref={trackRef}>
        {loopItems.map((img, i) => (
          <div className="gallery-coverflow__item" key={`${img.id}-${i}`}>
            <DynamicImage src={img.image} alt={img.caption} icon={iconFor(img.category)} ratio="1 / 1" />
            <div className="gallery-item__caption">
              <span>{img.category}</span>
              <strong>{img.caption}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
