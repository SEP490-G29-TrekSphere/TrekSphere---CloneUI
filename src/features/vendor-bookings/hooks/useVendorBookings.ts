import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { vendorBookingService } from '../services/vendorBookingService';
import type { VendorBookingFilter } from '../types';

export function useVendorBookings(filter: VendorBookingFilter, page = 1, size = 10) {
  return useQuery({
    queryKey: ['vendor-bookings', filter, page, size],
    queryFn: () => vendorBookingService.listBookings(filter, page, size),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });
}
