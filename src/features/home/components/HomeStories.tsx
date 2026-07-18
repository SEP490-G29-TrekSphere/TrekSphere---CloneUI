import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { stories } from '@/features/home/data/stories';

gsap.registerPlugin(ScrollTrigger);

export default function HomeStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.1,
        });

        // Parallax scrub on inner image
        const img = card.querySelector('img');
        if (img) {
          gsap.to(img, {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-muted/30">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-eyebrow">Từ cộng đồng</span>
            <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">
              Câu chuyện hành trình
            </h2>
          </div>
          <Link
            to={PATHS.NEWS}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Xem tất cả bài viết
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

        {/* Editorial grid: first card is tall (spans 2 rows), others are normal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 [grid-auto-rows:260px]">
          {stories.map((story, idx) => (
            <article
              key={story.id}
              ref={(el) => {
                if (el) cardsRef.current[idx] = el;
              }}
              className={`story-card-v2 ${idx === 0 ? 'md:row-span-2' : 'row-span-1'}`}
            >
              <img src={story.image.replace('w=800', 'w=1200')} alt={story.title} loading="lazy" />
              <div className="story-overlay" aria-hidden="true" />
              <div className="story-content">
                <span className="text-xs text-white/70 font-semibold uppercase tracking-widest">
                  {story.category}
                </span>
                <h3
                  className={`mt-2 font-bold text-white leading-snug ${
                    idx === 0 ? 'text-2xl md:text-3xl' : 'text-lg'
                  }`}
                >
                  {story.title}
                </h3>
                <Link
                  to={PATHS.NEWS_DETAIL.replace(':blogId', story.id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-white/60 text-xs font-medium group cursor-pointer hover:text-white transition-colors"
                >
                  <span>Đọc thêm</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
