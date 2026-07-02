import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TourDetail } from '../../types';

interface TourOverviewProps {
  tour: TourDetail;
  className?: string;
}

/**
 * Overview section with full description, highlights, and includes/excludes
 * Provides comprehensive information about the tour
 */
export function TourOverview({ tour, className }: TourOverviewProps) {
  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Full Description */}
      <section aria-labelledby="description-heading">
        <h2
          id="description-heading"
          className="mb-4 font-heading-section text-xl font-bold text-foreground md:text-2xl"
        >
          Giới thiệu
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          {tour.fullDescription.split('\n\n').map((paragraph) => (
            <p key={`paragraph-${paragraph.slice(0, 20)}`} className="mb-4 leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section aria-labelledby="highlights-heading">
        <h2
          id="highlights-heading"
          className="mb-4 font-heading-section text-xl font-bold text-foreground md:text-2xl"
        >
          Điểm nổi bật
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tour.highlights.map((highlight) => (
            <div
              key={`highlight-${highlight.slice(0, 20)}`}
              className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="size-3.5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm leading-snug">{highlight}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Includes & Excludes */}
      <section aria-labelledby="includes-heading" className="grid gap-6 md:grid-cols-2">
        {/* What's included */}
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10">
          <CardContent className="p-5">
            <h3
              id="includes-heading"
              className="mb-4 flex items-center gap-2 font-heading-section text-lg font-semibold text-green-800 dark:text-green-300"
            >
              <svg
                className="size-5 shrink-0 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Bao gồm
            </h3>
            <ul className="space-y-2.5">
              {tour.includes.map((item) => (
                <li key={`include-${item.slice(0, 15)}`} className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 dark:text-green-200">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* What's excluded */}
        {tour.excludes && tour.excludes.length > 0 && (
          <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10">
            <CardContent className="p-5">
              <h3
                id="excludes-heading"
                className="mb-4 flex items-center gap-2 font-heading-section text-lg font-semibold text-red-800 dark:text-red-300"
              >
                <svg
                  className="size-5 shrink-0 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Không bao gồm
              </h3>
              <ul className="space-y-2.5">
                {tour.excludes.map((item) => (
                  <li
                    key={`exclude-${item.slice(0, 15)}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <svg
                      className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-red-800 dark:text-red-200">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Tour Info Grid */}
      <section aria-labelledby="info-heading">
        <h2
          id="info-heading"
          className="mb-4 font-heading-section text-xl font-bold text-foreground md:text-2xl"
        >
          Thông tin tour
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: 'Điểm khởi hành',
              value: tour.startingPoint || 'Hà Nội',
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              ),
            },
            {
              label: 'Điểm kết thúc',
              value: tour.endingPoint || 'Hà Nội',
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              ),
            },
            {
              label: 'Nhóm',
              value: tour.groupSize || `${tour.maxParticipants} người`,
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              ),
            },
            {
              label: 'Cấp độ',
              value: tour.level,
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              ),
            },
            {
              label: 'Thời gian',
              value: tour.duration,
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
            {
              label: 'Địa điểm',
              value: tour.location,
              icon: (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </>
              ),
            },
          ].map((item) => (
            <div
              key={`info-${item.label}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="size-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {item.icon}
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TourOverview;
