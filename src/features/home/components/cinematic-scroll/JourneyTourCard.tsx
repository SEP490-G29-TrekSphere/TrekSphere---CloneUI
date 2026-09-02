import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { Tour } from '@/features/tours/types';
import { TOUR_IMAGE_FALLBACK } from '../../constants/cinematic-scroll';

interface JourneyTourCardProps {
  tour: Tour;
}

/** 1 thẻ tour trong Scene 4 — tách khỏi TourScene để mỗi file chỉ làm một việc. */
export function JourneyTourCard({ tour }: JourneyTourCardProps) {
  return (
    <article className="journey-tour-card">
      <div className="journey-tour-img-wrap">
        <img
          src={tour.image || TOUR_IMAGE_FALLBACK}
          alt={tour.name}
          loading="lazy"
          className="journey-tour-img"
          onError={(e) => {
            e.currentTarget.src = TOUR_IMAGE_FALLBACK;
          }}
        />
        <div className="journey-tour-img-overlay" aria-hidden="true" />
        {tour.reviewCount > 0 ? (
          <div className="journey-tour-rating">
            <svg
              className="journey-tour-star"
              viewBox="0 0 24 24"
              fill="var(--c-star)"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>{tour.rating.toFixed(1)}</span>
            <span className="journey-tour-review-count">({tour.reviewCount})</span>
          </div>
        ) : (
          <div className="journey-tour-rating">
            <span>Mới</span>
          </div>
        )}
      </div>
      <div className="journey-tour-body">
        <h3 className="journey-tour-name">
          <Link to={`${PATHS.TOURS}/${tour.id}`}>{tour.name}</Link>
        </h3>
        <div className="journey-tour-meta">
          <span>{tour.duration}</span>
          <span className="journey-tour-dot" aria-hidden="true">
            ·
          </span>
          <span>{tour.level}</span>
        </div>
        <div className="journey-tour-footer">
          <div>
            <p className="journey-tour-from">Từ</p>
            <p className="journey-tour-price">{tour.price}</p>
          </div>
          <Link to={`${PATHS.TOURS}/${tour.id}`} className="journey-tour-cta">
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
