import { travelerReviews } from '@/features/home/data/reviews';
import { ScrollReveal } from '@/shared/ui';

export default function HomeTestimonials() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-eyebrow">Đánh giá thực tế</span>
          <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight mt-1">
            Chia sẻ từ Trekker
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto">
            Hành trình và trải nghiệm chân thực của những người đã đồng hành cùng TrekSphere.
          </p>
        </div>

        {/* Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 max-w-6xl mx-auto pb-6">
          {travelerReviews.map((review, idx) => {
            // Apply slight vertical offset to the middle card on desktop
            const offsetClass = idx === 1 ? 'md:translate-y-6' : '';
            return (
              <ScrollReveal
                key={review.id}
                variant="fade-up"
                scrollOptions={{ delay: idx * 100 }}
                className={`flex ${offsetClass}`}
              >
                <div className="flex flex-col justify-between p-8 rounded-2xl bg-muted/40 border border-border/60 shadow-sm relative group hover:shadow-md transition-shadow w-full">
                  {/* Decorative Quote Mark */}
                  <span
                    className="absolute top-4 right-6 text-7xl font-serif text-primary/5 select-none leading-none pointer-events-none"
                    aria-hidden="true"
                  >
                    “
                  </span>

                  <div>
                    {/* Stars */}
                    <div
                      className="flex items-center gap-0.5 mb-4"
                      role="img"
                      aria-label={`${review.rating} trên 5 sao`}
                    >
                      {[1, 2, 3, 4, 5].slice(0, review.rating).map((starVal) => (
                        <svg
                          key={`${review.id}-star-${starVal}`}
                          className="w-4 h-4 text-amber-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote text */}
                    <p className="text-sm font-medium leading-relaxed text-foreground italic mb-6">
                      "{review.quote}"
                    </p>
                  </div>

                  {/* Profile block */}
                  <div className="flex items-center gap-3.5 mt-auto pt-4 border-t border-border/50">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover border border-border/80"
                    />
                    <div>
                      <p className="text-sm font-bold text-primary">{review.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {review.location} &bull;{' '}
                        <span className="font-medium">{review.tourName}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
