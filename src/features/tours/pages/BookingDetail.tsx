import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileImage,
  Mail,
  PenSquare,
  Phone,
  ShieldCheck,
  Star,
  Upload,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getBookingPaymentPath } from '@/constants/paths';
// import { profileService } from '@/features/profile/services/profileService';
import { BookingSosPanel } from '@/features/tours/components/BookingSosPanel';
import { useBookingCountdown } from '@/features/tours/hooks/useBookingCountdown';
import { PAYMENT_DEADLINE_SECONDS, tourService } from '@/features/tours/services/tourService';
import type { BookingDetailResponse } from '@/features/tours/types';
import { AppButton, AppCard, ConfirmActionDialog } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatCountdown, formatDate, formatPrice } from '@/utils/format';
import { getCurrentPosition } from '@/utils/geolocation';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

const GENDER_MAP: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export default function BookingDetail() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [reasonError, setReasonError] = useState('');

  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [updatingProof, setUpdatingProof] = useState(false);
  const [proofError, setProofError] = useState('');

  const [pendingSos, setPendingSos] = useState<{ message?: string } | null>(null);
  const [sendingSos, setSendingSos] = useState(false);
  const [sosSentAt, setSosSentAt] = useState<string | undefined>(undefined);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const isPendingPayment =
    booking?.bookingStatus === 'PENDING' &&
    booking?.paymentStatus === 'PENDING' &&
    !booking?.proofImageUrl;

  const isAwaitingVendorApproval =
    booking?.bookingStatus === 'PENDING' &&
    booking?.paymentStatus === 'PENDING' &&
    Boolean(booking?.proofImageUrl);

  const timeLeft = useBookingCountdown(
    booking?.createdAt,
    isPendingPayment,
    PAYMENT_DEADLINE_SECONDS
  );

  useEffect(() => {
    return () => {
      if (proofPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(proofPreviewUrl);
      }
    };
  }, [proofPreviewUrl]);

  useEffect(() => {
    async function fetchDetail() {
      if (!bookingId) return;
      setLoading(true);
      try {
        const data = await tourService.getBookingDetail(bookingId);
        setBooking(data);
      } catch {
        toast.error('Không thể tải chi tiết đơn đặt chỗ');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [bookingId]);

  const handleWriteReview = () => {
    setReviewRating(5);
    setReviewContent('');
    setReviewError('');
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!booking) return;
    const trimmedContent = reviewContent.trim();
    if (!trimmedContent) {
      setReviewError('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    setReviewError('');
    setSubmittingReview(true);
    try {
      await tourService.createReview({
        bookingId: booking.bookingId,
        rating: reviewRating,
        content: trimmedContent,
      });
      // Update local booking state so review button updates to "Đã đánh giá"
      setBooking({
        ...booking,
        reviewed: true,
      });
      setIsReviewModalOpen(false);
      toast.success('Gửi đánh giá thành công! Đánh giá đang được kiểm duyệt.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRequestSos = (message?: string) => setPendingSos({ message });

  const handleConfirmSendSos = async () => {
    if (!booking?.tourSessionId) return;
    setSendingSos(true);
    try {
      const position = await getCurrentPosition();
      const result = await tourService.sendSos({
        tourSessionId: booking.tourSessionId,
        ...position,
        message: pendingSos?.message,
      });
      setSosSentAt(result.createdAt);
      toast.success('Đã gửi tín hiệu SOS tới đội cứu hộ.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi tín hiệu SOS.');
    } finally {
      setSendingSos(false);
      setPendingSos(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking) return;
    const trimmedReason = cancellationReason.trim();
    if (!trimmedReason) {
      setReasonError('Vui lòng nhập lý do hủy đặt tour.');
      return;
    }

    setReasonError('');
    setCancelling(true);
    try {
      const updatedBooking = await tourService.cancelBooking(booking.bookingId, trimmedReason);
      setBooking(updatedBooking);
      setIsCancelModalOpen(false);
      setCancellationReason('');
      toast.success('Hủy đặt tour thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy đặt tour. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProofError('Kích thước file vượt quá giới hạn 5MB.');
      return;
    }

    setProofError('');
    setProofFile(file);
    if (proofPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(proofPreviewUrl);
    }
    setProofPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirmUpdateProof = async () => {
    if (!booking) return;
    if (!proofFile) {
      setProofError('Vui lòng chọn ảnh minh chứng thanh toán.');
      return;
    }

    setProofError('');
    setUpdatingProof(true);
    try {
      const updatedBooking = await tourService.updatePaymentProof(booking.bookingId, proofFile);
      setBooking(updatedBooking);
      setIsProofModalOpen(false);
      setProofFile(null);
      setProofPreviewUrl('');
      toast.success('Cập nhật minh chứng thanh toán thành công');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Không thể cập nhật minh chứng. Vui lòng thử lại.'
      );
    } finally {
      setUpdatingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAF9F5]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B3025] border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-md py-20 text-center bg-[#FAF9F5] px-4">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-extrabold text-[#0B3025]">Không tìm thấy thông tin đặt chỗ</h2>
        <p className="text-zinc-500 font-semibold text-sm mt-2">
          Vui lòng kiểm tra lại mã đơn hoặc quay về danh sách đơn đặt.
        </p>
        <AppButton onClick={() => navigate('/my-tours')} className="mt-6">
          Quay lại danh sách tour
        </AppButton>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back navigation & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E4DE] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-tours')}
            aria-label="Quay lại danh sách tour"
            className="p-2 hover:bg-white border border-transparent hover:border-[#E5E4DE] rounded-full transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-700" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3025]">
              Chi tiết Đặt Tour
            </h1>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">
              Mã đơn:{' '}
              <span className="text-zinc-800 font-extrabold">
                {booking.bookingCode || booking.bookingId}
              </span>
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Booking Status Badge */}
          {booking.bookingStatus === 'PENDING' && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold">
              <Clock className="w-3.5 h-3.5" />
              Đang chờ xác nhận
            </span>
          )}
          {booking.bookingStatus === 'CONFIRMED' && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã xác nhận
            </span>
          )}
          {booking.bookingStatus === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Đã hoàn thành
            </span>
          )}
          {booking.bookingStatus === 'CANCELLED' && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-extrabold">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Đã hủy
            </span>
          )}

          {/* Payment Status Badge */}
          {booking.paymentStatus === 'PAID' && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold">
              <CreditCard className="w-3.5 h-3.5" />
              Đã thanh toán
            </span>
          )}
          {booking.paymentStatus === 'PENDING' && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold">
              <CreditCard className="w-3.5 h-3.5" />
              Đang chờ Vendor duyệt thanh toán
            </span>
          )}
          {booking.paymentStatus === 'REFUNDED' && (
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Đã hoàn tiền
            </span>
          )}
          {booking.paymentStatus === 'PARTIALLY_REFUNDED' && (
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Hoàn tiền 1 phần
            </span>
          )}
        </div>
      </div>

      {/* Countdown notification for pending payment */}
      {isPendingPayment && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 animate-pulse" />
            <div>
              <p className="text-xs font-extrabold text-amber-900">Đơn hàng đang chờ thanh toán!</p>
              <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                Vui lòng hoàn tất thanh toán và tải lên minh chứng trong vòng 15 phút để bảo đảm giữ
                chỗ.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-extrabold text-amber-900 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-amber-200">
              {formatCountdown(timeLeft)}
            </span>
            <AppButton
              onClick={() => navigate(getBookingPaymentPath(booking.bookingId))}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs border-none"
            >
              Thanh toán ngay
            </AppButton>
          </div>
        </div>
      )}

      {/* Awaiting vendor approval notification */}
      {isAwaitingVendorApproval && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-3xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-800 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-blue-900">
                Đã tải lên minh chứng thanh toán!
              </p>
              <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                Đơn hàng của bạn đã gửi minh chứng thành công và đang chờ Nhà cung cấp (Vendor)
                duyệt thanh toán.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Main Details Left Column */}
        <div className="space-y-6">
          {/* Tour Banner Card */}
          <AppCard className="overflow-hidden border-[#E5E4DE] rounded-3xl bg-white shadow-sm">
            <div className="relative aspect-video w-full bg-zinc-100">
              <img
                src={booking.coverImageUrl || FALLBACK_IMAGE}
                alt={booking.tourName}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }
                }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                  {booking.tourName}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#FAF9F5]/50 border-t border-[#F4F4F2]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E4DE] text-zinc-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-zinc-400 block uppercase tracking-wider">
                    Lịch trình khởi hành
                  </span>
                  <span className="text-zinc-800 font-bold text-xs">
                    {formatDate(booking.departureDate)}
                    {booking.returnDate ? ` — ${formatDate(booking.returnDate)}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E4DE] text-zinc-600">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-zinc-400 block uppercase tracking-wider">
                    Số lượng chỗ
                  </span>
                  <span className="text-zinc-800 font-bold text-xs">
                    {booking.numberOfParticipants} người tham gia
                  </span>
                </div>
              </div>
            </div>
          </AppCard>

          {/* Booker Information */}
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F4F4F2] pb-3">
              <User className="h-4 w-4 text-[#0B3025]" />
              <h3 className="font-extrabold text-zinc-800 text-base">Thông tin người đặt tour</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 font-bold block mb-1">Họ và tên</span>
                <span className="text-zinc-800 font-extrabold">{booking.userFullName || '—'}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-bold block mb-1">Email liên hệ</span>
                <span className="text-zinc-800 font-extrabold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  {booking.userEmail || '—'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 font-bold block mb-1">Số điện thoại</span>
                <span className="text-zinc-800 font-extrabold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  {booking.userPhone || '—'}
                </span>
              </div>
            </div>
          </AppCard>

          {/* Participants List */}
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F4F4F2] pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0B3025]" />
                <h3 className="font-extrabold text-zinc-800 text-base">
                  Danh sách khách tham gia ({booking.participants?.length || 0})
                </h3>
              </div>
            </div>

            {booking.participants && booking.participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F4F4F2] text-zinc-400 font-extrabold uppercase text-[10px]">
                      <th className="py-2.5 px-2">STT</th>
                      <th className="py-2.5 px-2">Họ tên</th>
                      <th className="py-2.5 px-2">Giới tính</th>
                      <th className="py-2.5 px-2">Ngày sinh</th>
                      <th className="py-2.5 px-2">Số điện thoại</th>
                      <th className="py-2.5 px-2">Email / CMND</th>
                      <th className="py-2.5 px-2">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F2]">
                    {booking.participants.map((p, idx) => (
                      <tr
                        key={p.participantId || `participant-${idx}`}
                        className="text-zinc-700 font-bold"
                      >
                        <td className="py-3 px-2 text-zinc-400">{idx + 1}</td>
                        <td className="py-3 px-2 text-zinc-900 font-extrabold">{p.fullName}</td>
                        <td className="py-3 px-2">
                          {p.gender ? GENDER_MAP[p.gender] || p.gender : '—'}
                        </td>
                        <td className="py-3 px-2">
                          {p.dateOfBirth ? formatDate(p.dateOfBirth) : '—'}
                        </td>
                        <td className="py-3 px-2">{p.phone || '—'}</td>
                        <td className="py-3 px-2">
                          <div>{p.email || '—'}</div>
                          {p.idNumber && (
                            <div className="text-[10px] text-zinc-400 font-semibold">
                              CCCD: {p.idNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-zinc-500 font-normal">
                          {p.specialRequirements || 'Không'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 font-medium py-2">
                Chưa có thông tin chi tiết danh sách người tham gia.
              </p>
            )}
          </AppCard>

          {/* Proof of Payment Image (if available) */}
          {booking.proofImageUrl && (
            <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F4F4F2] pb-3">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-[#0B3025]" />
                  <h3 className="font-extrabold text-zinc-800 text-base">Minh chứng thanh toán</h3>
                </div>
                {booking.bookingStatus === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreviewUrl(booking.proofImageUrl || '');
                      setProofError('');
                      setIsProofModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#0B3025] hover:underline cursor-pointer"
                  >
                    Cập nhật lại
                  </button>
                )}
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#E5E4DE] max-w-sm">
                <img
                  src={booking.proofImageUrl}
                  alt="Minh chứng thanh toán"
                  className="w-full max-h-72 object-contain bg-zinc-50"
                />
              </div>
            </AppCard>
          )}

          {/* Cancellation Details (if cancelled) */}
          {(booking.bookingStatus === 'CANCELLED' || booking.cancellationReason) && (
            <AppCard className="border-red-200 rounded-3xl bg-red-50/50 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-red-800 font-extrabold text-base border-b border-red-100 pb-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3>Thông tin hủy đơn</h3>
              </div>
              {booking.cancelledAt && (
                <p className="text-xs font-semibold text-zinc-600">
                  Thời gian hủy:{' '}
                  <span className="font-extrabold text-zinc-800">
                    {formatDate(booking.cancelledAt)}
                  </span>
                </p>
              )}
              {booking.cancellationReason && (
                <p className="text-xs font-semibold text-zinc-600">
                  Lý do hủy:{' '}
                  <span className="font-bold text-zinc-800">{booking.cancellationReason}</span>
                </p>
              )}
              {booking.refundAmount > 0 && (
                <p className="text-xs font-semibold text-zinc-600">
                  Số tiền hoàn lại:{' '}
                  <span className="font-extrabold text-red-600">
                    {formatPrice(booking.refundAmount)} VNĐ
                  </span>
                </p>
              )}
            </AppCard>
          )}
        </div>

        {/* Pricing & Actions Right Column */}
        <div className="space-y-6">
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2]">
              Tóm tắt chi phí
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-zinc-500 font-semibold">
                <span>Đơn giá / slot</span>
                <span className="text-zinc-800 font-bold">
                  {formatPrice(booking.pricePerSlot || 0)} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 font-semibold">
                <span>Số lượng khách</span>
                <span className="text-zinc-800 font-bold">
                  x{booking.numberOfParticipants || 1}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 font-semibold">
                <span>Tổng tiền ban đầu</span>
                <span className="text-zinc-800 font-bold">
                  {formatPrice(
                    booking.originalPrice || booking.pricePerSlot * booking.numberOfParticipants
                  )}{' '}
                  VNĐ
                </span>
              </div>

              {booking.discountAmount > 0 && (
                <div className="flex justify-between items-center text-zinc-500 font-semibold">
                  <span>Giảm giá {booking.voucherCode ? `(${booking.voucherCode})` : ''}</span>
                  <span className="text-emerald-600 font-extrabold">
                    -{formatPrice(booking.discountAmount)} VNĐ
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-900 font-extrabold text-base pt-3 border-t border-dashed border-[#E5E4DE]">
                <span>Tổng thanh toán</span>
                <span className="text-lg text-[#0B3025] font-black">
                  {formatPrice(booking.totalPrice)} VNĐ
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {isPendingPayment && (
                <AppButton
                  onClick={() => navigate(getBookingPaymentPath(booking.bookingId))}
                  className="w-full bg-[#0B3025] hover:bg-[#072019] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors border-none text-xs"
                >
                  <CreditCard className="h-4 w-4" />
                  Thanh toán ngay
                </AppButton>
              )}

              {booking.bookingStatus === 'COMPLETED' && (
                <AppButton
                  onClick={handleWriteReview}
                  disabled={booking.reviewed}
                  className={`w-full font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors border-none text-xs cursor-pointer ${
                    booking.reviewed
                      ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed hover:bg-zinc-200'
                      : 'bg-[#0B3025] hover:bg-[#072019] text-white'
                  }`}
                >
                  <PenSquare className="h-4 w-4" />
                  {booking.reviewed ? 'Đã đánh giá' : 'Viết đánh giá'}
                </AppButton>
              )}

              {(booking.bookingStatus === 'PENDING' || booking.bookingStatus === 'CONFIRMED') && (
                <AppButton
                  onClick={() => {
                    setReasonError('');
                    setIsCancelModalOpen(true);
                  }}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors border-none text-xs cursor-pointer"
                >
                  <XCircle className="h-4 w-4 text-white" />
                  Hủy đặt tour
                </AppButton>
              )}
            </div>
          </AppCard>

          {booking.bookingStatus === 'CONFIRMED' && booking.tourSessionId && (
            <BookingSosPanel
              onSendSos={handleRequestSos}
              isSending={sendingSos}
              lastSentAt={sosSentAt}
            />
          )}

          {/* Additional info badge */}
          <div className="p-5 bg-white border border-[#E5E4DE] rounded-3xl text-zinc-500 font-semibold text-xs space-y-2">
            <div className="flex items-center gap-2 text-zinc-800 font-bold">
              <ShieldCheck className="h-4 w-4 text-[#0B3025]" />
              <span>Bảo đảm từ TrekSphere</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Mọi thông tin về chuyến đi và vé sẽ được gửi trực tiếp tới email đăng ký của bạn.
            </p>
          </div>
        </div>
      </div>

      {pendingSos && (
        <ConfirmActionDialog
          title="Chia sẻ vị trí để gửi SOS"
          description='Tín hiệu SOS sẽ gửi kèm toạ độ GPS hiện tại của bạn ngay lập tức cho đội hỗ trợ. Trình duyệt có thể hỏi quyền truy cập vị trí — hãy chọn "Cho phép".'
          confirmLabel="Cho phép & Gửi SOS"
          cancelLabel="Để sau"
          variant="destructive"
          isPending={sendingSos}
          onConfirm={handleConfirmSendSos}
          onCancel={() => setPendingSos(null)}
        />
      )}

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#E5E4DE]">
          <DialogHeader className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 mb-1">
              <XCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-[#0B3025]">
              Hủy đặt tour
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 font-medium leading-relaxed">
              Số tiền hoàn lại sẽ được hệ thống tự động tính toán dựa trên thời điểm hủy và chính
              sách của tour. Vui lòng chọn hoặc nhập lý do hủy đặt tour bên dưới.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div>
              <label htmlFor="cancel-reason-input" className="block text-zinc-700 font-bold mb-2">
                Lý do hủy đơn <span className="text-red-500">*</span>
              </label>

              <textarea
                id="cancel-reason-input"
                rows={3}
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value);
                  if (e.target.value.trim()) setReasonError('');
                }}
                placeholder="Nhập chi tiết lý do bạn muốn hủy đơn..."
                className={`w-full p-3 rounded-2xl border bg-zinc-50/50 text-xs font-semibold text-zinc-800 focus:outline-none focus:bg-white transition-colors ${
                  reasonError
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-[#E5E4DE] focus:border-[#0B3025]'
                }`}
              />
              {reasonError && (
                <p className="text-[11px] text-red-500 font-bold mt-1">{reasonError}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={cancelling}
              className="flex-1 py-3 px-4 rounded-2xl border border-[#E5E4DE] text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Xác nhận hủy tour'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Payment Proof Dialog */}
      <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#E5E4DE]">
          <DialogHeader className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 mb-1">
              <FileImage className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-[#0B3025]">
              Cập nhật minh chứng thanh toán
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 font-medium leading-relaxed">
              Tải lên ảnh mới hóa đơn hoặc ảnh chụp giao dịch chuyển khoản thành công của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="flex flex-col w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#E5E4DE] rounded-2xl cursor-pointer bg-[#FAF9F5] hover:bg-zinc-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  <p className="mb-1 text-xs text-zinc-600 font-semibold">
                    <span className="text-[#0B3025] font-extrabold">Nhấp để tải lên</span> hoặc kéo
                    thả file
                  </p>
                  <p className="text-[11px] text-zinc-400 font-semibold">
                    PNG, JPG hoặc JPEG (Tối đa 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleProofFileChange}
                />
              </label>
              {proofError && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">{proofError}</p>
              )}
            </div>

            {proofPreviewUrl && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-500 font-bold">Xem trước minh chứng:</span>
                <div className="overflow-hidden rounded-2xl border border-[#E5E4DE] max-h-48 bg-zinc-50 p-2 flex justify-center">
                  <img
                    src={proofPreviewUrl}
                    alt="Xem trước minh chứng"
                    className="max-h-44 object-contain rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsProofModalOpen(false)}
              disabled={updatingProof}
              className="flex-1 py-3 px-4 rounded-2xl border border-[#E5E4DE] text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmUpdateProof}
              disabled={updatingProof || (!proofFile && !proofPreviewUrl)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0B3025] hover:bg-[#072019] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingProof ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                'Lưu minh chứng'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Writing Dialog */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#E5E4DE]">
          <DialogHeader className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 mb-1">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-[#0B3025]">
              Viết đánh giá tour
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 font-medium leading-relaxed">
              Chia sẻ trải nghiệm thực tế của bạn về chuyến đi để giúp cộng đồng Trekker có thêm
              thông tin tham khảo. Đánh giá của bạn sẽ hiển thị công khai sau khi được phê duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-3 text-xs">
            {/* Star Rating Select */}
            <div>
              <span className="block text-zinc-700 font-bold mb-2">Đánh giá của bạn</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <label htmlFor="review-content-input" className="block text-zinc-700 font-bold mb-2">
                Nội dung đánh giá <span className="text-red-500">*</span>
              </label>
              <textarea
                id="review-content-input"
                rows={4}
                value={reviewContent}
                onChange={(e) => {
                  setReviewContent(e.target.value);
                  if (e.target.value.trim()) setReviewError('');
                }}
                placeholder="Chia sẻ cảm nhận của bạn về hướng dẫn viên, cung đường trekking, chất lượng dịch vụ..."
                className={`w-full p-3 rounded-2xl border bg-zinc-50/50 text-xs font-semibold text-zinc-800 focus:outline-none focus:bg-white transition-colors ${
                  reviewError
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-[#E5E4DE] focus:border-[#0B3025]'
                }`}
              />
              {reviewError && (
                <p className="text-[11px] text-red-500 font-bold mt-1">{reviewError}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={submittingReview}
              className="flex-1 py-3 px-4 rounded-2xl border border-[#E5E4DE] text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmReview}
              disabled={submittingReview}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0B3025] hover:bg-[#072019] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submittingReview ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
