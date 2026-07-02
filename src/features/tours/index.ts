/**
 * Tours feature index
 * Export all public APIs from the tours feature
 */

// Components
export { default as TourCard } from './components/TourCard';
export { default as TourFilters } from './components/TourFilters';
export { default as ToursHeader } from './components/ToursHeader';

// Data
export { popularFilters, tourCategories, tours } from './data/tours';

// Pages
export { default as ListTours } from './pages/ListTours';

// Types
export type { Tour, TourCategory, TourFilter } from './types';
