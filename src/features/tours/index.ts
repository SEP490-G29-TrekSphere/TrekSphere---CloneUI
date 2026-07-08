/**
 * Tours feature index
 * Export all public APIs from the tours feature
 */

export { default as PromoBanner } from './components/PromoBanner';
// Components
export { default as TourCard } from './components/TourCard';
export { default as TourCategoriesRow } from './components/TourCategoriesRow';
export { default as TourFilters } from './components/TourFilters';
export { default as TourPagination } from './components/TourPagination';
export type { TourSearchValues } from './components/TourSearchBar';
export { default as TourSearchBar } from './components/TourSearchBar';
export { default as ToursHero } from './components/ToursHero';

// Tour Details Components
export * from './components/tour-details';

// Data
export { tourDetails, tours } from './data/tours';

// Hooks
export { useTours } from './hooks/useTours';

// Pages
export { default as ListTours } from './pages/ListTours';
export { default as TourDetailsPage } from './pages/TourDetails';

// Services
export { tourService } from './services/tourService';

// Types
export type {
  BookingFormState,
  GalleryImage,
  LevelBadgeVariant,
  LevelClass,
  Tour,
  TourApiItem,
  TourCategory,
  TourDetail,
  TourFilter,
  TourItineraryDay,
  TourLevel,
  TourListApiResponse,
  TourListParams,
  TourReview,
  TourTabId,
  TourTabState,
  TourWithDefaults,
} from './types';
