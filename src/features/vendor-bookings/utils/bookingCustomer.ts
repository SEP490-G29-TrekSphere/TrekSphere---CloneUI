import type { BookingDetailResponse } from '@/features/tours/types';
import type { VendorBookingItem } from '../types';

/**
 * Tên khách hàng nằm ở field khác nhau tuỳ nguồn dữ liệu: list vendor
 * (`VendorBookingItem`) trả `customerName`, còn `GET /bookings/{id}`
 * (`BookingDetailResponse`) trả `userFullName`. Các modal hiển thị lẫn lộn cả hai
 * nguồn — item từ list trước, detail fetch sau — nên đọc qua helper này thay vì
 * truy cập thẳng field.
 */
export function getBookingCustomerName(
  booking: BookingDetailResponse | VendorBookingItem,
  fallback = 'khách hàng'
): string {
  const name = 'userFullName' in booking ? booking.userFullName : booking.customerName;
  return name?.trim() || fallback;
}
