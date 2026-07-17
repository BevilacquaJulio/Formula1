import { useCallback, useEffect, useRef, useState } from 'react';
import { GALLERY_COUNT } from '../../data/timeline';
import './Gallery.module.css';

const DURATION = 5000;
const INTERVAL = 50;

export function Gallery() {
  const [current, setCurrent] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef(0);

  const total = GALLERY_COUNT;

  const clearTimers = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  const scrollThumbnail = useCallback((index: number) => {
    const container = thumbnailsRef.current;
    if (!container) return;
    const thumb = container.children[index] as HTMLElement | undefined;
    if (!thumb) return;
    const thumbCenter = thumb.offsetLeft + thumb.offsetWidth / 2;
    const containerCenter = container.clientWidth / 2;
    container.scrollTo({ left: thumbCenter - containerCenter, behavior: 'smooth' });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(() => {
        const next = (index + total) % total;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${next * 100}%)`;
        }
        scrollThumbnail(next);
        return next;
      });
      setProgressWidth(0);
    },
    [total, scrollThumbnail],
  );

  const resetProgress = useCallback(() => {
    clearTimers();
    setProgressWidth(0);

    progressTimerRef.current = setInterval(() => {
      setProgressWidth((prev) => Math.min(prev + (INTERVAL / DURATION) * 100, 100));
    }, INTERVAL);

    autoTimerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % total;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${next * 100}%)`;
        }
        scrollThumbnail(next);
        return next;
      });
      setProgressWidth(0);
    }, DURATION);
  }, [clearTimers, total, scrollThumbnail]);

  useEffect(() => {
    resetProgress();
    return clearTimers;
  }, [resetProgress, clearTimers]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const site = document.getElementById('site');
      if (!site?.classList.contains('is-visible')) return;
      if (e.key === 'ArrowRight') {
        goTo(current + 1);
        resetProgress();
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') {
        goTo(current - 1);
        resetProgress();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [current, goTo, resetProgress]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(current + (diff > 0 ? 1 : -1));
      resetProgress();
    }
  };

  const handleNav = (index: number) => {
    goTo(index);
    resetProgress();
  };

  return (
    <div className="about-gallery">
      <div className="section-header">
        <div className="eyebrow">Racing Legacy</div>
        <h2>
          PHOTO <span>GALLERY</span>
        </h2>
      </div>

      <div className="carousel-wrapper">
        <div className="carousel-track-container">
          <div
            className="carousel-track"
            id="carouselTrack"
            ref={trackRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {Array.from({ length: total }, (_, i) => (
              <div key={i} className={`slide${i === current ? ' active' : ''}`}>
                <img src={`/gallery/${i + 1}.jpg`} alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="counter">
          <span className="counter-current">{String(current + 1).padStart(2, '0')}</span>
          <span className="counter-sep">/</span>
          <span className="counter-total">{String(total).padStart(2, '0')}</span>
        </div>

        <button
          type="button"
          className="nav-btn nav-prev"
          aria-label="Previous"
          onClick={() => handleNav(current - 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          className="nav-btn nav-next"
          aria-label="Next"
          onClick={() => handleNav(current + 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="thumbnails" id="carouselThumbnails" ref={thumbnailsRef}>
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`thumb${i === current ? ' active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Slide ${i + 1}`}
              onClick={() => handleNav(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleNav(i);
              }}
            >
              <img src={`/gallery/${i + 1}.jpg`} alt="" />
            </div>
          ))}
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressWidth}%` }} />
        </div>

        <div className="dots" id="carouselDots">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`dot${i === current ? ' active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => handleNav(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleNav(i);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
