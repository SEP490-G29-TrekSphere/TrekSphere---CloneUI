import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { tours } from '../../data/tours';

interface RelatedToursProps {
  currentTourId: string;
  category?: string;
  limit?: number;
  className?: string;
}

/**
 * Shows related/similar tours based on category
 */
export function RelatedTours({ currentTourId, category, limit = 4, className }: RelatedToursProps) {
  // Filter tours by same category but exclude current tour
  const relatedTours = tours
    .filter((tour) => tour.id !== currentTourId && (!category || tour.category === category))
    .slice(0, limit);

  if (relatedTours.length === 0) {
    return null;
  }

  return (
    <section className={cn('flex flex-col gap-6', className)} aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="font-heading-section text-xl font-bold text-foreground md:text-2xl"
      >
        Tour liên quan
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {relatedTours.map((tour) => (
          <Link
            key={tour.id}
            to={`/tours/${tour.slug}`}
            className="group block"
            aria-label={`Xem tour: ${tour.name}`}
          >
            <Card className="h-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Badge overlay */}
                {tour.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute left-2 top-2 bg-secondary/90 backdrop-blur-sm"
                  >
                    {tour.badge}
                  </Badge>
                )}
                {/* Level badge */}
                <Badge
                  variant="outline"
                  className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm"
                >
                  {tour.level}
                </Badge>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <h3 className="mb-1 line-clamp-1 font-heading-section text-base font-semibold text-foreground group-hover:text-primary">
                  {tour.name}
                </h3>
                <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <svg
                    className="size-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                  </svg>
                  {tour.location}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <svg className="size-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{tour.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-right">
                    {tour.originalPrice && (
                      <span className="mr-1 text-xs text-muted-foreground line-through">
                        {tour.originalPrice}
                      </span>
                    )}
                    <span className="font-semibold text-primary">{tour.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedTours;
