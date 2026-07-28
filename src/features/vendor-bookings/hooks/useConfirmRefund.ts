import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/store/useToastStore';
import { vendorBookingService } from '../services/vendorBookingService';

export function useConfirmRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => vendorBookingService.confirmRefund(bookingId),
    onSuccess: () => {
      toast.success('Xác nhận đã hoàn tiền cho khách thành công!');
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-booking-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xác nhận hoàn tiền.');
    },
  });
}
