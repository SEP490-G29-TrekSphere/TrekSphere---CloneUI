export type TourLevel = 'Dễ' | 'Trung bình' | 'Khó' | 'Khám phá';

export interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: TourLevel;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  badge?: string;
  slug: string;
  category: string;
  location: string;
  maxParticipants: number;
  highlights: string[];
  includes: string[];
  excludes?: string[];
  schedule?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

// ============================================================
// Detailed Tour Types for Tour Detail Page
// ============================================================

/**
 * Tour itinerary day - represents a single day in the tour schedule
 */
export interface TourItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals?: ('Sáng' | 'Trưa' | 'Tối')[];
  accommodation?: string;
  image?: string;
}

/**
 * Tour review from a traveler
 */
export interface TourReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  tourId: string;
  helpful: number;
}

/**
 * Discriminated union for tab navigation state
 */
export type TourTabId = 'details' | 'itinerary' | 'reviews';

export interface TourTabState {
  activeTab: TourTabId;
}

export type TourTabAction =
  | { type: 'SET_TAB'; payload: TourTabId }
  | { type: 'NEXT_TAB' }
  | { type: 'PREV_TAB' };

/**
 * Booking form state for the sticky sidebar
 */
export interface BookingFormState {
  selectedDate: Date | null;
  participants: number;
  totalPrice: number;
}

/**
 * Gallery image with metadata
 */
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  isPrimary?: boolean;
}

/**
 * Complete tour detail with all additional fields
 */
export interface TourDetail extends Omit<Tour, 'images'> {
  fullDescription: string;
  dayByDay: TourItineraryDay[];
  gallery: GalleryImage[];
  reviews: TourReview[];
  reviewSummary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
  departureDates: string[];
  tourOperator?: string;
  groupSize?: string;
  startingPoint?: string;
  endingPoint?: string;
}

// ============================================================
// Type Utilities for CSS Class Generation
// ============================================================

/**
 * Template literal type for level-based styling
 */
export type LevelClass = `${TourLevel}-level`;

/**
 * Mapped type for level badge variants
 */
export type LevelBadgeVariant = {
  [K in TourLevel]: 'default' | 'secondary' | 'outline' | 'destructive';
};

export const levelBadgeVariants: LevelBadgeVariant = {
  Dễ: 'secondary',
  'Trung bình': 'outline',
  Khó: 'destructive',
  'Khám phá': 'default',
} as const;

/**
 * Utility type for optional tour fields with defaults
 */
export type TourWithDefaults = Required<Tour>;

export interface TourCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface TourFilter {
  category?: string;
  level?: string;
  priceRange?: [number, number];
  duration?: string;
  sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
