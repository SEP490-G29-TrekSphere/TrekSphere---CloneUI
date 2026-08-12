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
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { paymentService } from '@/features/payments/services/paymentService';
import type { RefundTransaction } from '@/features/payments/types';
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

function dateTime(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
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
};

const refundReasonLabels: Record<string, string> = {
  TREKKER_CANCEL: 'Khách hủy đặt tour',
  VENDOR_CANCEL: 'Nhà tổ chức hủy tour',
  INSUFFICIENT_PAX: 'Không đủ số khách khởi hành',
  NO_SHOW: 'Khách không tham gia',
  PAYMENT_ADJUSTMENT: 'Điều chỉnh thanh toán',
  OTHER: 'Lý do khác',
};

function statusTone(status: string): string {
  if (['PAID', 'REFUNDED'].includes(status)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(status)) {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  return 'border-amber-200 bg-amber-50 text-amber-800';
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
      className="mt-4 grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:grid-cols-3"
    >
      <label className="text-xs font-bold text-amber-950">
        Mã BIN ngân hàng
        <input
          {...form.register('bankBin')}
          inputMode="numeric"
          placeholder="970436"
          className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
        {form.formState.errors.bankBin && (
          <span className="mt-1 block text-[11px] text-red-600">
            {form.formState.errors.bankBin.message}
          </span>
        )}
      </label>
      <label className="text-xs font-bold text-amber-950">
        Số tài khoản
        <input
          {...form.register('accountNumber')}
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
        {form.formState.errors.accountNumber && (
          <span className="mt-1 block text-[11px] text-red-600">
            {form.formState.errors.accountNumber.message}
          </span>
        )}
      </label>
      <label className="text-xs font-bold text-amber-950">
        Tên chủ tài khoản
        <input
          {...form.register('accountName')}
          className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-amber-500"
        />
        {form.formState.errors.accountName && (
          <span className="mt-1 block text-[11px] text-red-600">
            {form.formState.errors.accountName.message}
          </span>
        )}
      </label>
      <div className="sm:col-span-3 flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
        >
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
  const form = useForm<ManualValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: { bankReference: '', note: '' },
  });
  const canProcess = ['PENDING', 'FAILED'].includes(refund.status);
  const hasDestination = Boolean(
    refund.destinationBin && refund.maskedDestinationAccountNumber && refund.destinationAccountName
  );
  const gatewayMutation = useMutation({
    mutationFn: () => paymentService.processRefund(refund.refundTransactionId),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu hoàn tiền qua PayOS.');
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const manualMutation = useMutation({
    mutationFn: (values: ManualValues) =>
      paymentService.completeManualRefund(
        refund.refundTransactionId,
        values.bankReference,
        values.note
      ),
    onSuccess: () => {
      toast.success('Đã ghi nhận hoàn tiền thủ công.');
      setShowManual(false);
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canProcess) return null;

  return (
    <div className="mt-4 border-t border-[#EEEADF] pt-4">
      {!hasDestination ? (
        <p className="flex items-center gap-2 text-xs font-bold text-amber-700">
          <AlertTriangle className="h-4 w-4" /> Chờ khách cập nhật tài khoản nhận tiền.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={gatewayMutation.isPending}
            onClick={() => gatewayMutation.mutate()}
            className="inline-flex items-center gap-2 rounded-full bg-[#06261D] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
          >
            {gatewayMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Hoàn qua PayOS
          </button>
          <button
            type="button"
            onClick={() => setShowManual((value) => !value)}
            className="rounded-full border border-[#D8D3C4] bg-white px-4 py-2 text-xs font-extrabold text-[#06261D]"
          >
            Xác nhận chuyển thủ công
          </button>
        </div>
      )}

      {showManual && hasDestination && (
        <form
          onSubmit={form.handleSubmit((values) => manualMutation.mutate(values))}
          className="mt-3 grid gap-3 rounded-2xl bg-[#F7F5EF] p-4 sm:grid-cols-2"
        >
          <label className="text-xs font-bold text-[#06261D]">
            Mã tham chiếu ngân hàng
            <input
              {...form.register('bankReference')}
              className="mt-1 w-full rounded-xl border border-[#DDD8C9] bg-white px-3 py-2 text-sm outline-none"
            />
            {form.formState.errors.bankReference && (
              <span className="mt-1 block text-[11px] text-red-600">
                {form.formState.errors.bankReference.message}
              </span>
            )}
          </label>
          <label className="text-xs font-bold text-[#06261D]">
            Ghi chú
            <input
              {...form.register('note')}
              className="mt-1 w-full rounded-xl border border-[#DDD8C9] bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={manualMutation.isPending}
            className="w-fit rounded-full bg-[#0F766E] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60 sm:col-span-2"
          >
            Xác nhận đã chuyển tiền
          </button>
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

  function refreshRefunds() {
    queryClient.invalidateQueries({ queryKey: ['booking-refunds', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['booking-detail', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
  }

  return (
    <AppCard className="rounded-2xl border-[#DED9CA] bg-white p-4 shadow-none sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-[#1E3932]">
            {view === 'payments'
              ? 'Lịch sử thanh toán'
              : view === 'refunds'
                ? 'Xử lý hoàn tiền'
                : 'Thanh toán & hoàn tiền'}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-[#6F7E72]">
            {view === 'refunds'
              ? 'Theo dõi tài khoản nhận tiền và xử lý từng yêu cầu.'
              : 'Gồm cả giao dịch payOS và dữ liệu chuyển khoản cũ.'}
          </p>
        </div>
        {((showPayments && payments.isFetching) || (showRefunds && refunds.isFetching)) && (
          <RefreshCw className="h-4 w-4 animate-spin text-[#6F7B75]" />
        )}
      </div>

      <div className="mt-4">
        {showPayments && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold text-[#1E3932]">Lịch sử thanh toán</h3>
              <span className="rounded-full bg-[#F2F0EB] px-2.5 py-1 text-[11px] font-bold text-[#6F7E72]">
                {(payments.data ?? []).length} giao dịch
              </span>
            </div>

            <div className="space-y-3">
              {(payments.data ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D9D4C6] bg-[#FBF8F0] p-5 text-center">
                  <ReceiptText className="mx-auto h-5 w-5 text-[#87918C]" />
                  <p className="mt-2 text-xs font-semibold text-[#6F7E72]">
                    Chưa phát sinh giao dịch thanh toán
                  </p>
                </div>
              ) : (
                payments.data?.map((payment) => {
                  const isLegacy = payment.source === 'LEGACY_BANK_TRANSFER';
                  return (
                    <div
                      key={payment.paymentTransactionId}
                      className="flex flex-col gap-3 border-t border-[#E8E4DA] py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${statusTone(payment.status)}`}
                        >
                          {payment.status === 'PAID' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : ['FAILED', 'CANCELLED', 'EXPIRED'].includes(payment.status) ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Clock3 className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-extrabold text-[#1E3932]">
                              {isLegacy
                                ? 'Chuyển khoản ngân hàng (đơn cũ)'
                                : paymentLabels[payment.paymentStage]}
                            </p>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${statusTone(payment.status)}`}
                            >
                              {paymentLabels[payment.status]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium text-[#6F7E72]">
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
                      <div className="text-left sm:text-right">
                        <p className="text-base font-extrabold text-[#1E3932]">
                          {money(payment.amount)}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-[#6F7E72]">
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
          <div className={showPayments ? 'mt-7 border-t border-[#EAE6DC] pt-6' : ''}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-[#006241]" />
                <h3 className="text-sm font-extrabold text-[#1E3932]">Yêu cầu hoàn tiền</h3>
              </div>
              <span className="rounded-full bg-[#E7F3EC] px-2.5 py-1 text-[11px] font-bold text-[#006241]">
                {(refunds.data ?? []).length} yêu cầu
              </span>
            </div>
            <div className="space-y-3">
              {(refunds.data ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D9D4C6] bg-[#FBF8F0] p-6 text-center">
                  <RotateCcw className="mx-auto h-5 w-5 text-[#87918C]" />
                  <p className="mt-2 text-xs font-semibold text-[#6F7E72]">
                    Đơn này chưa phát sinh yêu cầu hoàn tiền.
                  </p>
                </div>
              ) : (
                refunds.data?.map((refund) => (
                  <div
                    key={refund.refundTransactionId}
                    className="rounded-2xl border border-[#D5E4DB] bg-[#F3F8F5] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-extrabold text-[#1E3932]">
                            {money(refund.amount)}
                          </p>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${statusTone(refund.status)}`}
                          >
                            {paymentLabels[refund.status]}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-[#6F7E72]">
                          {refund.reasonDetail ||
                            refundReasonLabels[refund.reason] ||
                            refund.reason}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-[#87918C]">
                          Gửi yêu cầu lúc {dateTime(refund.requestedAt)}
                        </p>
                        {refund.failureMessage && (
                          <p className="mt-1 text-xs font-semibold text-red-600">
                            {refund.failureMessage}
                          </p>
                        )}
                      </div>
                      <div className="rounded-2xl border border-[#E3E8E4] bg-white px-3.5 py-3 text-xs text-[#50645B]">
                        <p className="flex items-center gap-1.5 font-bold">
                          <Building2 className="h-3.5 w-3.5" />
                          {refund.destinationBin || 'Chưa có ngân hàng'}
                        </p>
                        {refund.maskedDestinationAccountNumber && (
                          <p className="mt-1 font-medium">
                            {refund.maskedDestinationAccountNumber} ·{' '}
                            {refund.destinationAccountName}
                          </p>
                        )}
                      </div>
                    </div>

                    {audience === 'trekker' &&
                      ['PENDING', 'FAILED'].includes(refund.status) &&
                      (!refund.destinationBin || !refund.maskedDestinationAccountNumber) && (
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
