import { useQuery } from '@tanstack/react-query';
import { vendorPorterService } from '@/features/vendor-porters/services/vendorPorterService';

/** Danh sách porter đang active cho dialog "Thêm Porter" — tái dùng service đã có sẵn. */
export function usePorterCandidates() {
  return useQuery({
    queryKey: ['vendor-sessions', 'porter-candidates'],
    queryFn: async () => {
      const porters = await vendorPorterService.listAllPorters();
      return porters.filter((porter) => porter.status === 'ACTIVE');
    },
    staleTime: 60_000,
  });
}
