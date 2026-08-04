import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '../services/sosService';
import { sosAlertKeys } from './useActiveSosAlerts';

/** Đánh dấu 1 SOS đã được tiếp nhận/cứu hộ xong — invalidate lại danh sách active. */
export function useResolveSosAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sosId: string) => sosService.resolveAlert(sosId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sosAlertKeys.all });
    },
  });
}
