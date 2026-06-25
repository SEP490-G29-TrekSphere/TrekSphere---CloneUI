import React, { useCallback, useEffect, useRef } from 'react';

export interface SliderProps {
  children: React.ReactNode[];
  slidesPerView: number;
  autoplayInterval?: number;
  className?: string;
}

const AUTOPLAY_DEFAULT = 3000;
const GAP = 18;

export default function Slider({
  children,
  slidesPerView,
  autoplayInterval = AUTOPLAY_DEFAULT,
  className = '',
}: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHovered = useRef(false);

  const itemWidth = `calc(${100 / slidesPerView}% - ${GAP - GAP / slidesPerView}px)`;

  const getCurrentIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;

    const itemW = container.offsetWidth / slidesPerView;
    return Math.round(container.scrollLeft / itemW);
  }, [slidesPerView]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;

      const itemW = container.offsetWidth / slidesPerView;
      container.scrollTo({
        left: index * itemW,
        behavior: 'smooth',
      });
    },
    [slidesPerView]
  );

  const goNext = useCallback(() => {
    const total = children.length;
    const currentIndex = getCurrentIndex();
    scrollToIndex((currentIndex + 1) % total);
  }, [children.length, scrollToIndex, getCurrentIndex]);

  const goPrev = useCallback(() => {
    const total = children.length;
    const currentIndex = getCurrentIndex();
    scrollToIndex((currentIndex - 1 + total) % total);
  }, [children.length, scrollToIndex, getCurrentIndex]);

  useEffect(() => {
    if (autoplayInterval === 0) return;

    timerRef.current = setInterval(() => {
      if (isHovered.current) return;

      const total = children.length;
      const currentIndex = getCurrentIndex();
      scrollToIndex((currentIndex + 1) % total);
    }, autoplayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplayInterval, children.length, scrollToIndex, getCurrentIndex]);

  const getKey = (child: React.ReactNode, index: number) => {
    if (React.isValidElement(child) && child.key != null) {
      return String(child.key);
    }
    return `fallback-${index}`;
  };

  return (
    <section className={`relative group ${className}`} aria-label="slider">
      <section
        aria-label="slider autoplay pause area"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
      >
        <div
          ref={containerRef}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            gap: `${GAP}px`,
            borderRadius: '8px',
          }}
        >
          {[...children, ...children].map((child, i) => (
            <div
              key={getKey(child, i)}
              style={{
                flex: `0 0 ${itemWidth}`,
                maxWidth: itemWidth,
                scrollSnapAlign: 'start',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              {child}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous slide"
          style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%) translateX(-12px)',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            border: '1px solid #E6E2D1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0,
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(-12px) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(-12px) scale(1)';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            stroke="#1F3933"
            strokeWidth={2.5}
            fill="none"
          >
            <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next slide"
          style={{
            position: 'absolute',
            right: '0',
            top: '50%',
            transform: 'translateY(-50%) translateX(12px)',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            border: '1px solid #E6E2D1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0,
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(12px) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(12px) scale(1)';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            stroke="#1F3933"
            strokeWidth={2.5}
            fill="none"
          >
            <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>
    </section>
  );
}
