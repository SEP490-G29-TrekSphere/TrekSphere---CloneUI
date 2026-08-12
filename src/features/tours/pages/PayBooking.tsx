import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingDetailPath } from '@/constants/paths';
import { BookingFinancialTimeline } from '@/features/payments/components/BookingFinancialTimeline';
import { paymentService } from '@/features/payments/services/paymentService';
import type { PaymentCheckout, PaymentTransaction } from '@/features/payments/types';
import { canCreateCheckout } from '@/features/payments/utils/paymentState';
import { tourService } from '@/features/tours/services/tourService';
import { AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

function money(value: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);
}

function dateTime(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function stageLabel(stage: PaymentCheckout['paymentStage']): string {
  if (stage === 'DEPOSIT') return 'Tiền đặt cọc';
  if (stage === 'REMAINING') return 'Phần thanh toán còn lại';
  return 'Toàn bộ đơn hàng';
}

function paymentPlanLabel(plan?: string): string {
  return plan === 'DEPOSIT' ? 'Thanh toán 2 đợt' : 'Thanh toán toàn bộ';
}

function isLive(transaction: PaymentTransaction): boolean {
  return ['CREATED', 'PENDING', 'PROCESSING'].includes(transaction.status);
}

function formatCountdown(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export default function PayBooking({ backPath }: { backPath?: string }) {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState<PaymentCheckout | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const bookingQuery = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: () => tourService.getBookingDetail(bookingId as string),
    enabled: Boolean(bookingId),
    refetchInterval: (query) => {
      const status = query.state.data?.paymentStatus;
      return status === 'UNPAID' || status === 'PARTIALLY_PAID' ? 4_000 : false;
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['booking-payments', bookingId],
    queryFn: () => paymentService.getPayments(bookingId as string),
    enabled: Boolean(bookingId),
    refetchInterval: (query) => (query.state.data?.some(isLive) ? 4_000 : false),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => paymentService.createCheckout(bookingId as string),
    onSuccess: (data) => {
      setCheckout(data);
      paymentsQuery.refetch();
      bookingQuery.refetch();
    },
    onError: (error: Error) => toast.error(error.message || 'Không thể tạo phiên thanh toán.'),
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const latestLivePayment = useMemo(
    () =>
      [...(paymentsQuery.data ?? [])]
        .filter(isLive)
        .sort((a, b) => b.attemptNumber - a.attemptNumber)[0],
    [paymentsQuery.data]
  );

  const booking = bookingQuery.data;
  const canPay = Boolean(booking && canCreateCheckout(booking, now));
  const isPaid = booking?.paymentStatus === 'PAID';
  const isRefundPending = booking?.paymentStatus === 'REFUND_PENDING';
  const isRefunded = ['PARTIALLY_REFUNDED', 'REFUNDED'].includes(booking?.paymentStatus ?? '');
  const netPaid = Math.max(0, (booking?.paidAmount ?? 0) - (booking?.refundAmount ?? 0));

  useEffect(() => {
    if (
      !canPay ||
      !latestLivePayment?.checkoutUrl ||
      latestLivePayment.orderCode == null ||
      checkout
    ) {
      return;
    }
    setCheckout({
      paymentTransactionId: latestLivePayment.paymentTransactionId,
      bookingId: bookingId as string,
      paymentStage: latestLivePayment.paymentStage,
      amount: latestLivePayment.amount,
      currency: latestLivePayment.currency,
      status: latestLivePayment.status,
      orderCode: latestLivePayment.orderCode,
      checkoutUrl: latestLivePayment.checkoutUrl,
      expiredAt: latestLivePayment.expiredAt ?? new Date().toISOString(),
    });
  }, [bookingId, canPay, checkout, latestLivePayment]);

  useEffect(() => {
    if (!checkout) return;
    const currentTransaction = paymentsQuery.data?.find(
      (payment) => payment.paymentTransactionId === checkout.paymentTransactionId
    );
    if (
      !canPay ||
      isPaid ||
      isRefundPending ||
      isRefunded ||
      (currentTransaction && !isLive(currentTransaction))
    ) {
      setCheckout(null);
    }
  }, [canPay, checkout, isPaid, isRefundPending, isRefunded, paymentsQuery.data]);

  const resolvedBackPath = booking
    ? backPath
      ? backPath.replace(':bookingId', booking.bookingId)
      : getBookingDetailPath(booking.bookingId)
    : (backPath ?? '/my-tours');
  const expiresAt = checkout?.expiredAt ?? latestLivePayment?.expiredAt;
  const secondsLeft = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1_000))
    : 0;

  if (bookingQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bookingId || bookingQuery.isError || !booking) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 text-center">
        <AppCard className="w-full rounded-3xl p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-xl font-extrabold">Không thể mở phiên thanh toán</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {bookingQuery.error instanceof Error
              ? bookingQuery.error.message
              : 'Đơn đặt tour không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
          <button
            type="button"
            onClick={() => navigate(backPath ?? '/my-tours')}
            className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Quay lại
          </button>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB] py-6 sm:py-9">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(resolvedBackPath)}
          className="inline-flex items-center gap-2 rounded-full px-1 py-2 text-sm font-bold text-[#56655F] transition-colors hover:text-[#1E3932]"
        >
          <ArrowLeft className="h-4 w-4" /> Chi tiết đơn
        </button>

        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6F7E72]">
              Thanh toán bảo mật
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#1E3932]">
              Thanh toán đơn {booking.bookingCode}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#6F7E72]">{booking.tourName}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#CFE0D5] bg-white px-4 py-2 text-xs font-bold text-[#006241]">
            <ShieldCheck className="h-4 w-4" /> Thanh toán qua payOS
          </div>
        </header>

        <div className="grid overflow-hidden rounded-[24px] border border-[#DED9CA] bg-white sm:grid-cols-3">
          {[
            {
              step: '1',
              label: 'Tạo phiên thanh toán',
              complete: Boolean(checkout) || isPaid,
              active: !checkout && !isPaid,
            },
            {
              step: '2',
              label: 'Hoàn tất trên payOS',
              complete: isPaid,
              active: Boolean(checkout) && !isPaid,
            },
            {
              step: '3',
              label: 'Xác nhận tự động',
              complete: isPaid,
              active: false,
            },
          ].map(({ step, label, complete, active }, index) => (
            <div
              key={String(step)}
              className={`flex items-center gap-3 px-4 py-3.5 sm:px-5 ${
                index > 0 ? 'border-t border-[#EAE6DC] sm:border-l sm:border-t-0' : ''
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                  complete || active ? 'bg-[#006241] text-white' : 'bg-[#F2F0EB] text-[#6F7E72]'
                }`}
              >
                {complete ? <CheckCircle2 className="h-4 w-4" /> : step}
              </span>
              <p
                className={`text-xs font-bold ${
                  complete || active ? 'text-[#1E3932]' : 'text-[#87918C]'
                }`}
              >
                {String(label)}
              </p>
            </div>
          ))}
        </div>

        {isPaid && (
          <div className="flex flex-col gap-4 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-700" />
              <div>
                <h2 className="font-extrabold text-emerald-950">Thanh toán đã hoàn tất</h2>
                <p className="mt-1 text-sm font-medium text-emerald-800">
                  Hệ thống đã nhận webhook và cập nhật đơn của bạn.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(resolvedBackPath)}
              className="rounded-full bg-[#006241] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#004F35]"
            >
              Xem chi tiết đơn
            </button>
          </div>
        )}

        {isRefundPending && (
          <div className="flex items-start gap-3 rounded-[28px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
            <div>
              <h2 className="font-extrabold text-amber-950">Khoản tiền đang được hoàn lại</h2>
              <p className="mt-1 text-sm font-medium text-amber-800">
                Giao dịch đến khi đơn không còn đủ điều kiện thanh toán. Hệ thống đã ghi nhận tiền
                và tạo yêu cầu hoàn; bạn không cần tạo thêm phiên thanh toán.
              </p>
            </div>
          </div>
        )}

        {isRefunded && (
          <div className="flex items-start gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <ReceiptText className="mt-0.5 h-6 w-6 shrink-0 text-slate-700" />
            <div>
              <h2 className="font-extrabold text-slate-950">Giao dịch đã được hoàn tiền</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Xem chi tiết đơn và lịch sử tài chính để kiểm tra số tiền cùng trạng thái hoàn.
              </p>
            </div>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <AppCard className="overflow-hidden rounded-[28px] border-[#DED9CA] bg-white p-0 shadow-[0_10px_35px_rgba(30,57,50,0.06)]">
              <div className="flex items-center justify-between border-b border-[#EAE6DC] bg-[#FBF8F0] p-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E3932] text-[#FBF8F0]">
                    <WalletCards className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-extrabold text-[#1E3932]">Phiên thanh toán</h2>
                    <p className="text-xs font-medium text-[#6F7E72]">
                      Tạo phiên và hoàn tất an toàn trên payOS
                    </p>
                  </div>
                </div>
                {(paymentsQuery.isFetching || bookingQuery.isFetching) && (
                  <RefreshCw className="h-4 w-4 animate-spin text-[#6F7B75]" />
                )}
              </div>

              {!isPaid && canPay && checkout && secondsLeft > 0 ? (
                <div className="px-5 py-8 text-center sm:px-8">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#CFE0D5] bg-[#F3F8F5]">
                    <CreditCard className="h-10 w-10 text-[#006241]" />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#6F7E72]">
                    {stageLabel(checkout.paymentStage)}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-[#1E3932] sm:text-4xl">
                    {money(checkout.amount, checkout.currency || 'VND')}
                  </p>
                  <div
                    aria-live="polite"
                    className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-extrabold text-amber-900"
                  >
                    <Clock3 className="h-4 w-4" /> Còn {formatCountdown(secondsLeft)}
                  </div>
                  <a
                    href={checkout.checkoutUrl}
                    className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-[#006241] px-7 py-3.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#004F35]"
                  >
                    Tiếp tục đến payOS <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="mx-auto mt-3 max-w-md text-xs font-medium leading-relaxed text-[#6F7E72]">
                    Sau khi thanh toán, payOS sẽ đưa bạn trở lại TrekSphere và đơn được cập nhật tự
                    động.
                  </p>
                </div>
              ) : canPay && !isPaid ? (
                <div className="flex flex-col items-center px-5 py-12 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F0EB]">
                    <CreditCard className="h-7 w-7 text-[#1E3932]" />
                  </span>
                  <h3 className="mt-4 font-extrabold text-[#1E3932]">
                    {checkout && secondsLeft === 0
                      ? 'Phiên thanh toán đã hết hạn'
                      : 'Sẵn sàng thanh toán'}
                  </h3>
                  <p className="mt-1 max-w-sm text-xs font-medium leading-relaxed text-[#6F7E72]">
                    Phiên mới có đường dẫn riêng và thời hạn rõ ràng. Bạn chưa bị trừ tiền ở bước
                    này.
                  </p>
                  <button
                    type="button"
                    disabled={checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate()}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#006241] px-6 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-[#004F35] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {checkout ? 'Tạo phiên mới' : 'Tạo phiên thanh toán'}
                  </button>
                </div>
              ) : !isPaid ? (
                <div className="px-5 py-12 text-center">
                  <AlertCircle className="mx-auto h-9 w-9 text-amber-600" />
                  <h3 className="mt-3 font-extrabold text-[#1E3932]">
                    {isRefundPending
                      ? 'Đang chờ hoàn tiền'
                      : isRefunded
                        ? 'Giao dịch đã đóng'
                        : booking.onlinePaymentEnabled === false
                          ? 'Nhà tổ chức chưa kết nối payOS'
                          : 'Chưa thể thanh toán'}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#6F7E72]">
                    {isRefundPending
                      ? 'Không tạo thêm giao dịch trong khi yêu cầu hoàn tiền đang được xử lý.'
                      : isRefunded
                        ? 'Booking này không còn khoản thanh toán trực tuyến có thể thực hiện.'
                        : booking.onlinePaymentEnabled === false
                          ? 'Đơn cũ vẫn được giữ để đối chiếu, nhưng không thể tạo giao dịch payOS mới.'
                          : 'Trạng thái hiện tại của đơn không cho phép tạo giao dịch mới.'}
                  </p>
                </div>
              ) : null}
            </AppCard>

            <BookingFinancialTimeline bookingId={booking.bookingId} audience="trekker" />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <AppCard className="rounded-[28px] border-[#DED9CA] bg-white p-6 shadow-[0_10px_35px_rgba(30,57,50,0.06)]">
              <div className="flex items-center gap-2 border-b border-[#EEEADF] pb-4">
                <ReceiptText className="h-4 w-4 text-[#1E3932]" />
                <h2 className="font-extrabold text-[#1E3932]">Tóm tắt đơn hàng</h2>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#6F7B75]">Tổng giá trị</dt>
                  <dd className="font-extrabold text-[#06261D]">{money(booking.totalPrice)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#6F7B75]">Đã thanh toán</dt>
                  <dd className="font-extrabold text-emerald-700">{money(netPaid)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#EEEADF] pt-3">
                  <dt className="font-bold text-[#1E3932]">Còn lại</dt>
                  <dd className="font-extrabold text-[#1E3932]">
                    {money(Math.max(0, booking.totalPrice - netPaid))}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-[#6F7E72]">
                  <span>{paymentPlanLabel(booking.paymentPlan)}</span>
                  <span>{Math.round((netPaid / Math.max(1, booking.totalPrice)) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#F2F0EB]">
                  <div
                    className="h-full rounded-full bg-[#006241]"
                    style={{
                      width: `${Math.min(100, Math.max(0, (netPaid / Math.max(1, booking.totalPrice)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
              {booking.remainingDueAt && (
                <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                  Hạn trả phần còn lại: {dateTime(booking.remainingDueAt)}
                </p>
              )}
            </AppCard>

            <div className="rounded-[28px] border border-[#CFE0D5] bg-[#F3F8F5] p-5">
              <div className="flex items-center gap-2 text-[#006241]">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs font-extrabold uppercase tracking-wide">An toàn giao dịch</p>
              </div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#446258]">
                Trạng thái chỉ được ghi nhận từ kết nối payOS đã xác thực. TrekSphere không yêu cầu
                tải ảnh chuyển khoản thủ công.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
