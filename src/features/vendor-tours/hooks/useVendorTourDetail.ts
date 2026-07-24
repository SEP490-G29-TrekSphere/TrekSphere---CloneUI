import { useQuery } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';

export const vendorTourDetailKeys = {
  detail: (tourId: string) => ['vendor-tours', 'detail', tourId] as const,
};

/** Chi tiết đầy đủ 1 tour — dùng để đổ vào form Sửa. */
export function useVendorTourDetail(tourId: string | undefined) {
  return useQuery({
    queryKey: vendorTourDetailKeys.detail(tourId ?? ''),
    queryFn: () => vendorTourService.getTourDetail(tourId as string),
    enabled: Boolean(tourId),
  });
}
