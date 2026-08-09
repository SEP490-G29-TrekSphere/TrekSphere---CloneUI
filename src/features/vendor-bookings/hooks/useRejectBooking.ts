import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/store/useToastStore';
import { vendorBookingService } from '../services/vendorBookingService';

export function useRejectBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      cancellationReason,
      refundBankName,
      refundAccountNumber,
      refundAccountHolder,
    }: {
      bookingId: string;
      cancellationReason: string;
      refundBankName?: string;
      refundAccountNumber?: string;
      refundAccountHolder?: string;
    }) =>
      vendorBookingService.rejectBooking(
        bookingId,
        cancellationReason,
        refundBankName,
        refundAccountNumber,
        refundAccountHolder
      ),
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
