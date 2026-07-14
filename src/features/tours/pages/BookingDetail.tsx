import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  Info,
  MapPin,
  PenSquare,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
import { useBookingCountdown } from '@/features/tours/hooks/useBookingCountdown';
import { type MockBooking, tourService } from '@/features/tours/services/tourService';
import { AppButton, AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatCountdown, formatDate, formatPrice } from '@/utils/format';

type Participant = MockBooking['participants'][number];

const participantFormSchema = z.object({
  participants: z.array(
    z.object({
      fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
      phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ (yêu cầu 10 chữ số)'),
      email: z.string().email('Địa chỉ email không hợp lệ'),
    })
  ),
});

const cancelSchema = z.object({
  cancelReason: z
    .string()
    .optional()
    .transform((val) => val?.trim() ?? '')
    .pipe(z.string().max(500, 'Lý do hủy tối đa 500 ký tự.')),
});

export default function BookingDetail() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<MockBooking | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      participants: [] as Participant[],
    },
  });

  const {
    register: registerCancel,
    handleSubmit: handleSubmitCancel,
    formState: { errors: cancelErrors },
  } = useForm({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      cancelReason: '',
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'participants',
  });

  const timeLeft = useBookingCountdown(booking?.createdAt, booking?.status === 'PENDING');

  useEffect(() => {
    if (timeLeft === 0 && booking?.status === 'PENDING') {
      setBooking((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      tourService.updateBookingStatus(booking.bookingId, 'CANCELLED');
      toast.error('Đã hết hạn thanh toán 15 phút! Đơn đặt tour đã tự động hủy.');
    }
  }, [timeLeft, booking?.status, booking?.bookingId]);

  const handleVendorApprovePayment = async () => {
    if (!booking) return;
    try {
      await tourService.updateBookingStatus(booking.bookingId, 'CONFIRMED');
      setBooking({
        ...booking,
        status: 'CONFIRMED',
      });
      toast.success(
        'Đã phê duyệt thanh toán thành công! Trạng thái booking chuyển sang ĐÃ XÁC NHẬN.'
      );
    } catch {
      toast.error('Xử lý phê duyệt thất bại.');
    }
  };

  const handleVendorRejectPayment = async () => {
    if (!booking) return;
    try {
      const updated = await tourService.rejectPayment(booking.bookingId);
      setBooking(updated);
      toast.info('Đã từ chối thanh toán. Trạng thái booking quay về CHỜ THANH TOÁN (PENDING).');
    } catch {
      toast.error('Xử lý từ chối thất bại.');
    }
  };

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);

  // Days offset simulator (to test BR-10 and E1 rules)
  const [daysUntilDeparture, setDaysUntilDeparture] = useState(10);

  // Cancellation Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [_cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundPercentage, setRefundPercentage] = useState(100);

  // Sync refund amount/percentage if booking is PENDING_CANCEL
  useEffect(() => {
    if (booking?.status === 'PENDING_CANCEL' && booking.cancellationRefund !== undefined) {
      setRefundAmount(booking.cancellationRefund);
      const pct =
        booking.totalPrice > 0
          ? Math.round((booking.cancellationRefund / booking.totalPrice) * 100)
          : 100;
      setRefundPercentage(pct);
      if (booking.cancelReason) {
        setCancelReason(booking.cancelReason);
      }
    }
  }, [booking]);

  // Compute dynamic dates based on simulator (only if QA flag is active)
  const isQA =
    typeof window !== 'undefined' && window.location.search.includes('use_simulator=true');

  const departureDateStr = booking
    ? isQA
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + daysUntilDeparture);
          return d.toISOString().split('T')[0];
        })()
      : booking.departureDate
    : '';

  const returnDateStr = booking
    ? isQA
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + daysUntilDeparture);
          const r = new Date(d);
          r.setDate(d.getDate() + 2);
          return r.toISOString().split('T')[0];
        })()
      : booking.returnDate
    : '';

  const cancellationDeadlineStr = booking
    ? isQA
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + daysUntilDeparture);
          const c = new Date(d);
          c.setDate(d.getDate() - 7);
          return c.toISOString().split('T')[0];
        })()
      : booking.cancellationDeadline
    : '';

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await tourService.getBookingDetail(bookingId || '');
        setBooking(data);
        reset({ participants: data.participants });
      } catch {
        toast.error('Không thể tải chi tiết đặt tour');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [bookingId, reset]);

  const handleUpdateParticipants = handleSubmit(async (data) => {
    if (!booking) return;
    try {
      await tourService.updateParticipants(booking.bookingId, data.participants);
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              participants: data.participants,
            }
          : null
      );
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch {
      toast.error('Cập nhật thông tin thất bại.');
    }
  });

  const handleCancelClick = () => {
    if (!booking) return;
    if (booking.status === 'CANCELLED') {
      toast.info('Booking này đã được hủy trước đó.');
      return;
    }
    if (booking.status === 'PENDING_CANCEL') {
      toast.info('Yêu cầu hủy đặt tour đang chờ đối tác duyệt.');
      return;
    }

    const realDays = Math.ceil(
      (new Date(booking.departureDate).getTime() - Date.now()) / (1000 * 3600 * 24)
    );
    const effectiveDays = isQA ? daysUntilDeparture : realDays;

    // E1 Exception: Outside cancellation window (< 3 days remaining)
    if (effectiveDays < 3) {
      toast.error(
        'Đã quá hạn hủy đặt tour. Theo chính sách, bạn không thể hủy tour trong vòng 3 ngày trước khởi hành.'
      );
      return;
    }

    // Calculate refund amount based on BR-10
    let percentage = 100;
    if (effectiveDays < 7) {
      percentage = 50;
    }

    const calculatedRefund = (booking.totalPrice * percentage) / 100;
    setRefundPercentage(percentage);
    setRefundAmount(calculatedRefund);
    setShowCancelModal(true);
  };

  const handleConfirmCancelRequest = async (data: { cancelReason?: string }) => {
    if (!booking) return;
    try {
      const response = await tourService.requestCancel(
        booking.bookingId,
        refundAmount,
        data.cancelReason
      );
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              status: response.status,
              cancelReason: data.cancelReason,
              cancellationRefund: refundAmount,
            }
          : null
      );
      setShowCancelModal(false);
      toast.success('Yêu cầu hủy tour đã được gửi thành công! Đang chuyển đến trang chi tiết.');
    } catch {
      toast.error('Gửi yêu cầu hủy thất bại.');
    }
  };

  // Vendor Action Mocks
  const handleVendorApprove = async () => {
    if (!booking) return;
    try {
      const response = await tourService.reviewCancelRequest(booking.bookingId, true);
      setBooking({
        ...booking,
        status: response.status,
      });
      toast.success(
        `Đã phê duyệt hủy thành công. Vui lòng hoàn trả ${formatPrice(refundAmount)} VNĐ cho khách bằng phương thức thanh toán bên ngoài.`
      );
    } catch {
      toast.error('Xử lý phê duyệt thất bại.');
    }
  };

  const handleVendorReject = async () => {
    if (!booking) return;
    try {
      const response = await tourService.reviewCancelRequest(booking.bookingId, false);
      setBooking({
        ...booking,
        status: response.status,
      });
      toast.info('Đã từ chối yêu cầu hủy. Booking giữ nguyên trạng thái cũ.');
    } catch {
      toast.error('Xử lý từ chối thất bại.');
    }
  };

  const handleWriteReview = () => {
    toast.info('Tính năng đánh giá tour đang được phát triển!');
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
      <div className="mx-auto max-w-md py-20 text-center bg-[#FAF9F5]">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Không tìm thấy thông tin đặt chỗ</h2>
        <p className="text-muted-foreground mt-2">Vui lòng kiểm tra lại mã đặt chỗ.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12 bg-[#FAF9F5] min-h-screen">
      {/* Test Simulator Controls */}
      {isQA && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#0B3025]">
            <span>Mô phỏng ngày khởi hành để kiểm tra chính sách hủy:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDaysUntilDeparture(10)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                daysUntilDeparture === 10
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              Còn 10 ngày (Hoàn 100%)
            </button>
            <button
              type="button"
              onClick={() => setDaysUntilDeparture(4)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                daysUntilDeparture === 4
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              Còn 4 ngày (Hoàn 50%)
            </button>
            <button
              type="button"
              onClick={() => setDaysUntilDeparture(1)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                daysUntilDeparture === 1
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              Còn 1 ngày (Ngoài hạn)
            </button>
          </div>
        </div>
      )}

      {/* Vendor Simulation Box */}
      {isQA && booking.status === 'PENDING_CANCEL' && (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Mô phỏng phê duyệt của đối tác (Vendor Simulation)</span>
          </div>
          <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
            Khách hàng đã gửi yêu cầu hủy đặt tour này. Số tiền hoàn trả theo quy định:{' '}
            <span className="font-extrabold text-red-600">
              {formatPrice(refundAmount)} VNĐ ({refundPercentage}%)
            </span>
            .
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleVendorApprove}
              className="bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors border-none shadow-sm cursor-pointer"
            >
              Phê duyệt Hủy đặt tour
            </button>
            <button
              type="button"
              onClick={handleVendorReject}
              className="bg-white text-red-600 border border-red-200 hover:bg-red-50/50 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Từ chối yêu cầu hủy
            </button>
          </div>
        </div>
      )}

      {/* Vendor Payment Simulation Box */}
      {isQA && booking.status === 'AWAITING_CONFIRMATION' && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Mô phỏng phê duyệt thanh toán (Vendor Simulation)</span>
          </div>
          <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
            Trekker đã tải lên minh chứng thanh toán và đang chờ bạn phê duyệt giao dịch.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleVendorApprovePayment}
              className="bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors border-none shadow-sm cursor-pointer"
            >
              Phê duyệt thanh toán (Đặt tour thành công)
            </button>
            <button
              type="button"
              onClick={handleVendorRejectPayment}
              className="bg-white text-red-600 border border-red-200 hover:bg-red-50/50 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Từ chối thanh toán (Yêu cầu thanh toán lại)
            </button>
          </div>
        </div>
      )}

      {/* Countdown timer banner for PENDING (BR-08) */}
      {booking.status === 'PENDING' && (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
              <AlertCircle className="w-5 h-5 animate-pulse" />
              <span>Đơn hàng chưa được thanh toán!</span>
            </div>
            <span className="text-xs font-extrabold text-amber-800 bg-white px-3 py-1 rounded-xl shadow-sm border border-amber-200">
              Thời gian còn lại: {formatCountdown(timeLeft)}
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
            Vui lòng hoàn tất thanh toán và tải lên minh chứng trong vòng 15 phút để bảo đảm giữ chỗ
            cho tour này.
          </p>
          <div>
            <AppButton
              onClick={() => navigate(`/my-tours/${booking.bookingId}/pay`)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Thanh toán ngay
            </AppButton>
          </div>
        </div>
      )}

      {/* Waiting for Vendor Confirmation Banner */}
      {booking.status === 'AWAITING_CONFIRMATION' && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm">
            <Clock className="w-5 h-5 text-blue-600 animate-spin" />
            <span>Waiting for Vendor Confirmation (Đang chờ đối tác duyệt thanh toán)</span>
          </div>
          <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
            Minh chứng thanh toán của bạn đã được gửi. Vui lòng chờ đối tác kiểm tra và phê duyệt.
          </p>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B3025]">Chi tiết Đặt Tour</h1>
          <p className="text-zinc-500 font-bold text-sm mt-1.5">
            Mã đặt chỗ: <span className="font-extrabold text-zinc-800">{booking.bookingId}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {booking.status === 'CONFIRMED' && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-xs">
              <CheckCircle className="w-3.5 h-3.5" />
              Đã xác nhận
            </span>
          )}
          {booking.status === 'PENDING' && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
              Chờ thanh toán
            </span>
          )}
          {booking.status === 'AWAITING_CONFIRMATION' && (
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
              Chờ xác nhận thanh toán
            </span>
          )}
          {booking.status === 'PENDING_CANCEL' && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
              Chờ duyệt hủy
            </span>
          )}
          {booking.status === 'CANCELLED' && (
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold text-xs">
              <XCircle className="w-3.5 h-3.5" />
              Đã hủy
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Tour Banner Card */}
          <AppCard className="overflow-hidden border-[#E5E4DE] rounded-3xl bg-white shadow-sm">
            <div className="relative aspect-video w-full">
              <img
                src={booking.coverImageUrl}
                alt={booking.tourName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {booking.tourName}
                </h2>
              </div>
            </div>
            {/* Quick meta details below banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-[#FAF9F5]/40 border-t border-[#F4F4F2]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E4DE] text-zinc-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-zinc-400 block uppercase tracking-wider">
                    THỜI GIAN
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">
                    {formatDate(departureDateStr)} — {formatDate(returnDateStr)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E4DE] text-zinc-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-zinc-400 block uppercase tracking-wider">
                    ĐỘ DÀI
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">{booking.duration}</span>
                </div>
              </div>
            </div>
          </AppCard>

          {/* Participant list card */}
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F4F4F2] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-400" />
                <h3 className="font-extrabold text-zinc-800 text-base">Danh sách người tham gia</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 border border-[#E5E4DE] hover:bg-zinc-50 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditing ? 'Hủy chỉnh sửa' : 'Cập nhật thông tin'}
              </button>
            </div>

            {isEditing ? (
              // Inline edit form
              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-4 bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl space-y-3"
                  >
                    <span className="text-xs font-extrabold text-[#0B3025]">
                      Người thứ {idx + 1}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Họ tên"
                          {...register(`participants.${idx}.fullName`)}
                          className="bg-white border border-[#E5E4DE] rounded-xl px-3 py-2 text-xs font-bold w-full"
                        />
                        {formErrors.participants?.[idx]?.fullName && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">
                            {formErrors.participants[idx].fullName.message}
                          </span>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Số điện thoại"
                          {...register(`participants.${idx}.phone`)}
                          className="bg-white border border-[#E5E4DE] rounded-xl px-3 py-2 text-xs font-bold w-full"
                        />
                        {formErrors.participants?.[idx]?.phone && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">
                            {formErrors.participants[idx].phone.message}
                          </span>
                        )}
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          {...register(`participants.${idx}.email`)}
                          className="bg-white border border-[#E5E4DE] rounded-xl px-3 py-2 text-xs font-bold w-full"
                        />
                        {formErrors.participants?.[idx]?.email && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">
                            {formErrors.participants[idx].email.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-2">
                  <AppButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      reset({ participants: booking.participants });
                    }}
                    className="text-zinc-500 font-bold text-xs"
                  >
                    Hủy
                  </AppButton>
                  <AppButton
                    type="button"
                    onClick={handleUpdateParticipants}
                    className="bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-4 py-2 rounded-xl text-xs border-none"
                  >
                    Lưu thay đổi
                  </AppButton>
                </div>
              </div>
            ) : (
              // Display table
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F4F4F2] text-zinc-400 font-bold tracking-wider">
                      <th className="py-2.5 uppercase">Họ tên</th>
                      <th className="py-2.5 uppercase">Số điện thoại</th>
                      <th className="py-2.5 uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F2]">
                    {booking.participants.map((p, idx) => (
                      <tr key={`display-p-${idx}`} className="text-zinc-700 font-bold">
                        <td className="py-3.5">{p.fullName}</td>
                        <td className="py-3.5">{p.phone}</td>
                        <td className="py-3.5">{p.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AppCard>
        </div>

        {/* Right Column (Cost summary & Cancellation) */}
        <div className="space-y-6">
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2] mb-6">
              Tóm tắt chi phí
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-zinc-500 font-semibold text-xs">
                <span>Giá tour (x{booking.participants.length} khách)</span>
                <span className="text-zinc-800 font-extrabold">
                  {formatPrice(booking.tourPrice)} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 font-semibold text-xs">
                <span>Giảm giá thành viên</span>
                <span className="text-emerald-600 font-extrabold">
                  -{formatPrice(booking.discountAmount)} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-800 font-extrabold text-base pt-3 border-t border-dashed border-[#E5E4DE]">
                <span>Tổng tiền</span>
                <span className="text-base text-[#0B3025]">
                  {formatPrice(booking.totalPrice)} VNĐ
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <AppButton
                type="button"
                onClick={handleWriteReview}
                disabled={
                  booking.status === 'CANCELLED' ||
                  booking.status === 'PENDING_CANCEL' ||
                  booking.status === 'PENDING' ||
                  booking.status === 'AWAITING_CONFIRMATION'
                }
                className="w-full bg-[#0B3025] hover:bg-[#072019] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors border-none text-xs"
              >
                <PenSquare className="h-4 w-4" />
                Viết đánh giá
              </AppButton>

              <AppButton
                type="button"
                variant="outline"
                disabled={
                  booking.status === 'CANCELLED' ||
                  booking.status === 'PENDING_CANCEL' ||
                  booking.status === 'PENDING' ||
                  booking.status === 'AWAITING_CONFIRMATION'
                }
                onClick={handleCancelClick}
                className="w-full border-red-200 text-red-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50/50 transition-colors text-xs border"
              >
                <XCircle className="h-4 w-4" />
                {booking.status === 'PENDING_CANCEL' ? 'Đang chờ duyệt hủy' : 'Hủy Booking'}
              </AppButton>
            </div>
          </AppCard>

          {/* Cancellation Info Container */}
          <div className="p-5 bg-zinc-50 border border-[#E5E4DE] rounded-3xl text-zinc-500 font-semibold text-xs leading-relaxed">
            <div className="flex gap-2 mb-2 text-zinc-700 font-bold">
              <Info className="h-4 w-4 shrink-0 text-zinc-500" />
              <span>Chính sách hủy tour</span>
            </div>
            <p className="mb-2">
              * Lưu ý: Chính sách hủy tour miễn phí chỉ áp dụng trước ngày{' '}
              {formatDate(cancellationDeadlineStr)}. Vui lòng liên hệ bộ phận hỗ trợ nếu bạn cần
              thêm thông tin.
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1 text-[10px]">
              <li>Hủy trước khởi hành từ 7 ngày trở lên: Hoàn tiền 100%</li>
              <li>Hủy từ 3 đến dưới 7 ngày trước khởi hành: Hoàn tiền 50%</li>
              <li>Hủy dưới 3 ngày trước khởi hành: Không hỗ trợ hủy tour (E1)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancellation Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmitCancel(handleConfirmCancelRequest)}
            className="bg-white border border-[#E5E4DE] rounded-3xl p-6 max-w-md w-full shadow-lg space-y-4"
          >
            <h3 className="font-extrabold text-lg text-zinc-800 tracking-tight">
              Yêu cầu hủy đặt tour
            </h3>
            <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
              Bạn đang gửi yêu cầu hủy đặt tour cho{' '}
              <span className="font-extrabold text-zinc-800">{booking.tourName}</span>.
            </p>

            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E5E4DE] space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-500">Mức hoàn tiền:</span>
                <span className="text-zinc-800">{refundPercentage}%</span>
              </div>
              <div className="flex justify-between font-extrabold border-t border-[#F4F4F2] pt-2">
                <span className="text-zinc-500">Số tiền hoàn trả dự kiến:</span>
                <span className="text-red-600">{formatPrice(refundAmount)} VNĐ</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-zinc-700 font-bold text-xs">
                Lý do hủy đặt tour (không bắt buộc)
              </label>
              <textarea
                id="cancelReason"
                className="w-full min-h-[80px] p-3 bg-[#FAF9F5] border border-[#E5E4DE] rounded-xl text-zinc-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#0B3025]"
                placeholder="Vui lòng nhập lý do hủy đặt tour của bạn..."
                {...registerCancel('cancelReason')}
              />
              {cancelErrors.cancelReason && (
                <p className="text-xs text-destructive font-semibold">
                  {cancelErrors.cancelReason.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl text-xs py-2.5 transition-colors cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs py-2.5 transition-colors border-none shadow-sm cursor-pointer"
              >
                Gửi yêu cầu hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
