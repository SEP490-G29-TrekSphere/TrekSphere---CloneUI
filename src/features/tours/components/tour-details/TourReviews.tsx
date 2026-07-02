import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TourReview } from '../../types';

type TourReviewSummary = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
};

interface TourReviewsProps {
  reviews: TourReview[];
  reviewSummary: TourReviewSummary;
  className?: string;
}

/**
 * Reviews section with rating summary and individual review cards
 */
export function TourReviews({ reviews, reviewSummary, className }: TourReviewsProps) {
  const maxCount = Math.max(...Object.values(reviewSummary.ratingDistribution), 1);

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Review Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overall rating */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 text-5xl font-bold text-foreground">
                {reviewSummary.averageRating.toFixed(1)}
              </div>
              <div className="mb-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={`overall-star-${reviewSummary.averageRating}`}
                    className={cn(
                      'size-5',
                      i < Math.floor(reviewSummary.averageRating)
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {reviewSummary.totalReviews.toLocaleString('vi-VN')} đánh giá
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rating breakdown */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-6">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewSummary.ratingDistribution[rating] || 0;
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      {rating}
                      <svg
                        className="size-3.5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="min-w-12 text-right text-sm text-muted-foreground">
                      {count.toLocaleString('vi-VN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="font-heading-section text-lg font-semibold text-foreground">
          Đánh giá từ khách hàng
        </h3>

        {reviews.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <svg
                className="mx-auto mb-3 size-12 text-muted-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-muted-foreground">Chưa có đánh giá nào</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
                        {review.author.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-foreground">{review.author}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={`review-star-${review.id}-${review.rating}`}
                            className={cn(
                              'size-4',
                              i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    {/* Review title */}
                    {review.title && (
                      <h5 className="mb-2 font-medium text-foreground">{review.title}</h5>
                    )}

                    {/* Review content */}
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {review.content}
                    </p>

                    {/* Helpful button */}
                    {review.helpful > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <svg
                            className="size-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          </svg>
                          Hữu ích ({review.helpful})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Write review CTA */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Viết đánh giá
        </button>
      </div>
    </div>
  );
}

export default TourReviews;
