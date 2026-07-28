import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/store/useToastStore';
import { vendorBookingService } from '../services/vendorBookingService';

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => vendorBookingService.confirmPayment(bookingId),
    onSuccess: () => {
      toast.success('Xác nhận đã nhận tiền thanh toán thành công!');
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-booking-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xác nhận nhận tiền thanh toán.');
    },
  });
}
