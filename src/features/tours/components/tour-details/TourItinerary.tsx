import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { TourItineraryDay } from '../../types';

interface TourItineraryProps {
  days: TourItineraryDay[];
  className?: string;
}

/**
 * Expandable day-by-day itinerary with activity timeline
 * Each day can be expanded to show full details
 */
export function TourItinerary({ days, className }: TourItineraryProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(() => new Set([1]));

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const formatMeals = (meals?: ('Sáng' | 'Trưa' | 'Tối')[]) => {
    if (!meals || meals.length === 0) return null;
    return meals.map((meal) => meal[0]).join(' · ');
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {days.map((day) => {
        const isExpanded = expandedDays.has(day.day);

        return (
          <div
            key={day.day}
            className={cn(
              'overflow-hidden rounded-xl border border-border bg-card transition-all',
              isExpanded && 'shadow-md'
            )}
          >
            {/* Day Header - Always visible */}
            <button
              type="button"
              onClick={() => toggleDay(day.day)}
              className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={isExpanded}
              aria-controls={`day-content-${day.day}`}
            >
              {/* Day number circle */}
              <div
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-full font-heading-section text-lg font-bold transition-colors',
                  isExpanded
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {day.day}
              </div>

              {/* Day info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading-section text-base font-semibold text-foreground md:text-lg">
                  {day.title}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                  {day.description}
                </p>
              </div>

              {/* Expand/collapse icon */}
              <div className="shrink-0">
                <svg
                  className={cn(
                    'size-5 text-muted-foreground transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {/* Expandable content */}
            <section
              id={`day-content-${day.day}`}
              aria-labelledby={`day-header-${day.day}`}
              className={cn(
                'grid transition-all duration-300',
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border p-4 md:p-6">
                  {/* Description */}
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {day.description}
                  </p>

                  {/* Activities timeline */}
                  <div className="mb-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Hoạt động:</h4>
                    <ul className="space-y-2">
                      {day.activities.map((activity) => (
                        <li
                          key={`activity-${activity.slice(0, 20)}`}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="text-foreground/90">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Meals and accommodation */}
                  <div className="flex flex-wrap gap-4">
                    {day.meals && day.meals.length > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                        <svg
                          className="size-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span className="text-xs font-medium text-foreground">
                          Bữa ăn: {formatMeals(day.meals)}
                        </span>
                      </div>
                    )}

                    {day.accommodation && (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                        <svg
                          className="size-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span className="text-xs font-medium text-foreground">
                          {day.accommodation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      })}

      {/* Summary */}
      <div className="mt-6 rounded-xl bg-muted/50 p-4">
        <h4 className="mb-3 font-heading-section text-sm font-semibold text-foreground">
          Tổng quan lịch trình
        </h4>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {days.length} ngày {days.length > 1 ? 'đêm' : ''}
          </span>
          {days.some((d) => d.meals && d.meals.length > 0) && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {Math.max(...days.map((d) => d.meals?.length || 0)) > 0 ? 'Bữa ăn bao gồm' : ''}
            </span>
          )}
          {days.some((d) => d.accommodation) && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Có nghỉ ngơi
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TourItinerary;
