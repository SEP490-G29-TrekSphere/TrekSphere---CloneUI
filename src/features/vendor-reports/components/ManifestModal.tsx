import { CalendarClock, Download, ShieldAlert, Users, X } from 'lucide-react';
import { stableKey } from '@/lib/utils';
import { useScheduleManifest } from '../hooks/useVendorReports';
import type { ManifestPaymentStatus } from '../types';
import { exportManifestCsv } from '../utils/exportManifestCsv';

interface ManifestModalProps {
  scheduleId: string | null;
  onClose: () => void;
}

const PAYMENT_CONFIG: Record<
  ManifestPaymentStatus,
  { label: string; backgroundColor: string; color: string }
> = {
  PAID: { label: 'Đã thanh toán', backgroundColor: '#DCFCE7', color: '#15803D' },
  PENDING: { label: 'Chờ thanh toán', backgroundColor: '#FEE2E2', color: '#B91C1C' },
  PARTIALLY_REFUNDED: {
    label: 'Hoàn một phần',
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  REFUNDED: { label: 'Đã hoàn tiền', backgroundColor: '#E8E4DA', color: '#525252' },
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

const HEADERS = [
  '#',
  'HỌ VÀ TÊN',
  'LIÊN HỆ',
  'GIỚI TÍNH',
  'NGÀY SINH',
  'YÊU CẦU ĐẶC BIỆT',
  'THANH TOÁN',
];

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

export function ManifestModal({ scheduleId, onClose }: ManifestModalProps) {
  const { data: manifest, isLoading, isError, error } = useScheduleManifest(scheduleId);

  if (!scheduleId) return null;

  const passengers = manifest?.passengers ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Đóng danh sách khách"
        className="fixed inset-0 cursor-default border-none bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className="animate-in fade-in zoom-in-95 relative z-10 flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] shadow-2xl duration-200"
        style={{ backgroundColor: '#FAF8F1' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 px-8 py-6"
          style={{ borderBottom: '1px solid #E6E2D1' }}
        >
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-extrabold tracking-tight text-[#06261D]">
              Danh sách hành khách
            </h3>
            {manifest && (
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-gray-500">
                <span className="truncate font-bold text-[#06261D]">{manifest.tourName}</span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDate(manifest.departureDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {manifest.totalPassengers} khách
                </span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* <button
              type="button"
              onClick={() => manifest && exportManifestCsv(manifest)}
              disabled={!manifest || passengers.length === 0}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#06261D' }}
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </button> */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-full p-2.5 transition-colors hover:bg-[#E8E4DA]"
              style={{ color: '#06261D' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
              <span>Đang tải danh sách khách...</span>
            </div>
          ) : isError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-red-500">
              <ShieldAlert className="h-8 w-8" />
              <span>
                Không tải được danh sách khách:{' '}
                {error instanceof Error ? error.message : 'Lỗi không xác định'}
              </span>
            </div>
          ) : passengers.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-1">
              <Users className="mb-1 h-8 w-8 text-gray-300" />
              <p className="text-base font-semibold text-[#06261D]">Chuyến này chưa có khách nào</p>
              <p className="text-xs text-gray-400">Danh sách sẽ hiện ngay khi có đơn đặt tour.</p>
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-2xl"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
            >
              <table className="w-full min-w-[760px]">
                <thead style={{ backgroundColor: '#F4F0E8' }}>
                  <tr>
                    {HEADERS.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: '#6F7B75' }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#F0EEE6' }}>
                  {passengers.map((passenger, index) => {
                    const payment = PAYMENT_CONFIG[passenger.paymentStatus];
                    return (
                      <tr
                        key={
                          // Nhiều khách có thể cùng một `bookingCode` (đoàn đi
                          // chung một đơn) nên phải kèm vị trí dòng khi BE
                          // không trả id riêng cho từng hành khách.
                          passenger.id ?? stableKey(passenger.bookingCode ?? 'khach', index)
                        }
                        className="align-top"
                      >
                        <td className="px-4 py-3 text-xs font-bold text-gray-400">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-[#06261D]">{passenger.fullName}</p>
                          {passenger.bookingCode && (
                            <p className="text-[11px] font-semibold text-gray-400">
                              {passenger.bookingCode}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-[#06261D]">
                            {passenger.phoneNumber || '—'}
                          </p>
                          <p className="text-[11px] text-gray-400">{passenger.email || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-[#06261D]">
                          {passenger.gender
                            ? (GENDER_LABELS[passenger.gender.toUpperCase()] ?? passenger.gender)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-[#06261D]">
                          {formatDate(passenger.dateOfBirth)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-[200px] text-xs text-gray-500">
                            {passenger.specialRequirements || '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                            style={{
                              backgroundColor: payment.backgroundColor,
                              color: payment.color,
                            }}
                          >
                            {payment.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
