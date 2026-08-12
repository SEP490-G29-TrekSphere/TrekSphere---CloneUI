/**
 * Các section của trang chi tiết tour.
 *
 * Trang `TourDetails` chỉ còn lo bố cục và state dùng chung (lịch đang chọn);
 * mỗi khối nội dung nằm trong một component riêng ở đây.
 */

export * from './shared';
export { TourBookingRail } from './TourBookingRail';
export { TourDetailHero } from './TourDetailHero';
export { TourDetailError, TourDetailSkeleton, TourNotFound } from './TourDetailStates';
export { TourGallerySection } from './TourGallerySection';
export { TourInclusionsSection } from './TourInclusionsSection';
export { TourMobileBookingBar } from './TourMobileBookingBar';
export { TourOverviewSection } from './TourOverviewSection';
export { TourParticipationPolicySection } from './TourParticipationPolicySection';
export { TourReviewsSection } from './TourReviewsSection';
export { TourRouteSection } from './TourRouteSection';
export { TourScheduleSection } from './TourScheduleSection';
export { TourSectionNav } from './TourSectionNav';
export { TourStatsGrid } from './TourStatsGrid';
export { TourVendorCard } from './TourVendorCard';
