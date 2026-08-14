import {
  AlertTriangle,
  Ban,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Ticket,
  User,
  Users,
  X,
  ZoomIn,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ROLES } from '@/constants/roles';
import { BookingFinancialTimeline } from '@/features/payments/components/BookingFinancialTimeline';
import { tourService } from '@/features/tours/services/tourService';
import type { BookingDetailResponse } from '@/features/tours/types';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatDateTime, formatPrice } from '@/utils/format';
import type { BookingStatus, PaymentStatus } from '../types';

interface BookingDetailModalProps {
  bookingId: string | null;
  isOpen: boolean;
  initialTab?: BookingDetailTab;
  onClose: () => void;
}

interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

const bookingStatusConfig: Record<BookingStatus, StatusStyle> = {
  PAYMENT_PENDING: {
    label: 'Chờ thanh toán',
    bg: '#FEF3C7',
    text: '#92400E',
    dot: '#D97706',
  },
  PENDING_CONFIRMATION: {
    label: 'Chờ xác nhận',
    bg: '#FEF3C7',
    text: '#92400E',
    dot: '#D97706',
  },
  CONFIRMED: { label: 'Đã xác nhận', bg: '#DBEAFE', text: '#1E40AF', dot: '#2563EB' },
  IN_PROGRESS: { label: 'Đang diễn ra', bg: '#E0F2FE', text: '#075985', dot: '#0284C7' },
  CANCELLED: { label: 'Đã hủy', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  EXPIRED: { label: 'Hết hạn', bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  REJECTED: { label: 'Bị từ chối', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  COMPLETED: { label: 'Hoàn thành', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
};

const paymentStatusConfig: Record<PaymentStatus, StatusStyle> = {
  UNPAID: { label: 'Chưa thanh toán', bg: '#FEF3C7', text: '#B45309', dot: '#D97706' },
  PARTIALLY_PAID: { label: 'Đã đặt cọc', bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' },
  PAID: { label: 'Đã thanh toán', bg: '#D1FAE5', text: '#047857', dot: '#059669' },
  REFUND_PENDING: {
    label: 'Chờ hoàn tiền',
    bg: '#FFEDD5',
    text: '#C2410C',
    dot: '#EA580C',
  },
  REFUNDED: { label: 'Đã hoàn tiền', bg: '#CCFBF1', text: '#0F766E', dot: '#0D9488' },
  PARTIALLY_REFUNDED: {
    label: 'Hoàn tiền một phần',
    bg: '#E0E7FF',
    text: '#3730A3',
    dot: '#4F46E5',
  },
};

const FALLBACK_STATUS: StatusStyle = {
  label: '—',
  bg: '#F3F4F6',
  text: '#374151',
  dot: '#9CA3AF',
};

const GENDER_MAP: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: ReceiptText },
  { id: 'participants', label: 'Thành viên', icon: Users },
  { id: 'payment', label: 'Thanh toán', icon: CreditCard },
  { id: 'refund', label: 'Hoàn tiền', icon: RotateCcw },
] as const;

export type BookingDetailTab = (typeof TABS)[number]['id'];

function money(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${formatPrice(value)}đ`;
}

function getInitials(name?: string): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1]?.[0] ?? '';
  const first = parts.length > 1 ? (parts[0]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase() || '?';
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function StatusPill({ style }: { style: StatusStyle }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
      {style.label}
    </span>
  );
}

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  bodyClassName = 'p-5',
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Padding/layout for the card body — pass '' when the content brings its own. */
  bodyClassName?: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E6E2D1] bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-[#F1EEE4] px-5 py-3.5">
        <h4 className="flex items-center gap-2 text-sm font-extrabold text-[#06261D]">
          <Icon className="h-4 w-4 text-[#7B8C82]" />
          {title}
        </h4>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `Đã sao chép ${label}` : `Sao chép ${label}`}
      title={copied ? 'Đã sao chép' : `Sao chép ${label}`}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-[#F1EEE4] hover:text-[#06261D] cursor-pointer"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#047857]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  copyLabel,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string | null;
  copyLabel?: string;
}) {
  const hasValue = Boolean(value?.trim());
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-dashed border-[#F1EEE4] last:border-0">
      <span className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 pt-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#A8B3AC]" />}
        {label}
      </span>
      <span className="flex items-center gap-1 min-w-0">
        <span
          className={`text-right text-sm font-bold break-words ${
            hasValue ? 'text-[#06261D]' : 'text-gray-300 font-medium italic'
          }`}
        >
          {hasValue ? value : 'Chưa có'}
        </span>
        {hasValue && copyLabel && <CopyButton value={value as string} label={copyLabel} />}
      </span>
    </div>
  );
}

function FieldBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-[#EDE9DC] bg-[#FBFAF5] px-3 py-2.5">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="mt-0.5 block text-sm font-bold text-[#06261D] break-words">
        {value?.trim() || '—'}
      </span>
    </div>
  );
}

function ProofCard({
  title,
  icon: Icon,
  src,
  onZoom,
}: {
  title: string;
  icon: React.ElementType;
  src: string;
  onZoom: (src: string, title: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#E6E2D1] bg-white p-4">
      <span className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </span>
      <button
        type="button"
        onClick={() => onZoom(src, title)}
        className="group relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-[#F1EEE4] bg-[#FBFAF5] p-2 cursor-zoom-in"
      >
        <img
          src={src}
          alt={title}
          className="max-h-full max-w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#06261D]">
            <ZoomIn className="h-3.5 w-3.5" /> Phóng to
          </span>
        </span>
      </button>
    </div>
  );
}

function EmptyHint({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E6E2D1] bg-[#FBFAF5] py-10 text-center">
      <Icon className="h-7 w-7 text-[#CDD5CF]" />
      <p className="text-xs font-medium text-gray-400">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab panels                                                          */
/* ------------------------------------------------------------------ */

function OverviewPanel({ booking }: { booking: BookingDetailResponse }) {
  const isCancelled = booking.bookingStatus === 'CANCELLED';

  return (
    <div className="space-y-4">
      {isCancelled && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <h4 className="mb-3 flex items-center gap-2 border-b border-red-100 pb-2.5 text-sm font-extrabold text-red-800">
            <AlertTriangle className="h-4 w-4" />
            Đơn hàng đã bị hủy
            {booking.cancelledAt && (
              <span className="ml-auto text-[11px] font-semibold text-red-500">
                {formatDateTime(booking.cancelledAt)}
              </span>
            )}
          </h4>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-red-700">
            Lý do hủy đơn
          </span>
          <p className="rounded-xl border border-red-100 bg-white p-3 text-sm leading-relaxed text-gray-700">
            {booking.cancellationReason?.trim() || 'Không có lý do cụ thể.'}
          </p>

          {(booking.refundBankName ||
            booking.refundAccountNumber ||
            booking.refundAccountHolder) && (
            <div className="mt-4 border-t border-red-200/60 pt-3">
              <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-700">
                <Landmark className="h-3.5 w-3.5" /> Tài khoản nhận hoàn tiền
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <FieldBlock label="Ngân hàng" value={booking.refundBankName} />
                <FieldBlock label="Số tài khoản" value={booking.refundAccountNumber} />
                <FieldBlock label="Chủ tài khoản" value={booking.refundAccountHolder} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Thông tin người đặt" icon={User}>
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4EBE6] text-sm font-extrabold text-[#06261D]">
              {getInitials(booking.userFullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#06261D]">
                {booking.userFullName?.trim() || 'Chưa có tên'}
              </p>
              <p className="text-[11px] font-medium text-gray-400">Người đại diện đặt tour</p>
            </div>
          </div>
          <div>
            <InfoRow
              icon={Phone}
              label="Số điện thoại"
              value={booking.userPhone}
              copyLabel="số điện thoại"
            />
            <InfoRow icon={Mail} label="Email" value={booking.userEmail} copyLabel="email" />
          </div>
        </SectionCard>

        <SectionCard title="Mốc thời gian đơn hàng" icon={Calendar}>
          <ol className="relative space-y-4 pl-5">
            <span className="absolute left-[3px] top-2 bottom-2 w-px bg-[#EDE9DC]" />
            <li className="relative">
              <span className="absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full bg-[#06261D]" />
              <p className="text-xs font-bold text-[#06261D]">Đơn được tạo</p>
              <p className="text-xs text-gray-500">{formatDateTime(booking.createdAt) || '—'}</p>
            </li>
            <li className="relative">
              <span className="absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full bg-[#A8B3AC]" />
              <p className="text-xs font-bold text-[#06261D]">Cập nhật gần nhất</p>
              <p className="text-xs text-gray-500">{formatDateTime(booking.updatedAt) || '—'}</p>
            </li>
            {booking.cancelledAt && (
              <li className="relative">
                <span className="absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full bg-red-500" />
                <p className="text-xs font-bold text-red-700">Hủy đơn</p>
                <p className="text-xs text-gray-500">{formatDateTime(booking.cancelledAt)}</p>
              </li>
            )}
          </ol>
        </SectionCard>
      </div>

      <SectionCard title="Hành trình" icon={MapPin}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FieldBlock label="Ngày khởi hành" value={formatDate(booking.departureDate)} />
          <FieldBlock label="Ngày kết thúc" value={formatDate(booking.returnDate)} />
          <FieldBlock label="Số chỗ đã đặt" value={`${booking.numberOfParticipants} chỗ`} />
        </div>
      </SectionCard>
    </div>
  );
}

function ParticipantsPanel({ booking }: { booking: BookingDetailResponse }) {
  const participants = booking.participants ?? [];

  if (participants.length === 0) {
    return <EmptyHint icon={Users} message="Đơn hàng này chưa có danh sách thành viên chi tiết." />;
  }

  return (
    <SectionCard
      title={`Danh sách thành viên (${participants.length})`}
      icon={Users}
      action={
        <span className="rounded-full bg-[#F1EEE4] px-2.5 py-1 text-[11px] font-bold text-[#06261D]">
          {booking.numberOfParticipants} chỗ đã đặt
        </span>
      }
      bodyClassName=""
    >
      {/* Desktop: table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="px-5 pb-2 pt-3">Thành viên</th>
              <th className="px-3 pb-2 pt-3">Giới tính</th>
              <th className="px-3 pb-2 pt-3">Ngày sinh</th>
              <th className="px-3 pb-2 pt-3">CMND/CCCD</th>
              <th className="px-3 pb-2 pt-3">Số điện thoại</th>
              <th className="px-5 pb-2 pt-3">Yêu cầu đặc biệt</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {participants.map((p, idx) => (
              <tr
                key={p.participantId || idx}
                className="border-t border-[#F1EEE4] transition-colors hover:bg-[#FBFAF5]"
              >
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E4EBE6] text-[10px] font-extrabold text-[#06261D]">
                      {getInitials(p.fullName)}
                    </span>
                    <span className="font-bold text-[#06261D]">{p.fullName || '—'}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {p.gender ? GENDER_MAP[p.gender] || p.gender : '—'}
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {p.dateOfBirth ? formatDate(p.dateOfBirth) : '—'}
                </td>
                <td className="px-3 py-3 font-medium text-gray-600">{p.idNumber || '—'}</td>
                <td className="px-3 py-3 text-gray-600">{p.phone || '—'}</td>
                <td
                  className="max-w-[180px] truncate px-5 py-3 text-gray-600"
                  title={p.specialRequirements}
                >
                  {p.specialRequirements || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 p-4 md:hidden">
        {participants.map((p, idx) => (
          <article
            key={p.participantId || idx}
            className="rounded-xl border border-[#EDE9DC] bg-[#FBFAF5] p-3"
          >
            <header className="mb-2.5 flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4EBE6] text-[11px] font-extrabold text-[#06261D]">
                {getInitials(p.fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#06261D]">
                  {p.fullName || '—'}
                </p>
                <p className="text-[11px] text-gray-500">
                  {p.gender ? GENDER_MAP[p.gender] || p.gender : '—'}
                  {p.dateOfBirth ? ` • ${formatDate(p.dateOfBirth)}` : ''}
                </p>
              </div>
            </header>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <div>
                <dt className="text-gray-400">CMND/CCCD</dt>
                <dd className="font-bold text-[#06261D]">{p.idNumber || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Số điện thoại</dt>
                <dd className="font-bold text-[#06261D]">{p.phone || '—'}</dd>
              </div>
              {p.specialRequirements && (
                <div className="col-span-2">
                  <dt className="text-gray-400">Yêu cầu đặc biệt</dt>
                  <dd className="font-medium text-gray-700">{p.specialRequirements}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}

function PaymentPanel({ booking }: { booking: BookingDetailResponse }) {
  return (
    <div className="space-y-4">
      <div>
        <SectionCard title="Chi tiết thanh toán" icon={ReceiptText}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Đơn giá / chỗ</span>
              <span className="font-bold text-[#06261D]">{money(booking.pricePerSlot)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tạm tính ({booking.numberOfParticipants} người)</span>
              <span className="font-bold text-[#06261D]">{money(booking.originalPrice)}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex items-center justify-between text-red-600">
                <span className="flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5" />
                  Chiết khấu
                  {booking.voucherCode && (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      {booking.voucherCode}
                    </span>
                  )}
                </span>
                <span className="font-bold">-{money(booking.discountAmount)}</span>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#06261D] px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                Tổng thanh toán
              </span>
              <span className="text-lg font-extrabold text-white">{money(booking.totalPrice)}</span>
            </div>
            {booking.refundAmount > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#0F766E]">
                  <RotateCcw className="h-3.5 w-3.5" /> Số tiền hoàn
                </span>
                <span className="text-sm font-extrabold text-[#0F766E]">
                  {money(booking.refundAmount)}
                </span>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
export function BookingDetailModal({
  bookingId,
  isOpen,
  initialTab = 'overview',
  onClose,
}: BookingDetailModalProps) {
  const canManageRefunds = useAppStore((state) =>
    Boolean(state.user?.roles?.includes(ROLES.VENDOR_MANAGER))
  );
  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingDetailTab>(initialTab);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setHasError(false);
    try {
      const data = await tourService.getBookingDetail(bookingId);
      setBooking(data);
    } catch (err) {
      console.error('Không thể tải chi tiết đơn đặt chỗ:', err);
      setBooking(null);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  // Reset per-booking view state so a reopen never flashes the previous order.
  useEffect(() => {
    if (!isOpen) return;
    setBooking(null);
    setHasError(false);
    setActiveTab(initialTab);
    setLightbox(null);
    fetchDetail();
  }, [isOpen, fetchDetail, initialTab]);

  // Escape closes the lightbox first, then the modal. Body scroll stays locked.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (lightbox) {
        setLightbox(null);
        return;
      }
      onClose();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, lightbox, onClose]);

  const handleZoom = useCallback((src: string, title: string) => {
    setLightbox({ src, title });
  }, []);

  if (!isOpen) return null;

  const bStatus = booking
    ? (bookingStatusConfig[booking.bookingStatus] ?? {
        ...FALLBACK_STATUS,
        label: booking.bookingStatus,
      })
    : null;
  const pStatus = booking
    ? (paymentStatusConfig[booking.paymentStatus] ?? {
        ...FALLBACK_STATUS,
        label: booking.paymentStatus,
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Đóng modal"
        className="fixed inset-0 cursor-default border-none bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 sm:rounded-[32px]"
        style={{ backgroundColor: '#FAF8F1' }}
      >
        {/* ---------------- Header ---------------- */}
        <header className="shrink-0 border-b border-[#EBE6D8] px-5 pt-5 sm:px-7 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3
                id="booking-detail-title"
                className="text-lg font-extrabold tracking-tight text-[#06261D] sm:text-2xl"
              >
                Chi tiết đơn đặt tour
              </h3>
              {booking && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1 rounded-lg bg-[#F1EEE4] py-0.5 pl-2 pr-1 font-bold text-[#06261D]">
                    #{booking.bookingCode}
                    <CopyButton value={booking.bookingCode} label="mã đơn" />
                  </span>
                  <span>Tạo lúc {formatDateTime(booking.createdAt)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#EFEADC] hover:text-[#06261D] cursor-pointer"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tour summary strip */}
          {booking && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#E6E2D1] bg-white p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {booking.coverImageUrl ? (
                  <img
                    src={booking.coverImageUrl}
                    alt={booking.tourName}
                    className="h-14 w-20 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-[#E4EBE6]">
                    <MapPin className="h-5 w-5 text-[#7B8C82]" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-extrabold text-[#06261D]">
                    {booking.tourName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(booking.departureDate)} → {formatDate(booking.returnDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {booking.numberOfParticipants} chỗ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {booking.paymentStatus === 'REFUND_PENDING' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('refund')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Xử lý hoàn tiền
                  </button>
                )}
                {bStatus && <StatusPill style={bStatus} />}
                {pStatus && <StatusPill style={pStatus} />}
              </div>
            </div>
          )}

          {/* Tabs */}
          {booking && (
            <div
              role="tablist"
              aria-label="Nhóm thông tin đơn hàng"
              className="mt-4 -mb-px flex items-center gap-1 overflow-x-auto"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tab.id === 'participants' ? booking.participants?.length : undefined;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`booking-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`booking-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-t-xl border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer sm:text-sm ${
                      isActive
                        ? 'border-[#06261D] text-[#06261D]'
                        : 'border-transparent text-gray-400 hover:text-[#06261D]'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {count !== undefined && count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                          isActive ? 'bg-[#06261D] text-white' : 'bg-[#EFEADC] text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* ---------------- Body ---------------- */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 [scrollbar-color:#D8D2C0_transparent] [scrollbar-width:thin]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#06261D]" />
              <span>Đang tải thông tin chi tiết đơn hàng...</span>
            </div>
          ) : hasError || !booking ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Ban className="h-6 w-6 text-red-500" />
              </span>
              <p className="text-sm font-bold text-[#06261D]">Không thể tải chi tiết đơn hàng</p>
              <p className="max-w-sm text-xs text-gray-500">
                Đã có lỗi xảy ra khi lấy dữ liệu từ máy chủ. Vui lòng thử lại.
              </p>
              <button
                type="button"
                onClick={fetchDetail}
                className="mt-1 flex items-center gap-2 rounded-full bg-[#06261D] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" /> Thử lại
              </button>
            </div>
          ) : (
            <div
              role="tabpanel"
              id={`booking-panel-${activeTab}`}
              aria-labelledby={`booking-tab-${activeTab}`}
            >
              {activeTab === 'overview' && <OverviewPanel booking={booking} />}
              {activeTab === 'participants' && <ParticipantsPanel booking={booking} />}
              {activeTab === 'payment' && (
                <div className="space-y-5">
                  <PaymentPanel booking={booking} />
                  <BookingFinancialTimeline
                    bookingId={booking.bookingId}
                    audience="vendor"
                    canManageRefunds={canManageRefunds}
                    view="payments"
                  />
                </div>
              )}
              {activeTab === 'refund' && (
                <div className="space-y-5">
                  {booking.refundProofImageUrl && (
                    <ProofCard
                      title="Ảnh minh chứng hoàn tiền của đơn cũ"
                      icon={RotateCcw}
                      src={booking.refundProofImageUrl}
                      onZoom={handleZoom}
                    />
                  )}
                  <BookingFinancialTimeline
                    bookingId={booking.bookingId}
                    audience="vendor"
                    canManageRefunds={canManageRefunds}
                    view="refunds"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------------- Footer ---------------- */}
        <footer className="flex shrink-0 flex-col gap-3 border-t border-[#EBE6D8] bg-[#F6F3EA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Tổng tiền
            </span>
            <span className="text-lg font-extrabold text-[#06261D]">
              {booking ? money(booking.totalPrice) : '—'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#E8E4DA] px-6 py-2.5 text-sm font-bold text-[#06261D] transition-colors hover:bg-[#DDD8CB] cursor-pointer"
          >
            Đóng
          </button>
        </footer>
      </div>

      {/* ---------------- Lightbox ---------------- */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="Đóng ảnh phóng to"
            className="absolute inset-0 cursor-zoom-out border-none bg-black/80"
            onClick={() => setLightbox(null)}
          />
          <figure className="relative z-10 flex max-h-full flex-col items-center gap-3">
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <figcaption className="text-xs font-bold uppercase tracking-wide text-white/80">
              {lightbox.title}
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Đóng"
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
