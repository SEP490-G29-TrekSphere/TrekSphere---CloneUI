import { useMemo, useState } from 'react';
import { TourCard, TourFilters, ToursHeader } from '@/features/tours';
import { tours } from '@/features/tours/data/tours';
import type { TourFilter } from '@/features/tours/types';
import { AppButton } from '@/shared/ui';

type ViewMode = 'list' | 'grid';

export default function ListTours() {
  const [filters, setFilters] = useState<TourFilter>({
    sortBy: 'popular',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filteredTours = useMemo(() => {
    let result = [...tours];

    if (filters.category) {
      result = result.filter((tour) => tour.category === filters.category);
    }

    if (filters.level) {
      result = result.filter((tour) => tour.level === filters.level);
    }

    if (filters.priceRange) {
      result = result.filter((tour) => {
        const price = parseInt(tour.price.replace(/\D/g, ''), 10);
        return price >= filters.priceRange![0] && price <= filters.priceRange![1];
      });
    }

    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/\D/g, ''), 10);
          const priceB = parseInt(b.price.replace(/\D/g, ''), 10);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/\D/g, ''), 10);
          const priceB = parseInt(b.price.replace(/\D/g, ''), 10);
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result = result.filter((tour) => tour.isNew).concat(result.filter((tour) => !tour.isNew));
        break;
      default:
        result = result
          .filter((tour) => tour.isPopular)
          .concat(result.filter((tour) => !tour.isPopular));
        break;
    }

    return result;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <ToursHeader />

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <TourFilters
          filters={filters}
          onFilterChange={setFilters}
          totalResults={filteredTours.length}
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppButton
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9 rounded-full"
              aria-label="List view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </AppButton>
            <AppButton
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9 rounded-full"
              aria-label="Grid view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </AppButton>
          </div>
        </div>

        {filteredTours.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-primary">Không tìm thấy tour</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Không có tour nào phù hợp với bộ lọc của bạn. Thử thay đổi các tiêu chí tìm kiếm.
            </p>
            <AppButton onClick={() => setFilters({ sortBy: 'popular' })}>Xóa bộ lọc</AppButton>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} variant="list" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
