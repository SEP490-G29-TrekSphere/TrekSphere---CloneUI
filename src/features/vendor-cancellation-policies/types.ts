/**
 * Types cho "Chính sách hủy tour & hoàn tiền" của Vendor.
 * Mirror `CancellationPolicyResponse` / `CancellationPolicyRequest`
 * (BE tag "Vendor Cancellation Policy Management").
 *
 * Cùng shape này còn xuất hiện trong `TourDetailResponse.cancellationPolicies`
 * của API tour công khai — nên trekker đọc được chính sách mà không cần gọi
 * endpoint vendor (endpoint đó yêu cầu quyền Vendor).
 */

export interface CancellationPolicy {
  cancellationPolicyId: string;
  /** Số ngày hủy trước ngày khởi hành. */
  cancelBeforeDays: number;
  /** Phần trăm tiền được hoàn (0 - 100). */
  refundPercentage: number;
  description?: string;
  isActive: boolean;
}

/** Body cho cả POST (tạo mới) và PUT (cập nhật) — BE dùng chung 1 request schema. */
export interface CancellationPolicyPayload {
  cancelBeforeDays: number;
  refundPercentage: number;
  description?: string;
}

/** Mốc ngày lớn nhất lên đầu — đọc theo mạch "hủy càng sớm hoàn càng nhiều". */
export function sortPoliciesByDaysDesc(policies: CancellationPolicy[]): CancellationPolicy[] {
  return [...policies].sort((a, b) => b.cancelBeforeDays - a.cancelBeforeDays);
}
