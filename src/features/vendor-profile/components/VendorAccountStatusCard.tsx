import { ShieldCheck } from 'lucide-react';
import { VENDOR_PROFILE_STATUS_LABELS, type VendorProfileStatus } from '../types';

interface VendorAccountStatusCardProps {
  status: VendorProfileStatus;
}

/** Thẻ Trạng thái tài khoản — nền xanh rêu đậm, hiển thị status thật từ API. */
export function VendorAccountStatusCard({ status }: VendorAccountStatusCardProps) {
  return (
    <div
      className="flex flex-col rounded-[32px] p-6 sm:p-8"
      style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
    >
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#A9B7AF' }}>
        Trạng thái tài khoản
      </p>

      <div className="mt-4 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7" style={{ color: '#8FE3B8' }} />
        <span className="text-xl font-extrabold">{VENDOR_PROFILE_STATUS_LABELS[status]}</span>
      </div>

      <div className="my-5 h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />

      <blockquote className="text-sm leading-relaxed italic" style={{ color: '#C7D0CB' }}>
        "Cập nhật đầy đủ thông tin liên hệ và pháp lý giúp tăng độ tin cậy với khách hàng."
      </blockquote>
    </div>
  );
}
