import type { TourPaymentPolicy } from '@/features/payments';
import {
  type CancellationPolicy,
  sortPoliciesByDaysDesc,
} from '@/features/vendor-cancellation-policies/types';
import { AppCard } from '@/shared/ui';

interface CancellationPolicyNoticeProps {
  /** `tour.cancellationPolicies` từ `GET /tours/{id}`. */
  policies?: CancellationPolicy[];
  paymentPolicy?: TourPaymentPolicy;
  nonRefundableCost?: number;
  /** Ẩn phần tóm tắt khi màn cha đã cho khách chọn phương thức thanh toán. */
  showPaymentSummary?: boolean;
}

function paymentOptionLabel(policy?: TourPaymentPolicy): string {
  if (!policy || policy.paymentOption === 'FULL_PAYMENT_ONLY') return 'Thanh toán toàn bộ';
  if (policy.paymentOption === 'DEPOSIT_ONLY') return 'Bắt buộc đặt cọc';
  return 'Linh hoạt: trả đủ hoặc đặt cọc';
}

function depositLabel(policy?: TourPaymentPolicy): string | null {
  if (!policy?.depositType || !policy.depositValue) return null;
  return policy.depositType === 'PERCENTAGE'
    ? `${policy.depositValue}% giá trị đơn`
    : `${policy.depositValue.toLocaleString('vi-VN')}đ`;
}

function remainingDueLabel(policy?: TourPaymentPolicy): string {
  const days = policy?.remainingDueDaysBeforeDeparture;
  if (days == null) return 'Theo thời hạn trên đơn đặt tour';
  if (days === 0) return 'Hoàn tất trước giờ khởi hành';
  return `Hoàn tất trước khởi hành ${days} ngày`;
}

/**
 * Khối thông tin (chỉ đọc) về điều khoản hủy tour & hoàn tiền, hiển thị cho
 * Trekker ở màn Đặt tour và ở trang chi tiết tour.
 *
 * Chỉ hiển thị phần trăm đúng như vendor cấu hình — không tự nhân ra số tiền,
 * vì BE là nơi quyết định `refundAmount` cuối cùng lúc hủy.
 */
export function CancellationPolicyNotice({
  policies,
  paymentPolicy,
  nonRefundableCost,
  showPaymentSummary = true,
}: CancellationPolicyNoticeProps) {
  const activePolicies = sortPoliciesByDaysDesc((policies ?? []).filter((p) => p.isActive));
  const deposit = depositLabel(paymentPolicy);

  return (
    <AppCard className="rounded-2xl border-[#DED9CA] bg-white p-4 shadow-none sm:p-5">
      <div>
        <h3 className="text-base font-extrabold text-[#1E3932]">
          {showPaymentSummary ? 'Thanh toán, hủy tour & hoàn tiền' : 'Hủy tour & hoàn tiền'}
        </h3>
        <p className="mt-0.5 text-xs font-medium text-[#6F7E72]">
          Điều khoản được hệ thống tự động áp dụng cho đơn đặt tour.
        </p>
      </div>

      {showPaymentSummary && (
        <dl className="mt-4 divide-y divide-[#E1DDCF] rounded-xl bg-[#F7F5EF] px-4 sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="py-3 sm:pr-4">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6F7E72]">
              Hình thức thanh toán
            </dt>
            <dd className="mt-1 text-sm font-extrabold text-[#1E3932]">
              {paymentOptionLabel(paymentPolicy)}
            </dd>
            {deposit && <p className="mt-0.5 text-xs text-[#6F7E72]">Đặt cọc {deposit}</p>}
          </div>

          <div className="py-3 sm:pl-4">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6F7E72]">
              Hạn thanh toán
            </dt>
            <dd className="mt-1 text-sm font-extrabold text-[#1E3932]">
              {remainingDueLabel(paymentPolicy)}
            </dd>
            <p className="mt-0.5 text-xs text-[#6F7E72]">Hạn cụ thể hiển thị trên từng đơn.</p>
          </div>
        </dl>
      )}

      <div className={showPaymentSummary ? 'mt-4' : 'mt-3'}>
        <h4 className="text-sm font-extrabold text-[#1E3932]">Mức hoàn tiền khi hủy</h4>

        {activePolicies.length === 0 ? (
          <div className="mt-2 rounded-xl bg-amber-50 px-3.5 py-3">
            <p className="text-xs font-semibold leading-relaxed text-amber-950">
              Nhà tổ chức chưa công bố mức hoàn tiền. Hãy liên hệ nhà tổ chức trước khi thanh toán
              để xác nhận quyền lợi của bạn.
            </p>
          </div>
        ) : (
          <ol className="mt-2 divide-y divide-[#E8E4DA] border-y border-[#E8E4DA]">
            {activePolicies.map((policy) => (
              <li
                key={policy.cancellationPolicyId}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1E3932]">
                    Hủy trước ít nhất {policy.cancelBeforeDays} ngày
                  </p>
                  {policy.description && (
                    <p className="mt-0.5 text-xs font-medium text-[#6F7E72]">
                      {policy.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-[#E7F3EC] px-2.5 py-1 text-xs font-extrabold text-[#006241]">
                  Hoàn {policy.refundPercentage}%
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#6F7E72]">
        Mốc hoàn tiền được chọn theo số ngày còn lại. Số tiền chính xác luôn hiển thị trước khi bạn
        xác nhận hủy.
      </p>

      {Boolean(nonRefundableCost && nonRefundableCost > 0) && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-950">
          Chi phí không hoàn lại: {nonRefundableCost?.toLocaleString('vi-VN')}đ, được trừ trước khi
          tính phần trăm hoàn tiền.
        </p>
      )}
    </AppCard>
  );
}
