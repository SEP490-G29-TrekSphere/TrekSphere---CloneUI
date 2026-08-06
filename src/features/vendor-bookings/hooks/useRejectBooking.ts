import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/store/useToastStore';
import { vendorBookingService } from '../services/vendorBookingService';

export function useRejectBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      cancellationReason,
    }: {
      bookingId: string;
      cancellationReason: string;
    }) => vendorBookingService.rejectBooking(bookingId, cancellationReason),
    onSuccess: () => {
      toast.success('Từ chối đơn đặt tour thành công!');
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-booking-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể từ chối đơn đặt tour.');
    },
  });
}
