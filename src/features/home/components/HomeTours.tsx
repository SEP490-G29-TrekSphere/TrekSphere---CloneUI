import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useTours } from '@/features/tours/hooks/useTours';
import { ScrollReveal, Slider } from '@/shared/ui';

export default function HomeTours() {
  const { tours, isLoading } = useTours({ page: 0, size: 6, sortBy: 'createdAt', sortDir: 'desc' });

  return (
    <section className="py-24 bg-muted/40">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="section-eyebrow">Được yêu thích nhất</span>
              <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">
                Tour nổi bật
              </h2>
              <p className="mt-3 text-base text-muted-foreground max-w-md">
                Lựa chọn những hành trình được yêu thích nhất từ hàng ngàn trekker.
              </p>
            </div>
            <Link
              to={PATHS.TOURS}
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70 text-primary shrink-0"
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
        </ScrollReveal>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {['ts-1', 'ts-2', 'ts-3'].map((skeletonId) => (
              <div key={skeletonId} className="h-[420px] rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="mt-10 text-center py-12 bg-card border border-border/50 rounded-3xl">
            <p className="text-muted-foreground text-sm">Hiện tại chưa có tour nổi bật nào.</p>
          </div>
        ) : (
          <ScrollReveal variant="fade-up" scrollOptions={{ delay: 100 }}>
            <div className="mt-10">
              <Slider slidesPerView={3} autoplayInterval={3500}>
                {tours.map((tour) => (
                  <article key={tour.id} className="tour-card">
                    <div className="tour-image-wrapper">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';
                        }}
                      />
                      {/* Gradient overlay on image */}
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#0f201c]/55"
                        aria-hidden="true"
                      />
                      {/* Rating on image */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#F59E0B">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-xs font-bold text-white">{tour.rating}</span>
                      </div>
                    </div>

                    <div className="tour-content-wrapper">
                      <h3 className="text-base font-bold leading-snug text-primary line-clamp-2">
                        {tour.name}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {tour.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                            />
                          </svg>
                          {tour.level}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-xs text-muted-foreground">Từ</p>
                          <p className="text-xl font-black text-primary">{tour.price}</p>
                        </div>
                        <Link
                          to={`${PATHS.TOURS}/${tour.id}`}
                          className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 bg-primary cursor-pointer"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </Slider>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
