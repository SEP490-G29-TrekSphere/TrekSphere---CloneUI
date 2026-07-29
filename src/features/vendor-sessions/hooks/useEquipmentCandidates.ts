import { useQuery } from '@tanstack/react-query';
import { vendorEquipmentService } from '@/features/vendor-equipment/services/vendorEquipmentService';

/** Danh sách thiết bị trong kho cho dialog "Cấp thiết bị" — tái dùng service đã có sẵn. */
export function useEquipmentCandidates() {
  return useQuery({
    queryKey: ['vendor-sessions', 'equipment-candidates'],
    queryFn: () => vendorEquipmentService.listAllEquipments(),
    staleTime: 60_000,
  });
}
