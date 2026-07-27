import { useQuery } from '@tanstack/react-query';
import { vendorEquipmentService } from '../services/vendorEquipmentService';
import type { VendorEquipmentFilter } from '../types';

export const vendorEquipmentKeys = {
  all: ['vendor-equipment'] as const,
  list: (filter: VendorEquipmentFilter, page: number, pageSize: number) =>
    ['vendor-equipment', 'list', filter, page, pageSize] as const,
};

/** Danh sách dụng cụ trong kho (bảng chính) — phân trang theo filter/page hiện tại. */
export function useVendorEquipmentList(
  filter: VendorEquipmentFilter,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: vendorEquipmentKeys.list(filter, page, pageSize),
    queryFn: () => vendorEquipmentService.listEquipments(filter, page, pageSize),
  });
}
