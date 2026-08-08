import { useQuery } from '@tanstack/react-query';
import { cancellationPolicyService } from '../services/cancellationPolicyService';

export const cancellationPolicyKeys = {
  all: ['vendor-cancellation-policies'] as const,
};

/** Danh sách chính sách hủy của vendor hiện tại (Manager & Staff đều xem được). */
export function useCancellationPolicies() {
  return useQuery({
    queryKey: cancellationPolicyKeys.all,
    queryFn: () => cancellationPolicyService.list(),
    staleTime: 60_000,
  });
}
