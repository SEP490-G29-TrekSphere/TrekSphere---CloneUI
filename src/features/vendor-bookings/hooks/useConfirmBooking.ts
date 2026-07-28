import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/store/useToastStore';
import { vendorBookingService } from '../services/vendorBookingService';

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => vendorBookingService.confirmBooking(bookingId),
    onSuccess: () => {
      toast.success('Xác nhận giữ chỗ chính thức thành công!');
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-booking-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xác nhận giữ chỗ.');
    },
  });
}
