import { useQuery } from '@tanstack/react-query';
import { sosService } from '../services/sosService';

export const sosAlertKeys = {
  all: ['sos-alerts'] as const,
  active: (page: number, size: number) => ['sos-alerts', 'active', page, size] as const,
};

/**
 * Danh sách SOS đang chờ xử lý — dành cho Vendor Manager và Admin.
 * Tự động refetch mỗi 20s để khớp với tính chất "giám sát trực tiếp" của màn hình.
 */
export function useActiveSosAlerts(page: number, size: number) {
  return useQuery({
    queryKey: sosAlertKeys.active(page, size),
    queryFn: () => sosService.getActiveAlerts(page, size),
    refetchInterval: 20000,
  });
}
