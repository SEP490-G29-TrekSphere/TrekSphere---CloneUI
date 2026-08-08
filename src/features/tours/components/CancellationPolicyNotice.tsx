import { ReceiptText } from 'lucide-react';
import {
  type CancellationPolicy,
  sortPoliciesByDaysDesc,
} from '@/features/vendor-cancellation-policies/types';
import { AppCard } from '@/shared/ui';

interface CancellationPolicyNoticeProps {
  /** `tour.cancellationPolicies` từ `GET /tours/{id}`. */
  policies?: CancellationPolicy[];
}

/**
 * Khối thông tin (chỉ đọc) về điều khoản hủy tour & hoàn tiền, hiển thị cho
 * Trekker ở màn Đặt tour để biết trước quyền lợi hoàn tiền khi phải hủy.
 *
 * Chỉ hiển thị phần trăm đúng như vendor cấu hình — không tự nhân ra số tiền,
 * vì BE là nơi quyết định `refundAmount` cuối cùng lúc hủy.
 */
export function CancellationPolicyNotice({ policies }: CancellationPolicyNoticeProps) {
  const activePolicies = sortPoliciesByDaysDesc((policies ?? []).filter((p) => p.isActive));

  return (
    <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#F4F4F2] pb-4 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
          <ReceiptText className="h-4 w-4" />
        </div>
        <h3 className="font-extrabold text-zinc-800 text-base">
          Chính sách hủy tour &amp; hoàn tiền
        </h3>
      </div>

      {activePolicies.length === 0 ? (
        <p className="text-xs font-medium text-zinc-500 leading-relaxed">
          Nhà tổ chức chưa công bố chính sách hủy cho tour này. Vui lòng liên hệ nhà tổ chức để nắm
          rõ quyền lợi hoàn tiền trước khi thanh toán.
        </p>
      ) : (
        <>
          <ul className="space-y-2.5">
            {activePolicies.map((policy) => (
              <li
                key={policy.cancellationPolicyId}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-[#FAF9F5] border border-[#E5E4DE] p-3.5"
              >
                <span className="text-sm font-bold text-[#0B3025]">
                  Hủy trước {policy.cancelBeforeDays} ngày
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  Hoàn {policy.refundPercentage}%
                </span>
                {policy.description && (
                  <p className="w-full text-[11px] font-semibold text-zinc-500">
                    {policy.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] font-medium text-zinc-400 leading-relaxed">
            Khi bạn gửi yêu cầu hủy, hệ thống tự áp mốc phù hợp với số ngày còn lại tính đến ngày
            khởi hành để xác định số tiền được hoàn.
          </p>
        </>
      )}
    </AppCard>
  );
}
