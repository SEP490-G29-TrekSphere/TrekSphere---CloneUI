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
  /** Optional cover image used by the circular category pills on the List Tours page. */
  image?: string;
}

/**
 * UI-facing filter shape owned by the List Tours page.
 *
 * Mirrors {@link TourListParams} for the fields the API supports, plus
 * category for client-side UI display (the category chips don't drive a
 * query because the backend doesn't filter on category yet — see
 * `features/tours/pages/ListTours.tsx` for the note).
 */
export interface TourFilter {
  /** Free-text keyword sent as the `keyword` query param. */
  keyword?: string;
  /** Destination/location sent as the `location` query param. */
  location?: string;
  /** Difficulty enum sent as the `difficulty` query param. */
  difficulty?: ApiDifficulty;
  /**
   * Map-friendly UI sort key. Each value translates to a (sortBy, sortDir)
   * pair sent to the API.
   */
  sortBy?:
    | 'price-asc'
    | 'price-desc'
    | 'rating'
    | 'newest'
    | 'duration-asc'
    | 'duration-desc'
    | 'name-asc';
}

// ============================================================
// API Types for List Tours
// ============================================================

/**
 * Difficulty levels from the API
 */
export type ApiDifficulty = 'HARD' | 'MODERATE' | 'EXPERT' | 'EASY' | 'BEGINNER';

/**
 * Status values from the API
 */
export type ApiStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

/**
 * Allowed sort directions from the API
 */
export type ApiSortDir = 'asc' | 'desc';

/**
 * Allowed sort fields. The API defaults to `createdAt`; other useful
 * fields exposed in the schema (averageRating, basePrice, etc.) are
 * surfaced as UI options below.
 */
export type ApiSortField =
  | 'createdAt'
  | 'averageRating'
  | 'basePrice'
  | 'durationDays'
  | 'tourName';

/**
 * Query params for fetching tours list.
 *
 * Source of truth: Swagger screenshots for `/api/v1/tours`. The backend
 * currently accepts:
 *   - keyword       (string, free-text search)
 *   - location      (string, exact-match location filter)
 *   - difficulty    (string, one of ApiDifficulty)
 *   - page          (integer, default 0)
 *   - size          (integer, default 10)
 *   - sortBy        (string, default 'createdAt')
 *   - sortDir       (string, default 'desc')
 *
 * Future server-side filters (price min/max, duration range, rating,
 * date range, category, status) are intentionally NOT typed here so
 * the FE never sends params the BE ignores. Add them once the BE
 * supports them.
 */
export interface TourListParams {
  keyword?: string;
  location?: string;
  difficulty?: ApiDifficulty;
  page?: number;
  size?: number;
  sortBy?: ApiSortField;
  sortDir?: ApiSortDir;
}

/**
 * Individual tour item from API response
 */
export interface TourApiItem {
  tourId: string;
  tourName: string;
  location: string;
  durationDays: number;
  basePrice: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  coverImageUrl: string;
  vendorId: string;
  vendorName: string;
  averageRating: number | null;
  totalReviews: number;
  createdAt: string;
  category?: string;
}

/**
 * Paginated response from tours API
 */
export interface TourListApiResponse {
  content: TourApiItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
