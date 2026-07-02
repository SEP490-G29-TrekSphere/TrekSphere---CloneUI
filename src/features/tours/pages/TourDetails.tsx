import { ChevronLeft } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RelatedTours } from '../components/tour-details/RelatedTours';
import { TourBookingCard } from '../components/tour-details/TourBookingCard';
import { TourGallery } from '../components/tour-details/TourGallery';
// Components
import { TourHero } from '../components/tour-details/TourHero';
import { TourInfoCard } from '../components/tour-details/TourInfoCard';
import { TourItinerary } from '../components/tour-details/TourItinerary';
import { TourOverview } from '../components/tour-details/TourOverview';
import { TourReviews } from '../components/tour-details/TourReviews';
import { TourTabs } from '../components/tour-details/TourTabs';
// Data
import { tourDetails, tours } from '../data/tours';

// Types
import type { TourDetail, TourTabId } from '../types';

/**
 * Tour Details Page
 * Main page component that displays comprehensive tour information
 */
export default function TourDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<TourTabId>('details');

  // Find tour by slug
  const tour = useMemo<TourDetail | undefined>(() => {
    // First check detailed tour data
    if (slug && tourDetails[slug]) {
      return tourDetails[slug];
    }
    // Fallback to basic tour data
    const basicTour = tours.find((t) => t.slug === slug);
    if (basicTour) {
      return {
        ...basicTour,
        fullDescription: basicTour.description,
        dayByDay: [],
        gallery: [],
        reviews: [],
        reviewSummary: {
          averageRating: basicTour.rating,
          totalReviews: basicTour.reviewCount,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
        departureDates: [],
      };
    }
    return undefined;
  }, [slug]);

  const handleTabChange = useCallback((tab: TourTabId) => {
    setActiveTab(tab);
    // Scroll to tab content
    const element = document.getElementById(`panel-${tab}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Loading state
  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <svg
            className="mb-4 size-16 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="mb-2 font-heading-section text-2xl font-bold text-foreground">
            Không tìm thấy tour
          </h1>
          <p className="mb-6 text-muted-foreground">
            Tour bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ChevronLeft className="size-4" />
            Quay lại danh sách tour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Điều hướng">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              to="/tours"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Tours
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{tour.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <TourHero tour={tour} className="mb-8" />

        {/* Two Column Layout: Content + Sidebar */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content Column */}
          <div className="flex flex-col gap-8">
            {/* Info Card */}
            <TourInfoCard tour={tour} />

            {/* Tab Navigation */}
            <TourTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              reviewCount={tour.reviewCount}
            />

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div id="panel-details" role="tabpanel" aria-labelledby="tab-details">
                  <TourOverview tour={tour} />
                </div>
              )}

              {/* Itinerary Tab */}
              {activeTab === 'itinerary' && (
                <div id="panel-itinerary" role="tabpanel" aria-labelledby="tab-itinerary">
                  {tour.dayByDay && tour.dayByDay.length > 0 ? (
                    <div className="py-6">
                      <div className="mb-6">
                        <h2 className="mb-2 font-heading-section text-xl font-bold text-foreground md:text-2xl">
                          Lịch trình chi tiết
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {tour.dayByDay.length} ngày {tour.dayByDay.length > 1 ? 'đêm' : ''}{' '}
                          {tour.dayByDay.length > 1 ? '' : 'tại'} {tour.location}
                        </p>
                      </div>
                      <TourItinerary days={tour.dayByDay} />
                    </div>
                  ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-card py-12">
                      <svg
                        className="mb-4 size-12 text-muted-foreground/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-muted-foreground">Lịch trình đang được cập nhật</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews">
                  <div className="py-6">
                    <TourReviews reviews={tour.reviews} reviewSummary={tour.reviewSummary} />
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Section - Outside tabs for better UX */}
            {tour.gallery && tour.gallery.length > 0 && <TourGallery images={tour.gallery} />}
          </div>

          {/* Sticky Sidebar Column */}
          <div className="hidden lg:block">
            <TourBookingCard tour={tour} />
          </div>
        </div>

        {/* Related Tours */}
        <div className="mt-16">
          <RelatedTours currentTourId={tour.id} category={tour.category} limit={4} />
        </div>
      </main>

      {/* Mobile Booking Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="text-xl font-bold text-primary">{tour.price}</span>
            <span className="text-sm text-muted-foreground">/ người</span>
          </div>
          <button
            type="button"
            onClick={() => {
              // Scroll to booking card
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Đặt ngay
          </button>
        </div>
      </div>

      {/* Spacer for mobile booking bar */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
