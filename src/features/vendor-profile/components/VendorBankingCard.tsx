import { Landmark } from 'lucide-react';
import type { VendorProfileDetail } from '../types';

interface VendorBankingCardProps {
  profile: VendorProfileDetail;
}

/** Khối Ngân hàng & Thanh toán — bankName/bankAccount/paymentQrUrl (đủ toàn bộ field API trả về). */
export function VendorBankingCard({ profile }: VendorBankingCardProps) {
  const hasBankInfo = profile.bankName || profile.bankAccount;

  return (
    <div className="rounded-[32px] p-6 sm:p-8" style={{ backgroundColor: '#F6F4EB' }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: '#E6E2D1', color: '#06261D' }}
        >
          <Landmark className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
          Ngân hàng &amp; Thanh toán
        </h3>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        <div className="flex-1 space-y-4">
          {hasBankInfo ? (
            <>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: '#6F7B75' }}
                >
                  Ngân hàng
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: '#06261D' }}>
                  {profile.bankName || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: '#6F7B75' }}
                >
                  Số tài khoản
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: '#06261D' }}>
                  {profile.bankAccount || 'Chưa cập nhật'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: '#6F7B75' }}>
              Chưa cập nhật thông tin ngân hàng.
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F7B75' }}>
            Mã QR
          </p>
          <div
            className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-dashed"
            style={{ borderColor: '#C5C0B0', backgroundColor: '#FFFFFF' }}
          >
            {profile.paymentQrUrl ? (
              <img
                src={profile.paymentQrUrl}
                alt="Mã QR thanh toán"
                className="h-full w-full object-contain p-1"
                loading="lazy"
              />
            ) : (
              <span className="px-2 text-center text-[11px]" style={{ color: '#6F7B75' }}>
                Chưa có QR
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
