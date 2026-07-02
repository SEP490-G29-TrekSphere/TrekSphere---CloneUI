/**
 * Tours feature index
 * Export all public APIs from the tours feature
 */

// Components
export { default as TourCard } from './components/TourCard';
export { default as TourFilters } from './components/TourFilters';
export { default as ToursHeader } from './components/ToursHeader';

// Tour Details Components
export * from './components/tour-details';

// Data
export { popularFilters, tourCategories, tourDetails, tours } from './data/tours';

// Pages
export { default as ListTours } from './pages/ListTours';
export { default as TourDetailsPage } from './pages/TourDetails';

// Types
export type {
  BookingFormState,
  GalleryImage,
  LevelBadgeVariant,
  LevelClass,
  Tour,
  TourCategory,
  TourDetail,
  TourFilter,
  TourItineraryDay,
  TourLevel,
  TourReview,
  TourTabId,
  TourTabState,
  TourWithDefaults,
} from './types';
