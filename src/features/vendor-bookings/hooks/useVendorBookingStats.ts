import { useQuery } from '@tanstack/react-query';
import { vendorBookingService } from '../services/vendorBookingService';

export function useVendorBookingStats() {
  return useQuery({
    queryKey: ['vendor-booking-stats'],
    queryFn: () => vendorBookingService.getStats(),
  });
}
