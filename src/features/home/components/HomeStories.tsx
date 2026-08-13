import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useBlogList } from '@/features/news/hooks/useBlog';
import { stripHtml } from '@/utils/sanitize';

gsap.registerPlugin(ScrollTrigger);

export default function HomeStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);

  const { data, isLoading } = useBlogList({
    page: 1,
    size: 3,
    sortBy: 'viewCount',
    sortDir: 'desc',
  });

  const stories = data?.items ?? [];

  useEffect(() => {
    if (isLoading || stories.length === 0) return;

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
  }, [isLoading, stories]);

  return (
    <section ref={sectionRef} className="py-24 bg-muted/30">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
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

        {/* Editorial grid: styled like Tour card */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['sb-1', 'sb-2', 'sb-3'].map((skeletonId) => (
              <div
                key={skeletonId}
                className="h-[420px] rounded-[20px] bg-muted animate-pulse border border-border/50"
              />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border/50 rounded-3xl">
            <p className="text-muted-foreground text-sm">
              Hiện chưa có câu chuyện nào được chia sẻ.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, idx) => (
              <article
                key={story.blogId}
                ref={(el) => {
                  if (el) cardsRef.current[idx] = el;
                }}
                className="tour-card flex flex-col"
              >
                <div className="tour-image-wrapper h-[240px] relative overflow-hidden">
                  <img
                    src={
                      story.coverImageUrl
                        ? story.coverImageUrl.replace('w=800', 'w=1200')
                        : 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=1200&q=80'
                    }
                    alt={story.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-106"
                  />

                  {/* Views count */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-xs font-bold">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    <span>{story.viewCount}</span>
                  </div>
                </div>

                <div className="tour-content-wrapper flex flex-col p-5 gap-3 flex-1">
                  {/* Author meta */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {story.authorAvatarUrl ? (
                      <img
                        src={story.authorAvatarUrl}
                        alt={story.authorName}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {story.authorName?.[0] || 'U'}
                      </div>
                    )}
                    <span className="font-semibold text-primary/80">{story.authorName}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold leading-snug text-primary line-clamp-2 hover:text-primary/80 transition-colors">
                    <Link to={PATHS.NEWS_DETAIL.replace(':blogId', story.blogId)}>
                      {story.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                    {stripHtml(story.excerpt)}
                  </p>

                  <Link
                    to={PATHS.NEWS_DETAIL.replace(':blogId', story.blogId)}
                    className="w-fit px-5 py-2 rounded-full text-xs font-semibold text-white bg-primary hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Đọc thêm
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
