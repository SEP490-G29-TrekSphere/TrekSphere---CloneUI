import { useQuery } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';

export const vendorTourCheckpointsKeys = {
  list: (tourId: string) => ['vendor-tours', 'checkpoints', tourId] as const,
};

/** Danh sách checkpoint hiện có của 1 tour — dùng để đổ vào form Sửa. */
export function useVendorTourCheckpoints(tourId: string | undefined) {
  return useQuery({
    queryKey: vendorTourCheckpointsKeys.list(tourId ?? ''),
    queryFn: () => vendorTourService.getCheckpoints(tourId as string),
    enabled: Boolean(tourId),
  });
}
