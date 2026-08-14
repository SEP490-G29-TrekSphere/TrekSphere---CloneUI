import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { paymentService } from '@/features/payments/services/paymentService';
import type { RefundTransaction } from '@/features/payments/types';
import { profileService } from '@/features/profile/services/profileService';
import { AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

interface BookingFinancialTimelineProps {
  bookingId: string;
  audience: 'trekker' | 'vendor';
  canManageRefunds?: boolean;
  view?: 'all' | 'payments' | 'refunds';
}

const destinationSchema = z.object({
  bankBin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Mã BIN phải gồm đúng 6 chữ số.'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, 'Số tài khoản phải gồm 6-20 chữ số.'),
  accountName: z.string().trim().min(3, 'Vui lòng nhập tên chủ tài khoản.'),
});

const manualSchema = z.object({
  bankReference: z.string().trim().min(3, 'Vui lòng nhập mã tham chiếu ngân hàng.'),
  note: z.string().trim().max(300, 'Ghi chú tối đa 300 ký tự.').optional(),
});

type DestinationValues = z.infer<typeof destinationSchema>;
type ManualValues = z.infer<typeof manualSchema>;

function money(value: number): string {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function visibleRefundAccountNumber(
  refund: RefundTransaction,
  audience: BookingFinancialTimelineProps['audience']
): string | null {
  if (audience === 'vendor') return refund.destinationAccountNumber ?? null;
  if (refund.maskedDestinationAccountNumber) return refund.maskedDestinationAccountNumber;
  const account = refund.destinationAccountNumber;
  if (!account) return null;
  return account.length > 4 ? `${'*'.repeat(account.length - 4)}${account.slice(-4)}` : account;
}

function dateTime(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function deadlineText(value?: string | null): string | null {
  if (!value) return null;
  const difference = new Date(value).getTime() - Date.now();
  const absoluteHours = Math.max(1, Math.ceil(Math.abs(difference) / 3_600_000));
  const duration =
    absoluteHours >= 24 ? `${Math.ceil(absoluteHours / 24)} ngày` : `${absoluteHours} giờ`;
  return difference > 0 ? `Còn khoảng ${duration}` : `Đã quá hạn khoảng ${duration}`;
}

const paymentLabels: Record<string, string> = {
  FULL: 'Thanh toán toàn bộ',
  DEPOSIT: 'Tiền đặt cọc',
  REMAINING: 'Phần còn lại',
  CREATED: 'Đã tạo',
  PENDING: 'Đang chờ',
  PROCESSING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
  REFUNDED: 'Đã hoàn tiền',
  AWAITING_VENDOR_ACTION: 'Chờ vendor chuyển khoản',
  MANUAL_REVIEW: 'Chờ admin xác minh',
  OVERDUE: 'Quá hạn xử lý',
};

const refundReasonLabels: Record<string, string> = {
  TREKKER_CANCEL: 'Khách hủy đặt tour',
  VENDOR_CANCEL: 'Nhà tổ chức hủy tour',
  INSUFFICIENT_PAX: 'Không đủ số khách khởi hành',
  NO_SHOW: 'Khách không tham gia',
  PAYMENT_ADJUSTMENT: 'Điều chỉnh thanh toán',
  OTHER: 'Lý do khác',
};

/** Token style dùng chung cho form trong khối tài chính. */
const FIELD_LABEL = 'block text-[11px] font-bold text-[#5A6B62]';
const FIELD_INPUT =
  'mt-1.5 w-full rounded-xl border border-[#E7E5DE] bg-[#FAF9F6] px-3 py-2 text-sm font-semibold text-[#1E3932] outline-none transition-colors placeholder:font-medium placeholder:text-[#A6AFA9] focus:border-[#1E3932] focus:bg-white';
const FIELD_ERROR = 'mt-1 block text-[11px] font-semibold text-red-600';
const PRIMARY_BUTTON =
  'inline-flex items-center gap-2 rounded-full bg-[#0B3025] px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#06261D] disabled:opacity-60';
const SECONDARY_BUTTON =
  'inline-flex items-center gap-2 rounded-full border border-[#E7E5DE] bg-white px-4 py-2 text-xs font-extrabold text-[#1E3932] transition-colors hover:bg-[#F7F6F2]';

const DANGER_STATUSES = ['FAILED', 'CANCELLED', 'EXPIRED', 'OVERDUE'];
const DONE_STATUSES = ['PAID', 'REFUNDED'];

/**
 * Bảng màu tối giản: mọi khối đều nền trung tính, màu chỉ xuất hiện ở chấm
 * trạng thái hoặc chữ cảnh báo — tránh tình trạng mỗi trạng thái một nền màu.
 */
function statusDotTone(status: string): string {
  if (DONE_STATUSES.includes(status)) return 'bg-emerald-500';
  if (DANGER_STATUSES.includes(status)) return 'bg-red-500';
  if (status === 'MANUAL_REVIEW') return 'bg-[#1E3932]';
  return 'bg-amber-400';
}

function statusTextTone(status: string): string {
  return DANGER_STATUSES.includes(status) ? 'text-red-600' : 'text-[#3F4E46]';
}

function iconTone(status: string): string {
  if (DONE_STATUSES.includes(status)) return 'text-emerald-600';
  if (DANGER_STATUSES.includes(status)) return 'text-red-500';
  return 'text-[#8E9A93]';
}

function StatusChip({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#E7E5DE] bg-white px-2.5 py-1 text-[11px] font-bold ${statusTextTone(status)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotTone(status)}`} />
      {label}
    </span>
  );
}

/** Dòng chú thích phụ dưới thẻ giao dịch — thay cho các banner nền vàng/xanh. */
function NoteRow({
  icon: Icon,
  tone = 'muted',
  children,
}: {
  icon: typeof Clock3;
  tone?: 'muted' | 'danger';
  children: ReactNode;
}) {
  return (
    <div
      className={`mt-4 flex items-start gap-2.5 border-t border-[#EFEDE7] pt-3 text-[11px] font-medium leading-relaxed ${
        tone === 'danger' ? 'text-red-600' : 'text-[#6F7E72]'
      }`}
    >
      <Icon className="mt-px h-3.5 w-3.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function transactionTimeLabel(
  status: string,
  paidAt?: string | null,
  expiredAt?: string | null
): string {
  if (paidAt) return `Thanh toán lúc ${dateTime(paidAt)}`;
  if (expiredAt && status === 'EXPIRED') return `Hết hạn lúc ${dateTime(expiredAt)}`;
  if (expiredAt) return `Có hiệu lực đến ${dateTime(expiredAt)}`;
  return 'Chưa có thời gian cập nhật';
}

function RefundDestinationForm({
  refund,
  onSaved,
}: {
  refund: RefundTransaction;
  onSaved: () => void;
}) {
  const form = useForm<DestinationValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      bankBin: refund.destinationBin ?? '',
      accountNumber: '',
      accountName: refund.destinationAccountName ?? '',
    },
  });
  const mutation = useMutation({
    mutationFn: (values: DestinationValues) =>
      paymentService.updateRefundDestination(refund.refundTransactionId, {
        ...values,
        accountName: values.accountName.toUpperCase(),
      }),
    onSuccess: () => {
      toast.success('Đã cập nhật tài khoản nhận hoàn tiền.');
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="mt-4 border-t border-[#EFEDE7] pt-4"
    >
      <p className="text-xs font-extrabold text-[#1E3932]">Cập nhật tài khoản nhận hoàn tiền</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className={FIELD_LABEL}>
          Mã BIN ngân hàng
          <input
            {...form.register('bankBin')}
            inputMode="numeric"
            placeholder="970436"
            className={FIELD_INPUT}
          />
          {form.formState.errors.bankBin && (
            <span className={FIELD_ERROR}>{form.formState.errors.bankBin.message}</span>
          )}
        </label>
        <label className={FIELD_LABEL}>
          Số tài khoản
          <input {...form.register('accountNumber')} inputMode="numeric" className={FIELD_INPUT} />
          {form.formState.errors.accountNumber && (
            <span className={FIELD_ERROR}>{form.formState.errors.accountNumber.message}</span>
          )}
        </label>
        <label className={FIELD_LABEL}>
          Tên chủ tài khoản
          <input {...form.register('accountName')} className={`${FIELD_INPUT} uppercase`} />
          {form.formState.errors.accountName && (
            <span className={FIELD_ERROR}>{form.formState.errors.accountName.message}</span>
          )}
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="submit" disabled={mutation.isPending} className={PRIMARY_BUTTON}>
          {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Lưu tài khoản nhận tiền
        </button>
      </div>
    </form>
  );
}

function VendorRefundActions({
  refund,
  onSaved,
}: {
  refund: RefundTransaction;
  onSaved: () => void;
}) {
  const [showManual, setShowManual] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const form = useForm<ManualValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: { bankReference: '', note: '' },
  });
  const canProcess = ['PENDING', 'FAILED', 'AWAITING_VENDOR_ACTION', 'OVERDUE'].includes(
    refund.status
  );
  const manualFallbackAvailable =
    !refund.automaticPayoutAvailable ||
    ['FAILED', 'AWAITING_VENDOR_ACTION', 'OVERDUE'].includes(refund.status);
  const hasDestination = Boolean(
    refund.destinationBin && refund.destinationAccountNumber && refund.destinationAccountName
  );
  const gatewayMutation = useMutation({
    mutationFn: () => paymentService.processRefund(refund.refundTransactionId),
    onSuccess: () => {
      toast.success('Đã gửi lệnh chi tiền qua Kênh Chi payOS.');
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const manualMutation = useMutation({
    mutationFn: async ({ values, file }: { values: ManualValues; file: File }) => {
      const upload = await profileService.uploadFile(file, 'refund-receipts');
      if (!upload.data) throw new Error(upload.error || 'Không thể tải ảnh biên nhận lên.');
      return paymentService.completeManualRefund(
        refund.refundTransactionId,
        values.bankReference,
        upload.data,
        values.note
      );
    },
    onSuccess: () => {
      toast.success('Đã gửi biên nhận. Refund đang chờ admin xác minh.');
      setShowManual(false);
      setReceiptFile(null);
      form.reset();
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canProcess) return null;

  return (
    <div className="mt-4 border-t border-[#EFEDE7] pt-4">
      {!hasDestination ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-[#6F7E72]">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Chờ khách cập nhật tài khoản nhận
          tiền.
        </p>
      ) : (
        <>
          {manualFallbackAvailable && (
            <p className="mb-3 flex items-start gap-2.5 text-[11px] font-medium leading-relaxed text-[#6F7E72]">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>
                {refund.automaticPayoutAvailable
                  ? 'Lệnh hoàn tự động chưa thành công. Vendor có thể chuyển thủ công đúng '
                  : 'Chưa có Kênh Chi payOS hoạt động. Vendor cần chuyển đúng '}
                <strong className="font-extrabold text-[#1E3932]">{money(refund.amount)}</strong>{' '}
                tới tài khoản hiển thị ở trên, sau đó gửi mã tham chiếu và ảnh biên nhận để admin
                xác minh.
              </span>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {refund.automaticPayoutAvailable && (
              <button
                type="button"
                disabled={gatewayMutation.isPending}
                onClick={() => gatewayMutation.mutate()}
                className={PRIMARY_BUTTON}
              >
                {gatewayMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Chi tự động qua payOS
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowManual((value) => !value)}
              className={SECONDARY_BUTTON}
            >
              Đã chuyển tiền, gửi biên nhận
            </button>
          </div>
        </>
      )}

      {showManual && hasDestination && (
        <form
          onSubmit={form.handleSubmit((values) => {
            if (!receiptFile) {
              toast.error('Vui lòng chọn ảnh biên nhận chuyển khoản.');
              return;
            }
            manualMutation.mutate({ values, file: receiptFile });
          })}
          className="mt-4 rounded-2xl border border-[#E7E5DE] bg-[#FAF9F6] p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={FIELD_LABEL}>
              Mã tham chiếu ngân hàng
              <input {...form.register('bankReference')} className={FIELD_INPUT} />
              {form.formState.errors.bankReference && (
                <span className={FIELD_ERROR}>{form.formState.errors.bankReference.message}</span>
              )}
            </label>
            <label className={FIELD_LABEL}>
              Ghi chú
              <input {...form.register('note')} className={FIELD_INPUT} />
            </label>
            <label className={`${FIELD_LABEL} sm:col-span-2`}>
              Ảnh biên nhận chuyển khoản
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
                className="mt-1.5 block w-full rounded-xl border border-[#E7E5DE] bg-white px-3 py-2 text-xs text-[#5A6B62] file:mr-3 file:rounded-full file:border-0 file:bg-[#F2F0EB] file:px-3 file:py-1 file:font-bold file:text-[#1E3932]"
              />
              <span className="mt-1.5 block text-[10px] font-medium text-[#8E9A93]">
                Biên nhận chỉ là bằng chứng gửi duyệt; refund chỉ hoàn tất sau khi admin xác minh.
              </span>
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={manualMutation.isPending} className={PRIMARY_BUTTON}>
              {manualMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Gửi biên nhận để admin duyệt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function BookingFinancialTimeline({
  bookingId,
  audience,
  canManageRefunds = false,
  view = 'all',
}: BookingFinancialTimelineProps) {
  const queryClient = useQueryClient();
  const showPayments = view !== 'refunds';
  const showRefunds = view !== 'payments';
  const payments = useQuery({
    queryKey: ['booking-payments', bookingId],
    queryFn: () => paymentService.getPayments(bookingId),
    enabled: showPayments,
  });
  const refunds = useQuery({
    queryKey: ['booking-refunds', bookingId],
    queryFn: () => paymentService.getRefunds(bookingId),
    enabled: showRefunds,
    refetchInterval: (query) =>
      query.state.data?.some((item) => item.status === 'PROCESSING') ? 5_000 : false,
  });
  const refundItems = refunds.data ?? [];
  const hasVendorInitiatedRefund = refundItems.some((refund) =>
    ['VENDOR_CANCEL', 'INSUFFICIENT_PAX'].includes(refund.reason)
  );

  function refreshRefunds() {
    queryClient.invalidateQueries({ queryKey: ['booking-refunds', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['booking-detail', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
  }

  return (
    <AppCard className="rounded-3xl border-[#E7E5DE] bg-white p-5 shadow-none sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-[#0B3025]">
            {view === 'payments'
              ? 'Lịch sử thanh toán'
              : view === 'refunds'
                ? 'Xử lý hoàn tiền'
                : 'Thanh toán & hoàn tiền'}
          </h2>
          <p className="mt-1 text-xs font-medium text-[#6F7E72]">
            {view === 'refunds'
              ? 'Theo dõi tài khoản nhận tiền và xử lý từng yêu cầu.'
              : audience === 'trekker'
                ? 'Theo dõi các khoản đã thanh toán và tiến độ hoàn tiền.'
                : 'Gồm cả giao dịch payOS và dữ liệu chuyển khoản cũ.'}
          </p>
        </div>
        {((showPayments && payments.isFetching) || (showRefunds && refunds.isFetching)) && (
          <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-[#A6AFA9]" />
        )}
      </div>

      <div className="mt-5">
        {showPayments && (
          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8E9A93]">
                Lịch sử thanh toán
              </h3>
              <span className="text-[11px] font-bold text-[#A6AFA9]">
                {(payments.data ?? []).length} giao dịch
              </span>
            </div>

            <div>
              {(payments.data ?? []).length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-[#E0DDD4] bg-[#FAF9F6] p-6 text-center">
                  <ReceiptText className="mx-auto h-5 w-5 text-[#A6AFA9]" />
                  <p className="mt-2 text-xs font-semibold text-[#8E9A93]">
                    Chưa phát sinh giao dịch thanh toán
                  </p>
                </div>
              ) : (
                payments.data?.map((payment) => {
                  const isLegacy = payment.source === 'LEGACY_BANK_TRANSFER';
                  return (
                    <div
                      key={payment.paymentTransactionId}
                      className="flex flex-col gap-3 border-b border-[#F2F0EB] py-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E5DE] bg-[#FAF9F6]">
                          {payment.status === 'PAID' ? (
                            <CheckCircle2 className={`h-4 w-4 ${iconTone(payment.status)}`} />
                          ) : ['FAILED', 'CANCELLED', 'EXPIRED'].includes(payment.status) ? (
                            <XCircle className={`h-4 w-4 ${iconTone(payment.status)}`} />
                          ) : (
                            <Clock3 className={`h-4 w-4 ${iconTone(payment.status)}`} />
                          )}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-extrabold text-[#1E3932]">
                              {isLegacy
                                ? 'Chuyển khoản ngân hàng (đơn cũ)'
                                : paymentLabels[payment.paymentStage]}
                            </p>
                            <StatusChip
                              status={payment.status}
                              label={paymentLabels[payment.status]}
                            />
                          </div>
                          <p className="mt-1.5 text-xs font-medium text-[#8E9A93]">
                            {isLegacy
                              ? `Dữ liệu trước khi tích hợp payOS · ${dateTime(payment.createdAt)}`
                              : `Mã giao dịch ${payment.orderCode ?? '—'} · Lần thử ${payment.attemptNumber}`}
                          </p>
                          {payment.failureMessage && (
                            <p className="mt-1 text-xs font-semibold text-red-600">
                              {payment.failureMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pl-12 text-left sm:pl-0 sm:text-right">
                        <p className="text-base font-extrabold tabular-nums text-[#1E3932]">
                          {money(payment.amount)}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-[#A6AFA9]">
                          {transactionTimeLabel(payment.status, payment.paidAt, payment.expiredAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {showRefunds && (view === 'refunds' || (refunds.data ?? []).length > 0) && (
          <div className={showPayments ? 'mt-8 border-t border-[#F2F0EB] pt-6' : ''}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8E9A93]">
                {audience === 'trekker' ? 'Khoản hoàn tiền' : 'Yêu cầu cần hoàn tiền'}
              </h3>
              <span className="text-[11px] font-bold text-[#A6AFA9]">
                {refundItems.length} khoản
              </span>
            </div>
            {audience === 'trekker' && hasVendorInitiatedRefund && (
              <p className="mb-4 flex items-start gap-2.5 text-[11px] font-medium leading-relaxed text-[#6F7E72]">
                <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-[#1E3932]" />
                <span>
                  <strong className="font-extrabold text-[#1E3932]">
                    Khoản hoàn được tạo tự động.
                  </strong>{' '}
                  Nhà tổ chức đã hủy đơn sau khi bạn thanh toán. TrekSphere đã tự động tạo khoản
                  hoàn này; bạn không cần gửi thêm yêu cầu.
                </span>
              </p>
            )}
            <div className="space-y-3">
              {refundItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E0DDD4] bg-[#FAF9F6] p-6 text-center">
                  <RotateCcw className="mx-auto h-5 w-5 text-[#A6AFA9]" />
                  <p className="mt-2 text-xs font-semibold text-[#8E9A93]">
                    Đơn này chưa phát sinh khoản hoàn tiền.
                  </p>
                </div>
              ) : (
                refundItems.map((refund) => (
                  <div
                    key={refund.refundTransactionId}
                    className="rounded-2xl border border-[#E7E5DE] bg-white p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="text-xl font-extrabold tracking-tight tabular-nums text-[#0B3025]">
                            {money(refund.amount)}
                          </p>
                          <StatusChip
                            status={refund.status}
                            label={
                              audience === 'trekker' && refund.status === 'AWAITING_VENDOR_ACTION'
                                ? 'Chờ nhà tổ chức chuyển khoản'
                                : paymentLabels[refund.status]
                            }
                          />
                        </div>
                        <p className="mt-2 text-xs font-semibold text-[#5A6B62]">
                          {refund.reasonDetail ||
                            refundReasonLabels[refund.reason] ||
                            refund.reason}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-[#A6AFA9]">
                          Tạo lúc {dateTime(refund.requestedAt)}
                        </p>
                        {refund.failureMessage && (
                          <p className="mt-1.5 text-xs font-semibold text-red-600">
                            {refund.failureMessage}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 rounded-2xl bg-[#FAF9F6] px-4 py-3 sm:min-w-[224px]">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#A6AFA9]">
                          Tài khoản nhận hoàn
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xs font-bold text-[#1E3932]">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-[#A6AFA9]" />
                          {refund.destinationBin
                            ? `Ngân hàng · BIN ${refund.destinationBin}`
                            : 'Chưa có ngân hàng'}
                        </p>
                        {visibleRefundAccountNumber(refund, audience) && (
                          <p className="mt-1.5 text-xs font-semibold tabular-nums text-[#5A6B62]">
                            {visibleRefundAccountNumber(refund, audience)}
                            {refund.destinationAccountName && (
                              <span className="text-[#8E9A93]">
                                {' · '}
                                {refund.destinationAccountName}
                              </span>
                            )}
                          </p>
                        )}
                        {audience === 'trekker' &&
                          ['VENDOR_CANCEL', 'INSUFFICIENT_PAX'].includes(refund.reason) && (
                            <p className="mt-2 text-[10px] font-medium text-[#A6AFA9]">
                              Lấy từ tài khoản đã dùng để thanh toán đơn.
                            </p>
                          )}
                      </div>
                    </div>

                    {refund.dueAt && !['REFUNDED', 'CANCELLED'].includes(refund.status) && (
                      <NoteRow
                        icon={refund.status === 'OVERDUE' ? AlertTriangle : Clock3}
                        tone={refund.status === 'OVERDUE' ? 'danger' : 'muted'}
                      >
                        <span className="font-bold">
                          {audience === 'trekker' ? 'Hạn nhà tổ chức xử lý' : 'Hạn xử lý'}:{' '}
                          {dateTime(refund.dueAt)}
                        </span>{' '}
                        · {deadlineText(refund.dueAt)}. Đây là hạn chuyển tiền hoặc gửi biên nhận,
                        không phải cam kết tiền đã về tài khoản ngân hàng.
                      </NoteRow>
                    )}

                    {refund.status === 'MANUAL_REVIEW' && (
                      <NoteRow icon={ShieldCheck}>
                        Vendor đã gửi biên nhận lúc {dateTime(refund.manualSubmittedAt)}. Admin đang
                        đối soát trước khi xác nhận hoàn tiền.
                        {refund.manualReceiptUrl && audience === 'vendor' && (
                          <a
                            href={refund.manualReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1 font-bold text-[#1E3932] underline underline-offset-2"
                          >
                            Xem biên nhận
                          </a>
                        )}
                      </NoteRow>
                    )}

                    {refund.adminReviewNote && (
                      <NoteRow icon={ReceiptText}>
                        <span className="font-bold">Phản hồi đối soát:</span>{' '}
                        {refund.adminReviewNote}
                      </NoteRow>
                    )}

                    {audience === 'trekker' &&
                      ['PENDING', 'FAILED', 'AWAITING_VENDOR_ACTION', 'OVERDUE'].includes(
                        refund.status
                      ) &&
                      (!refund.destinationBin ||
                        !refund.destinationAccountNumber ||
                        !refund.destinationAccountName) && (
                        <RefundDestinationForm refund={refund} onSaved={refreshRefunds} />
                      )}

                    {audience === 'vendor' && canManageRefunds && (
                      <VendorRefundActions refund={refund} onSaved={refreshRefunds} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {(showPayments && payments.isError) || (showRefunds && refunds.isError) ? (
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-600">
            <ReceiptText className="h-4 w-4" /> Không thể tải đầy đủ lịch sử tài chính.
          </p>
        ) : null}
      </div>
    </AppCard>
  );
}
