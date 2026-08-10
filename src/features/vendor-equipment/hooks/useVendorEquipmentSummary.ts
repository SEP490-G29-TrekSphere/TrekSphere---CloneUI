import { useQuery } from '@tanstack/react-query';
import { vendorEquipmentService } from '../services/vendorEquipmentService';

export const vendorEquipmentSummaryKeys = {
  all: ['vendor-equipment', 'summary'] as const,
};

/** Số liệu tổng hợp cho thẻ thống kê — tính từ toàn bộ dụng cụ (không phân trang). */
export function useVendorEquipmentSummary() {
  return useQuery({
    queryKey: vendorEquipmentSummaryKeys.all,
    queryFn: async () => {
      const equipments = await vendorEquipmentService.listAllEquipments();
      return {
        totalItems: equipments.length,
        totalQuantity: equipments.reduce((sum, equipment) => sum + equipment.totalQuantity, 0),
      };
    },
    staleTime: 0,
  });
}
