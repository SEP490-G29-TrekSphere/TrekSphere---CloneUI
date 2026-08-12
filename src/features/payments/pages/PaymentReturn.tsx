import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBookingDetailPath, getBookingPaymentPath, PATHS } from '@/constants/paths';
import { getPaymentReturnState } from '@/features/payments/utils/paymentState';
import { tourService } from '@/features/tours/services/tourService';
import { AppCard } from '@/shared/ui';

export default function PaymentReturn({ cancelled = false }: { cancelled?: boolean }) {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') ?? '';
  const bookingQuery = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: () => tourService.getBookingDetail(bookingId),
    enabled: Boolean(bookingId) && !cancelled,
    refetchInterval: (query) => (query.state.data?.paymentStatus === 'UNPAID' ? 2_500 : false),
  });
  const returnState = getPaymentReturnState(bookingQuery.data?.paymentStatus);
  const confirmed = returnState === 'CONFIRMED';
  const refundPending = returnState === 'REFUND_PENDING';
  const refunded = returnState === 'REFUNDED';
  const invalidReturn = !cancelled && !bookingId;
  const failedToConfirm = !cancelled && Boolean(bookingId) && bookingQuery.isError;
  const showError = invalidReturn || failedToConfirm;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F2F0EB] px-4 py-10">
      <AppCard className="w-full max-w-lg overflow-hidden rounded-[32px] border-[#DED9CA] bg-white p-0 text-center shadow-[0_18px_55px_rgba(30,57,50,0.09)]">
        <div className="border-b border-[#EAE6DC] bg-[#FBF8F0] px-6 py-8 sm:px-8">
          <span
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border ${
              cancelled || showError || refundPending
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : refunded
                  ? 'border-slate-200 bg-slate-50 text-slate-700'
                  : confirmed
                    ? 'border-emerald-200 bg-emerald-50 text-[#006241]'
                    : 'border-[#CFE0D5] bg-[#F3F8F5] text-[#1E3932]'
            }`}
          >
            {cancelled || showError || refundPending ? (
              <AlertCircle className="h-9 w-9" />
            ) : refunded ? (
              <ReceiptText className="h-9 w-9" />
            ) : confirmed ? (
              <CheckCircle2 className="h-9 w-9" />
            ) : (
              <Loader2 className="h-9 w-9 animate-spin" />
            )}
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#1E3932]">
            {cancelled
              ? 'Bạn đã dừng thanh toán'
              : showError
                ? 'Chưa thể xác nhận giao dịch'
                : refundPending
                  ? 'Giao dịch đang được hoàn lại'
                  : refunded
                    ? 'Giao dịch đã được hoàn tiền'
                    : confirmed
                      ? 'Thanh toán thành công'
                      : 'Đang xác nhận giao dịch'}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-[#6F7E72]">
            {cancelled
              ? 'Bạn chưa bị ghi nhận thanh toán. Đơn vẫn được giữ nếu còn trong thời hạn cho phép.'
              : showError
                ? 'Thông tin trả về chưa đầy đủ hoặc đơn không thể truy cập. Bạn có thể mở danh sách đơn để kiểm tra.'
                : refundPending
                  ? 'Khoản tiền đến khi đơn không còn đủ điều kiện thanh toán. TrekSphere đã tạo yêu cầu hoàn tiền và không ghi nhận booking là đã thanh toán.'
                  : refunded
                    ? 'Khoản tiền đã được hoàn. Bạn có thể mở chi tiết đơn để kiểm tra lịch sử giao dịch.'
                    : confirmed
                      ? 'payOS đã xác nhận và TrekSphere đã cập nhật số tiền vào đơn của bạn.'
                      : 'TrekSphere đang chờ xác nhận an toàn từ payOS. Quá trình này thường chỉ mất vài giây.'}
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {!cancelled && !showError && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-[#CFE0D5] bg-[#F3F8F5] p-4 text-left">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#006241]" />
              <p className="text-xs font-medium leading-relaxed text-[#56655F]">
                Không cần tải ảnh chuyển khoản. Trạng thái được đối soát tự động để tránh xác nhận
                nhầm giao dịch.
              </p>
            </div>
          )}

          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            {bookingId ? (
              <>
                <Link
                  to={getBookingDetailPath(bookingId)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006241] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#004F35]"
                >
                  <ReceiptText className="h-4 w-4" /> Xem chi tiết đơn
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {(cancelled || (!confirmed && !refundPending && !refunded)) && (
                  <Link
                    to={getBookingPaymentPath(bookingId)}
                    className="rounded-full border border-[#D8D3C4] px-5 py-3 text-sm font-extrabold text-[#1E3932] transition-colors hover:bg-[#FBF8F0]"
                  >
                    Quay lại thanh toán
                  </Link>
                )}
              </>
            ) : (
              <Link
                to={PATHS.MY_TOURS}
                className="rounded-full bg-[#006241] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#004F35]"
              >
                Xem tour đã đặt
              </Link>
            )}
          </div>
        </div>
      </AppCard>
    </div>
  );
}
