import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';

interface PromoBannerProps {
  className?: string;
}

/**
 * PromoBanner — light gradient banner that appears between the search bar and the
 * categories row on the List Tours page. Highlights the discount/seasonal promo.
 */
export default function PromoBanner({ className = '' }: PromoBannerProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#eaf4ff] via-[#dbeefe] to-[#c8e3fb] px-6 py-5 sm:px-10 sm:py-7 ${className}`}
    >
      {/* Decorative bubbles */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-1/3 h-32 w-32 rounded-full bg-sky-200/40 blur-2xl" />

      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 sm:text-sm">
            Ưu đãi mùa hè 2025
          </p>
          <h3 className="mt-1 text-base font-bold text-primary sm:text-xl">
            Khám phá những điểm đến tuyệt vời với{' '}
            <span className="text-sky-600">khuyến mãi đặc biệt lên đến 30%</span> cho mọi tour
          </h3>
        </div>

        <Link
          to={PATHS.TOURS}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md sm:text-sm"
        >
          Xem ngay
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
