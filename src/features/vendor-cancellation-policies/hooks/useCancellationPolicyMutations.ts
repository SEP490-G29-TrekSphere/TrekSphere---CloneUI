import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancellationPolicyService } from '../services/cancellationPolicyService';
import type { CancellationPolicyPayload } from '../types';
import { cancellationPolicyKeys } from './useCancellationPolicies';

/**
 * Mutation tạo/sửa/xóa chính sách hủy (chỉ Vendor Manager).
 *
 * Ngoài danh sách của vendor, còn invalidate `tourDetail` vì
 * `GET /tours/{id}` nhúng sẵn `cancellationPolicies` — nếu không làm mới,
 * màn Đặt tour sẽ hiển thị điều khoản cũ từ cache.
 */
export function useCancellationPolicyMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: cancellationPolicyKeys.all });
    queryClient.invalidateQueries({ queryKey: ['tourDetail'] });
  };

  const createPolicy = useMutation({
    mutationFn: (payload: CancellationPolicyPayload) => cancellationPolicyService.create(payload),
    onSuccess: invalidate,
  });

  const updatePolicy = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancellationPolicyPayload }) =>
      cancellationPolicyService.update(id, payload),
    onSuccess: invalidate,
  });

  const deletePolicy = useMutation({
    mutationFn: (id: string) => cancellationPolicyService.remove(id),
    onSuccess: invalidate,
  });

  return { createPolicy, updatePolicy, deletePolicy };
}
