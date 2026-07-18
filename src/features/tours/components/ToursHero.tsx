interface ToursHeroProps {
  className?: string;
}

/**
 * Hero section for the List Tours page.
 * Renders the "Khám phá / Du lịch" treatment with a mint/green gradient background.
 *
 * The hero sits inside the PublicLayout (fixed 64px header) and starts with a top
 * padding that leaves room for it.
 */
export default function ToursHero({ className = '' }: ToursHeroProps) {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-[#a8e6d0] via-[#c9efdc] to-[#e3f7eb] pt-10 pb-28 sm:pt-14 sm:pb-32 ${className}`}
    >
      {/* Decorative blurred blob */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-none w-full px-4 sm:px-6">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Khám phá
        </span>

        <div className="mt-4 flex flex-col gap-4 sm:gap-6">
          <h1 className="text-4xl font-bold leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
            Du lịch
            <span className="block text-2xl font-semibold text-primary/80 sm:text-3xl lg:text-4xl">
              đến những vùng đất mới
            </span>
          </h1>

          <p className="max-w-xl text-sm text-primary/70 sm:text-base">
            Trải nghiệm những chuyến đi đáng nhớ với các tour được thiết kế riêng cho bạn — khám phá
            văn hóa, thiên nhiên và con người khắp mọi miền đất nước.
          </p>
        </div>
      </div>
    </section>
  );
}
