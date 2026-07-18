import { useCallback, useEffect, useRef } from 'react';

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

  const canSlide = children.length > slidesPerView;
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
    if (!canSlide) return;
    const total = children.length;
    const currentIndex = getCurrentIndex();

    if (currentIndex >= total) {
      // Seamlessly jump back to original range before animating next scroll
      const container = containerRef.current;
      if (container) {
        const itemW = container.offsetWidth / slidesPerView;
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = (currentIndex - total) * itemW;
        container.getBoundingClientRect(); // force reflow
        container.style.scrollBehavior = 'smooth';
      }
      scrollToIndex(currentIndex - total + 1);
    } else {
      scrollToIndex(currentIndex + 1);
    }
  }, [children.length, slidesPerView, scrollToIndex, getCurrentIndex, canSlide]);

  const goPrev = useCallback(() => {
    if (!canSlide) return;
    const total = children.length;
    const currentIndex = getCurrentIndex();

    if (currentIndex <= 0) {
      // Seamlessly jump to the end of the cloned range before animating prev scroll
      const container = containerRef.current;
      if (container) {
        const itemW = container.offsetWidth / slidesPerView;
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = total * itemW;
        container.getBoundingClientRect(); // force reflow
        container.style.scrollBehavior = 'smooth';
      }
      scrollToIndex(total - 1);
    } else {
      scrollToIndex(currentIndex - 1);
    }
  }, [children.length, slidesPerView, scrollToIndex, getCurrentIndex, canSlide]);

  useEffect(() => {
    if (autoplayInterval === 0 || !canSlide) return;

    timerRef.current = setInterval(() => {
      if (isHovered.current) return;
      goNext();
    }, autoplayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplayInterval, goNext, canSlide]);

  const displayedChildren = (canSlide ? [...children, ...children] : children).map(
    (child, idx) => ({
      id: `slider-idx-${idx}-${(child as React.ReactElement)?.key || 'item'}`,
      node: child,
    })
  );

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
          {displayedChildren.map((item) => (
            <div
              key={item.id}
              style={{
                flex: `0 0 ${itemWidth}`,
                maxWidth: itemWidth,
                scrollSnapAlign: 'start',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              {item.node}
            </div>
          ))}
        </div>

        {canSlide && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="absolute left-[-60px] top-1/2 z-10 flex h-10 w-10 -translate-x-3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#E6E2D1] bg-white opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:scale-110 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                stroke="#1F3933"
                strokeWidth={2.5}
                fill="none"
              >
                <path
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="absolute right-[-60px] top-1/2 z-10 flex h-10 w-10 translate-x-3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#E6E2D1] bg-white opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:scale-110 group-hover:opacity-100 focus-visible:opacity-100"
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
          </>
        )}
      </section>
    </section>
  );
}
