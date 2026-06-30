import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppButton, ScrollReveal, Slider } from '@/shared/ui';
import { featuredTours } from '../data/tours';

export default function HomeTours() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Tour nổi bật</h2>
              <p className="mt-2 text-base text-muted-foreground">
                Lựa chọn những hành trình được yêu thích nhất.
              </p>
            </div>
            <Link
              to={PATHS.TOURS}
              className="inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70 text-primary"
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

        <ScrollReveal variant="fade-up" scrollOptions={{ delay: 100 }}>
          <div className="mt-10">
            <Slider slidesPerView={3} autoplayInterval={3000}>
              {featuredTours.map((tour) => (
                <article key={tour.id} className="tour-card">
                  <div className="tour-image-wrapper">
                    <img src={tour.image} alt={tour.name} />
                    {tour.badge && (
                      <span className="absolute px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-primary top-3 left-3">
                        {tour.badge}
                      </span>
                    )}
                  </div>

                  <div className="tour-content-wrapper">
                    <h3 className="text-lg font-bold leading-snug text-primary">{tour.name}</h3>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#F59E0B">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-primary">{tour.rating}</span>
                    </div>

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

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">{tour.price}</span>
                      <AppButton
                        type="button"
                        className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 bg-primary"
                      >
                        Chi tiết
                      </AppButton>
                    </div>
                  </div>
                </article>
              ))}
            </Slider>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
