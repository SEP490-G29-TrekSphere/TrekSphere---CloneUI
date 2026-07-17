import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, FileImage, QrCode, ShieldCheck, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
import { getBookingDetailPath } from '@/constants/paths';
import { useBookingCountdown } from '@/features/tours/hooks/useBookingCountdown';
import {
  type MockBooking,
  PAYMENT_DEADLINE_SECONDS,
  tourService,
} from '@/features/tours/services/tourService';
import { AppButton, AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatCountdown, formatPrice } from '@/utils/format';

const isValidImageFile = async (file: File): Promise<boolean> => {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPng =
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a;

  const isJpeg =
    header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;

  return isPng || isJpeg;
};

const paymentSchema = z.object({
  paymentProof: z
    .custom<File | null>((val) => val instanceof File || val === null, {
      message: 'Vui lòng tải lên ảnh chụp minh chứng thanh toán.',
    })
    .refine((file) => file !== null, 'Vui lòng tải lên ảnh chụp minh chứng thanh toán.')
    .refine((file) => {
      if (!file) return true;
      const allowedTypes = ['image/png', 'image/jpeg'];
      return allowedTypes.includes(file.type);
    }, 'Định dạng file không hợp lệ! Vui lòng chỉ tải lên file PNG hoặc JPG/JPEG.')
    .refine((file) => {
      if (!file) return true;
      const maxSize = 5 * 1024 * 1024;
      return file.size <= maxSize;
    }, 'Kích thước file vượt quá giới hạn 5MB. Vui lòng chọn file nhỏ hơn.')
    .refine(async (file) => {
      if (!file) return true;
      return await isValidImageFile(file);
    }, 'Nội dung file không hợp lệ. Vui lòng tải lên ảnh PNG hoặc JPG/JPEG hợp lệ.'),
});

export default function PayBooking() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<MockBooking | null>(null);
  const [loading, setLoading] = useState(true);

  // Time Countdown state (BR-08: 15 minutes)
  const [isExpired, setIsExpired] = useState(false);
  const timeLeft = useBookingCountdown(
    booking?.createdAt,
    !loading && !isExpired && booking?.status === 'PENDING',
    PAYMENT_DEADLINE_SECONDS
  );

  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema, undefined, { mode: 'async' }),
    defaultValues: {
      paymentProof: null as File | null,
    },
  });

  const paymentProof = watch('paymentProof');

  useEffect(() => {
    return () => {
      if (paymentProofUrl) {
        URL.revokeObjectURL(paymentProofUrl);
      }
    };
  }, [paymentProofUrl]);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        const data = await tourService.getBookingDetail(bookingId);
        setBooking(data);

        // If it's already awaiting confirmation or confirmed/cancelled, we shouldn't show the pay screen
        if (data.status !== 'PENDING') {
          toast.info('Đơn hàng này không ở trạng thái cần thanh toán.');
          navigate(getBookingDetailPath(bookingId));
          return;
        }

        // Calculate exact remaining time based on booking creation date
        const createdTime = new Date(data.createdAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
        const remaining = Math.max(0, PAYMENT_DEADLINE_SECONDS - elapsedSeconds);

        if (remaining <= 0) {
          setIsExpired(true);
          await tourService.updateBookingStatus(bookingId, 'CANCELLED');
        }
      } catch {
        toast.error('Không thể tải thông tin đơn đặt chỗ.');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId, navigate]);

  // Handle timer expiration side effects
  useEffect(() => {
    if (timeLeft === 0 && !isExpired && booking?.status === 'PENDING') {
      setIsExpired(true);
      if (bookingId) {
        tourService.updateBookingStatus(bookingId, 'CANCELLED');
      }
      toast.error('Đã hết 15 phút thanh toán! Chỗ của bạn đã được giải phóng.');
    }
  }, [timeLeft, isExpired, bookingId, booking]);

  // Upload proof of payment validation (E1)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue('paymentProof', file, { shouldValidate: true });

    if (paymentProofUrl) {
      URL.revokeObjectURL(paymentProofUrl);
    }
    setPaymentProofUrl(URL.createObjectURL(file));
  };

  // Submit payment proof
  const onSubmit = async (data: { paymentProof: File | null }) => {
    if (!bookingId || !data.paymentProof) return;
    if (isExpired) {
      toast.error('Đã hết hạn thanh toán 15 phút!');
      return;
    }

    setIsMutating(true);
    try {
      // Step 5: Upload image to cloud storage, update status to AWAITING_CONFIRMATION
      await tourService.uploadPaymentProof(bookingId, data.paymentProof);

      // Step 6: Notify vendor manually (simulated)
      toast.success('Đã gửi minh chứng thanh toán. Hệ thống đã gửi thông báo đến đối tác!');

      // Step 7: Redirect to confirmation wait page (we redirect to Booking Detail)
      navigate(getBookingDetailPath(bookingId));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi gửi minh chứng.';
      toast.error(errMsg);
    } finally {
      setIsMutating(false);
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
      <div className="mx-auto max-w-md py-20 text-center bg-[#FAF9F5]">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Không tìm thấy thông tin đặt chỗ</h2>
        <p className="text-muted-foreground mt-2">Vui lòng kiểm tra lại mã đặt chỗ.</p>
        <AppButton onClick={() => navigate('/my-tours')} className="mt-4">
          Quay lại danh sách tour đã đặt
        </AppButton>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="mx-auto max-w-md py-20 text-center bg-[#FAF9F5] space-y-4">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-extrabold text-[#0B3025]">Giao dịch đã hết hạn</h2>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed">
          Đơn đặt chỗ <strong>{booking.bookingId}</strong> đã tự động hủy do quá thời gian giữ chỗ
          15 phút. Vui lòng quay lại đặt chỗ mới.
        </p>
        <div className="pt-4">
          <AppButton
            onClick={() => navigate(`/tours/${booking.tourId}`)}
            className="bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-6 py-3 rounded-2xl"
          >
            Quay lại đặt tour
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12 bg-[#FAF9F5] min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(`/my-tours/${bookingId}`)}
          aria-label="Quay lại chi tiết đặt tour"
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-[#0B3025]">Thanh toán đơn hàng</h1>
      </div>

      {/* Countdown timer banner (BR-08) */}
      <div className="p-4 bg-amber-50 text-amber-800 border border-amber-100 rounded-2xl text-xs font-semibold flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Vui lòng hoàn tất thanh toán chuyển khoản trước khi thời gian giữ chỗ kết thúc:
          </span>
        </div>
        <span className="text-sm font-extrabold tracking-wider bg-white px-3 py-1 rounded-xl shadow-sm border border-amber-200">
          {formatCountdown(timeLeft)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Payment Account Details */}
        <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2] mb-6">
            Thông tin chuyển khoản ngân hàng
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* QR Mockup */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl">
              <div className="w-48 h-48 bg-white border border-[#E5E4DE] rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                <QrCode className="h-32 w-32 text-zinc-800" />
                <span className="text-[10px] font-extrabold text-zinc-400 mt-2 tracking-wider">
                  VietQR / Techcombank
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-semibold mt-3 text-center">
                Quét mã QR để tự động điền thông tin chuyển khoản nhanh chóng.
              </p>
            </div>

            {/* Bank text details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                <span className="text-zinc-500 text-xs font-semibold">Tên ngân hàng</span>
                <span className="text-zinc-800 text-sm font-bold">Techcombank</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                <span className="text-zinc-500 text-xs font-semibold">Số tài khoản</span>
                <span className="text-zinc-800 text-sm font-extrabold">19038283929182</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                <span className="text-zinc-500 text-xs font-semibold">Tên chủ tài khoản</span>
                <span className="text-zinc-800 text-sm font-bold uppercase">TrekSphere JSC</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                <span className="text-zinc-500 text-xs font-semibold">Số tiền cần chuyển</span>
                <span className="text-red-600 text-sm font-extrabold">
                  {formatPrice(booking.totalPrice)} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                <span className="text-zinc-500 text-xs font-semibold">Nội dung chuyển khoản</span>
                <span className="text-emerald-700 text-sm font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  TS-{bookingId}
                </span>
              </div>
            </div>
          </div>
        </AppCard>

        {/* Proof of Payment Upload Component */}
        <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2] mb-4">
              Tải lên minh chứng thanh toán
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#E5E4DE] rounded-2xl cursor-pointer bg-[#FAF9F5] hover:bg-zinc-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <p className="mb-2 text-sm text-zinc-500 font-semibold">
                      <span className="text-[#0B3025]">Nhấp để tải lên</span> hoặc kéo thả file
                    </p>
                    <p className="text-xs text-zinc-400 font-semibold">
                      PNG, JPG hoặc JPEG (Tối đa 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                  />
                </label>
                {errors.paymentProof && (
                  <p className="text-xs text-destructive font-semibold mt-1">
                    {errors.paymentProof.message}
                  </p>
                )}
              </div>

              {/* Display selected file details */}
              {paymentProof && (
                <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-[#E5E4DE] rounded-xl">
                  <FileImage className="h-6 w-6 text-zinc-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-zinc-800 truncate">{paymentProof.name}</p>
                    <p className="text-[10px] text-zinc-500 font-semibold">
                      {(paymentProof.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  {paymentProofUrl && (
                    <img
                      src={paymentProofUrl.startsWith('blob:') ? paymentProofUrl : ''}
                      alt="Xem trước"
                      className="w-12 h-12 rounded-lg object-cover border border-[#E5E4DE]"
                    />
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    if (!bookingId) return;
                    setIsMutating(true);
                    try {
                      await tourService.updateBookingStatus(bookingId, 'CANCELLED');
                      toast.success('Hủy giao dịch thành công.');
                      navigate(getBookingDetailPath(bookingId));
                    } catch {
                      toast.error('Đã xảy ra lỗi khi hủy giao dịch.');
                    } finally {
                      setIsMutating(false);
                    }
                  }}
                  disabled={isMutating}
                  className="flex-1 text-zinc-500 font-bold hover:text-zinc-800"
                >
                  Hủy giao dịch
                </AppButton>
                <AppButton
                  type="submit"
                  disabled={isMutating || !paymentProof}
                  className="flex-1 bg-[#0B3025] hover:bg-[#072019] text-white font-bold py-3.5 rounded-2xl border-none shadow-sm transition-colors"
                >
                  {isMutating ? 'Đang gửi...' : 'Gửi bằng chứng thanh toán'}
                </AppButton>
              </div>
            </div>
          </form>
        </AppCard>

        {/* Security badge and guidelines */}
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs py-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Giao dịch của bạn được mã hóa an toàn và bảo mật</span>
        </div>
      </div>
    </div>
  );
}
