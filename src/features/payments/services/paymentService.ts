import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  CancellationQuote,
  PaymentCheckout,
  PaymentTransaction,
  PayOsAccountPayload,
  RefundDestinationPayload,
  RefundTransaction,
  TourPaymentPolicy,
  TourPaymentPolicyPayload,
  VendorPaymentAccount,
} from '../types';

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.error) throw new Error(response.error);
  if (response.data === undefined) throw new Error('Không nhận được dữ liệu từ máy chủ.');
  return response.data;
}

export const paymentService = {
  async createCheckout(bookingId: string): Promise<PaymentCheckout> {
    return unwrap(
      await ApiService<PaymentCheckout>(`/bookings/${bookingId}/payments/checkout`, 'POST')
    );
  },

  async getPayments(bookingId: string): Promise<PaymentTransaction[]> {
    return unwrap(await ApiService<PaymentTransaction[]>(`/bookings/${bookingId}/payments`, 'GET'));
  },

  async getRefunds(bookingId: string): Promise<RefundTransaction[]> {
    return unwrap(await ApiService<RefundTransaction[]>(`/bookings/${bookingId}/refunds`, 'GET'));
  },

  async getCancellationQuote(bookingId: string): Promise<CancellationQuote> {
    return unwrap(
      await ApiService<CancellationQuote>(`/bookings/${bookingId}/cancellation-quote`, 'GET')
    );
  },

  async updateRefundDestination(
    refundId: string,
    payload: RefundDestinationPayload
  ): Promise<RefundTransaction> {
    return unwrap(
      await ApiService<RefundTransaction>(
        `/bookings/refunds/${refundId}/destination`,
        'PUT',
        payload
      )
    );
  },

  async getPayOsAccount(): Promise<VendorPaymentAccount> {
    return unwrap(
      await ApiService<VendorPaymentAccount>('/vendor/payment-settings/payos-account', 'GET')
    );
  },

  async configurePayOsAccount(payload: PayOsAccountPayload): Promise<VendorPaymentAccount> {
    return unwrap(
      await ApiService<VendorPaymentAccount>(
        '/vendor/payment-settings/payos-account',
        'PUT',
        payload
      )
    );
  },

  async getTourPaymentPolicy(tourId: string): Promise<TourPaymentPolicy> {
    return unwrap(
      await ApiService<TourPaymentPolicy>(`/vendor/payment-settings/tours/${tourId}/policy`, 'GET')
    );
  },

  async updateTourPaymentPolicy(
    tourId: string,
    payload: TourPaymentPolicyPayload
  ): Promise<TourPaymentPolicy> {
    return unwrap(
      await ApiService<TourPaymentPolicy>(
        `/vendor/payment-settings/tours/${tourId}/policy`,
        'PUT',
        payload
      )
    );
  },

  async processRefund(refundId: string): Promise<RefundTransaction> {
    return unwrap(
      await ApiService<RefundTransaction>(`/vendor/bookings/refunds/${refundId}/process`, 'POST')
    );
  },

  async completeManualRefund(
    refundId: string,
    bankReference: string,
    note?: string
  ): Promise<RefundTransaction> {
    return unwrap(
      await ApiService<RefundTransaction>(
        `/vendor/bookings/refunds/${refundId}/complete-manual`,
        'POST',
        { bankReference, note: note?.trim() || undefined }
      )
    );
  },
};
