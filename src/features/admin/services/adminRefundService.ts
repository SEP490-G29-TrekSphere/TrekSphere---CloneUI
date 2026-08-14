import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { RefundStatus, RefundTransaction } from '@/features/payments/types';

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.error) throw new Error(response.error);
  if (response.data === undefined) throw new Error('Không nhận được dữ liệu từ máy chủ.');
  return response.data;
}

export const adminRefundService = {
  async getRefunds(status?: RefundStatus): Promise<RefundTransaction[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return unwrap(await ApiService<RefundTransaction[]>(`/admin/refunds${query}`, 'GET'));
  },

  async reviewManualRefund(
    refundId: string,
    approved: boolean,
    note: string
  ): Promise<RefundTransaction> {
    return unwrap(
      await ApiService<RefundTransaction>(`/admin/refunds/${refundId}/review`, 'POST', {
        approved,
        note: note.trim(),
      })
    );
  },
};
