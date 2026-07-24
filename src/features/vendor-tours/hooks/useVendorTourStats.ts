import { useQuery } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';

export const vendorTourStatsKeys = {
  all: ['vendor-tours', 'stats'] as const,
};

/**
 * `GET /vendor/tours` không hỗ trợ lọc `status` phía server (đã xác nhận qua
 * OpenAPI spec — params chỉ có keyword/page/size/sortBy/sortDir), nên không thể
 * gọi 3 lần với `status` khác nhau và đọc `total`. Thay vào đó tải 1 mẻ đủ lớn
 * rồi đếm theo `status` phía client — chấp nhận có thể thiếu chính xác nếu
 * vendor có nhiều hơn `SAMPLE_SIZE` tour.
 */
const SAMPLE_SIZE = 200;

/** 3 số liệu cho thẻ thống kê (tổng số / đang chờ duyệt / đã duyệt). */
export function useVendorTourStats() {
  return useQuery({
    queryKey: vendorTourStatsKeys.all,
    queryFn: async () => {
      const { tours, total } = await vendorTourService.listMyTours({}, 1, SAMPLE_SIZE);
      return {
        total,
        pendingApproval: tours.filter((tour) => tour.status === 'PENDING_APPROVAL').length,
        approved: tours.filter((tour) => tour.status === 'APPROVED').length,
      };
    },
    staleTime: 60_000,
  });
}
