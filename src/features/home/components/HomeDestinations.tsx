import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { popularDestinations } from '@/features/home/data/destinations';
import { useTourLocations } from '@/features/tours/hooks/useTourLocations';

gsap.registerPlugin(ScrollTrigger);

// Grid layout: items 0,2,4 are tall (span 2 rows), items 1,3,5 are short (span 1 row)
const GRID_SPANS: Record<number, string> = {
  0: 'row-span-2', // col 1, tall
  1: 'row-span-1', // col 2, short
  2: 'row-span-1', // col 2, short
  3: 'row-span-2', // col 3, tall
  4: 'row-span-1', // col 1 bottom, short
  5: 'row-span-1', // col 3 bottom, short
};

// Fallback high-quality landscapes
const LANDSCAPE_FALLBACKS = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
  'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=800&q=80',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
  'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800&q=80',
];

export default function HomeDestinations() {
  const sectionRef = useRef<HTMLElement>(null);
  const tilesRef = useRef<HTMLDivElement[]>([]);
  const { locations, isLoading } = useTourLocations();

  // Dynamic mapping of locations to cards with Unsplash image maps
  const displayedDestinations = locations.slice(0, 6).map((locName, i) => {
    const matched = popularDestinations.find(
      (d) =>
        d.name.toLowerCase().includes(locName.toLowerCase()) ||
        locName.toLowerCase().includes(d.name.toLowerCase())
    );
    return {
      id: `${locName}-${i}`,
      name: locName,
      image:
        matched?.image.replace('w=400', 'w=800') ??
        LANDSCAPE_FALLBACKS[i % LANDSCAPE_FALLBACKS.length],
      slug: matched?.slug ?? locName.toLowerCase().replace(/\s+/g, '-'),
    };
  });

  useEffect(() => {
    if (isLoading || displayedDestinations.length === 0) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      tilesRef.current.forEach((tile, i) => {
        if (!tile) return;
        gsap.from(tile, {
          opacity: 0,
          y: 40,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: tile,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.07,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading, displayedDestinations.length]);

  return (
    <section ref={sectionRef} className="py-24 bg-background">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-eyebrow">Khám phá</span>
            <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">
              Địa điểm phổ biến
            </h2>
          </div>
          <Link
            to={PATHS.TOURS}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Xem tất cả
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>

        {/* Masonry grid — 3 cols on desktop, 2 on tablet, 1 on mobile */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [grid-auto-rows:220px]">
            {['ds-1', 'ds-2', 'ds-3', 'ds-4', 'ds-5', 'ds-6'].map((skeletonId, i) => (
              <div
                key={skeletonId}
                className={`${GRID_SPANS[i] ?? 'row-span-1'} rounded-3xl bg-muted animate-pulse`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [grid-auto-rows:220px]">
            {displayedDestinations.map((d, i) => (
              <div
                key={d.id}
                ref={(el) => {
                  if (el) tilesRef.current[i] = el;
                }}
                className={`${GRID_SPANS[i] ?? 'row-span-1'} destination-tile`}
              >
                <img src={d.image} alt={d.name} loading="lazy" />
                <div className="destination-tile-overlay" aria-hidden="true" />
                <p className="destination-tile-label">{d.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
