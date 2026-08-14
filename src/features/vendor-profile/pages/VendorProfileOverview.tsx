import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import { useVendorBookingStats } from '@/features/vendor-bookings/hooks/useVendorBookingStats';
import { VendorCancellationPolicyCard } from '@/features/vendor-cancellation-policies';
import { useVendorTourStats } from '@/features/vendor-tours/hooks/useVendorTourStats';
import { useAppStore } from '@/store/useAppStore';
import { VendorContactCard } from '../components/VendorContactCard';
import { VendorLegalCard } from '../components/VendorLegalCard';
import { VendorProfileHeroCard } from '../components/VendorProfileHeroCard';
import { VendorProfileKpiCards } from '../components/VendorProfileKpiCards';
import { useVendorProfile } from '../hooks/useVendorProfile';

/**
 * Trang Tổng quan Hồ sơ Vendor — dùng chung Vendor Manager & Vendor Staff.
 * Chỉ Manager thấy nút "Chỉnh sửa hồ sơ" (Staff chỉ xem).
 */
export default function VendorProfileOverview() {
  const user = useAppStore((state) => state.user);
  const isManager = getPrimaryRole(user?.roles) === ROLES.VENDOR_MANAGER;

  const { data: profile, isLoading, isError, error } = useVendorProfile();
  const { data: tourStats } = useVendorTourStats();
  const { data: bookingStats } = useVendorBookingStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: '#6F7B75' }}>
        Đang tải hồ sơ nhà cung cấp...
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: '#DC2626' }}>
        Không thể tải hồ sơ nhà cung cấp:{' '}
        {error instanceof Error ? error.message : 'Lỗi không xác định'}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <VendorProfileHeroCard
        profile={profile}
        isManager={isManager}
        editPath={PATHS.VENDOR_MANAGER_PROFILE_EDIT}
      />

      {/* KPI */}
      <VendorProfileKpiCards
        totalTours={tourStats?.total}
        totalBookings={bookingStats?.totalBookings}
      />

      {/* Bento chi tiết */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <VendorLegalCard profile={profile} />
        <VendorContactCard profile={profile} />
      </div>

      {/* Chính sách hủy tour — full width vì có danh sách điều khoản + thao tác CRUD */}
      <VendorCancellationPolicyCard canManage={isManager} />
    </div>
  );
}
