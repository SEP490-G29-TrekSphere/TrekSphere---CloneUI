import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, Info, Plus, ShieldCheck, Trash2, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as z from 'zod';
import { getBookingPaymentPath } from '@/constants/paths';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import { tourService } from '@/features/tours/services/tourService';
import type { ParticipantGender } from '@/features/tours/types';
import { AppButton, AppCard, AppFormInput } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

// Participant schema matching API POST /api/v1/bookings items
const participantSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên đầy đủ'),
  dateOfBirth: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ (YYYY-MM-DD)'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const, {
    message: 'Giới tính không hợp lệ',
  }),
  idNumber: z.string().min(1, 'Vui lòng nhập số CCCD hoặc hộ chiếu'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ (yêu cầu 10 chữ số)'),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Địa chỉ email không hợp lệ',
    }),
  address: z.string().optional(),
  specialRequirements: z.string().optional(),
});

// Booking form schema
const bookingFormSchema = z.object({
  scheduleId: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
  paymentMethod: z.enum(['card', 'bank', 'wallet']),
  participants: z
    .array(participantSchema)
    .min(1, 'Vui lòng nhập thông tin ít nhất 1 người tham gia'),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookTour() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlScheduleId = searchParams.get('scheduleId') || '';
  const preSelectedParticipantsStr = searchParams.get('participants');
  const parsedPart = preSelectedParticipantsStr ? parseInt(preSelectedParticipantsStr, 10) : 1;
  const preSelectedParticipantsCount = Number.isNaN(parsedPart) || parsedPart < 1 ? 1 : parsedPart;

  const { data: tour, isLoading, error } = useTourDetail(id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const createDefaultParticipant = () => ({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE' as ParticipantGender,
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    specialRequirements: '',
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      scheduleId: urlScheduleId,
      paymentMethod: 'bank',
      participants: Array.from({ length: preSelectedParticipantsCount }, createDefaultParticipant),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants',
  });

  const selectedScheduleId = watch('scheduleId');
  const participantsList = watch('participants');
  const participantsCount = participantsList?.length || 0;

  // Find selected schedule details
  const selectedSchedule = tour?.schedules.find((s) => s.scheduleId === selectedScheduleId);

  // 1. Sync URL scheduleId parameter -> Form state when user edits URL manually
  useEffect(() => {
    if (urlScheduleId && urlScheduleId !== selectedScheduleId) {
      setValue('scheduleId', urlScheduleId, { shouldValidate: true });
    }
  }, [urlScheduleId, setValue, selectedScheduleId]);

  // 2. Validate selected schedule & auto-correct if scheduleId is invalid/empty or doesn't belong to tour
  useEffect(() => {
    if (tour && tour.schedules.length > 0) {
      const openSchedulesList = tour.schedules.filter(
        (s) => s.status === 'OPEN' && s.availableSlots - s.bookedSlots > 0
      );
      const isScheduleValid = openSchedulesList.some((s) => s.scheduleId === selectedScheduleId);

      if (!isScheduleValid && openSchedulesList.length > 0) {
        const fallbackScheduleId = openSchedulesList[0].scheduleId;
        setValue('scheduleId', fallbackScheduleId, { shouldValidate: true });
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('scheduleId', fallbackScheduleId);
            return next;
          },
          { replace: true }
        );
      }
    }
  }, [tour, selectedScheduleId, setValue, setSearchParams]);

  // 3. Helper to change schedule and update URL searchParams simultaneously
  const handleScheduleSelect = (scheduleId: string) => {
    setValue('scheduleId', scheduleId, { shouldValidate: true });
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('scheduleId', scheduleId);
        return next;
      },
      { replace: true }
    );
  };

  // Clamp participants count to selected schedule remaining capacity (BR-08)
  useEffect(() => {
    if (selectedSchedule) {
      const remainingCapacity = Math.max(
        0,
        selectedSchedule.availableSlots - selectedSchedule.bookedSlots
      );
      if (fields.length > remainingCapacity && remainingCapacity > 0) {
        while (fields.length > remainingCapacity) {
          remove(fields.length - 1);
        }
      }
    }
  }, [selectedSchedule, fields.length, remove]);

  // Get base price
  const basePrice = selectedSchedule?.price ?? tour?.basePrice ?? 0;
  const subtotal = basePrice * participantsCount;
  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Handle voucher application
  const handleApplyVoucher = async (codeOverride?: string) => {
    const code = codeOverride || voucherCode;
    if (!code.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherError(null);
    try {
      const response = await tourService.validateVoucher(code, subtotal);
      if (response.isValid) {
        setAppliedVoucher({
          code: code,
          discountAmount: response.discountAmount,
        });
        toast.success('Áp dụng mã giảm giá thành công!');
      } else {
        setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        setAppliedVoucher(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
      setVoucherError(message);
      setAppliedVoucher(null);
      toast.error(message);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Submit form with participants array & voucherCode to POST /api/v1/bookings
  const onFormSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedParticipants = data.participants.map((p) => ({
        fullName: p.fullName.trim(),
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        idNumber: p.idNumber.trim(),
        phone: p.phone.trim(),
        email: p.email?.trim() || undefined,
        address: p.address?.trim() || undefined,
        specialRequirements: p.specialRequirements?.trim() || undefined,
      }));

      const bookingResponse = await tourService.createBooking({
        scheduleId: data.scheduleId,
        voucherCode: appliedVoucher?.code || undefined,
        participants: formattedParticipants,
      });

      toast.success('Đặt tour thành công! Đang chuyển đến trang thanh toán.');
      navigate(getBookingPaymentPath(bookingResponse.bookingId));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tạo đặt chỗ.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B3025] border-t-transparent" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Không tìm thấy thông tin tour</h2>
        <p className="text-muted-foreground mt-2">
          {error?.message || 'Có lỗi xảy ra khi tải dữ liệu.'}
        </p>
        <Link to="/tours" className="mt-4 inline-block text-primary hover:underline">
          Quay lại danh sách tour
        </Link>
      </div>
    );
  }

  const openSchedules = tour.schedules.filter(
    (s) => s.status === 'OPEN' && s.availableSlots - s.bookedSlots > 0
  );
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';
  const remainingSlots = selectedSchedule
    ? Math.max(0, selectedSchedule.availableSlots - selectedSchedule.bookedSlots)
    : 10;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0B3025]">Đặt tour mới</h1>
        <p className="text-zinc-500 mt-2 font-medium text-sm">
          Vui lòng điền đầy đủ thông tin danh sách thành viên tham gia tour.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]"
      >
        {/* Left side: Input Details */}
        <div className="space-y-6">
          {/* Schedule selection */}
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F4F4F2] pb-4 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
                <Calendar className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-zinc-800 text-base">Chọn ngày khởi hành</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {openSchedules.map((s) => {
                  const remaining = Math.max(0, s.availableSlots - s.bookedSlots);
                  const isSelected = selectedScheduleId === s.scheduleId;
                  return (
                    <button
                      key={s.scheduleId}
                      type="button"
                      onClick={() => handleScheduleSelect(s.scheduleId)}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#0B3025] bg-[#E8F1EE]/30 ring-2 ring-[#0B3025]'
                          : 'border-[#E5E4DE] bg-[#FAF9F5] hover:border-zinc-400'
                      }`}
                    >
                      <span className="font-bold text-sm text-[#0B3025]">
                        {new Date(s.departureDate).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-1 font-semibold">
                        Còn {remaining} chỗ
                      </span>
                      <span className="text-sm font-extrabold mt-2 text-zinc-800">
                        {formatPrice(s.price)}đ
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.scheduleId && (
                <p className="text-xs text-destructive">{errors.scheduleId.message}</p>
              )}
            </div>
          </AppCard>

          {/* Participant list */}
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F4F4F2] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-800 text-base">
                    Danh sách người tham gia ({fields.length})
                  </h3>
                </div>
              </div>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                disabled={fields.length >= remainingSlots}
                onClick={() => append(createDefaultParticipant())}
                className="rounded-xl flex items-center gap-1.5 text-xs font-bold border-[#E5E4DE] text-[#0B3025] hover:bg-[#E8F1EE]/40"
              >
                <Plus className="h-4 w-4" /> Thêm người
              </AppButton>
            </div>

            {errors.participants?.root && (
              <p className="text-xs text-destructive mb-4 font-semibold">
                {errors.participants.root.message}
              </p>
            )}

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-5 bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E4DE] pb-3">
                    <span className="font-extrabold text-sm text-[#0B3025] flex items-center gap-2">
                      <User className="h-4 w-4" /> Người tham gia {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-zinc-400 hover:text-destructive p-1 rounded-lg transition-colors"
                        title="Xóa người tham gia"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AppFormInput
                      control={control}
                      name={`participants.${index}.fullName`}
                      label="Họ và tên *"
                      placeholder="Nguyễn Văn A"
                      className="bg-white rounded-xl border-[#E5E4DE]"
                    />
                    <AppFormInput
                      control={control}
                      name={`participants.${index}.phone`}
                      label="Số điện thoại *"
                      placeholder="0987654321"
                      className="bg-white rounded-xl border-[#E5E4DE]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <AppFormInput
                      control={control}
                      name={`participants.${index}.dateOfBirth`}
                      label="Ngày sinh *"
                      type="date"
                      className="bg-white rounded-xl border-[#E5E4DE]"
                    />
                    <div className="space-y-2">
                      <label
                        htmlFor={`participants.${index}.gender`}
                        className="text-zinc-700 font-bold text-xs block"
                      >
                        Giới tính *
                      </label>
                      <select
                        id={`participants.${index}.gender`}
                        {...register(`participants.${index}.gender`)}
                        className="w-full h-10 px-3 bg-white border border-[#E5E4DE] rounded-xl text-zinc-800 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-[#0B3025]"
                      >
                        <option value="MALE">Nam (MALE)</option>
                        <option value="FEMALE">Nữ (FEMALE)</option>
                        <option value="OTHER">Khác (OTHER)</option>
                      </select>
                      {errors.participants?.[index]?.gender && (
                        <p className="text-xs text-destructive">
                          {errors.participants[index]?.gender?.message}
                        </p>
                      )}
                    </div>
                    <AppFormInput
                      control={control}
                      name={`participants.${index}.idNumber`}
                      label="Số CCCD / Hộ chiếu *"
                      placeholder="001202001234"
                      className="bg-white rounded-xl border-[#E5E4DE]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AppFormInput
                      control={control}
                      name={`participants.${index}.email`}
                      label="Email (Không bắt buộc)"
                      placeholder="nguyenvana@gmail.com"
                      className="bg-white rounded-xl border-[#E5E4DE]"
                    />
                    <AppFormInput
                      control={control}
                      name={`participants.${index}.address`}
                      label="Địa chỉ (Không bắt buộc)"
                      placeholder="Cầu Giấy, Hà Nội"
                      className="bg-white rounded-xl border-[#E5E4DE]"
                    />
                  </div>

                  <AppFormInput
                    control={control}
                    name={`participants.${index}.specialRequirements`}
                    label="Yêu cầu đặc biệt (Không bắt buộc)"
                    placeholder="Không ăn được thịt bò, dị ứng thực phẩm..."
                    className="bg-white rounded-xl border-[#E5E4DE]"
                  />
                </div>
              ))}
            </div>
          </AppCard>
        </div>

        {/* Right side: Summary */}
        <div className="space-y-6">
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm sticky top-24">
            <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2] mb-4">
              Tóm tắt đơn hàng
            </h3>

            {/* Mini Tour Card */}
            <div className="flex gap-3 mb-4">
              <img
                src={
                  tour.coverImageUrl ||
                  (tour.images && tour.images.length > 0 ? tour.images[0].imageUrl : FALLBACK_IMAGE)
                }
                alt={tour.tourName}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }
                }}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-extrabold text-sm text-zinc-800 leading-snug">
                  {tour.tourName}
                </h4>
                <div className="flex items-center gap-1.5 text-zinc-400 mt-1 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {selectedSchedule
                      ? new Date(selectedSchedule.departureDate).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Chưa chọn ngày'}
                  </span>
                </div>
              </div>
            </div>

            {/* Voucher input */}
            <div className="mb-6 pt-4 border-t border-[#F4F4F2]">
              <label
                htmlFor="voucherCodeInput"
                className="text-zinc-600 font-bold text-xs mb-2 block"
              >
                Mã ưu đãi (Voucher)
              </label>
              <div className="flex gap-2">
                <input
                  id="voucherCodeInput"
                  type="text"
                  className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl px-4 py-2.5 outline-none w-full text-zinc-800 font-bold text-sm placeholder-zinc-300 focus:ring-1 focus:ring-[#0B3025]"
                  placeholder="Nhập mã..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <button
                  type="button"
                  disabled={isValidatingVoucher}
                  onClick={() => handleApplyVoucher()}
                  className="bg-[#E8F1EE] hover:bg-[#d8e7e2] text-[#0B3025] font-bold px-4 py-2.5 rounded-2xl text-xs transition-colors shrink-0"
                >
                  {isValidatingVoucher ? '...' : 'Áp dụng'}
                </button>
              </div>
              {voucherError && (
                <p className="text-xs text-red-500 mt-2 font-medium">{voucherError}</p>
              )}
              {appliedVoucher && (
                <p className="text-xs text-emerald-600 mt-2 font-bold">
                  Đã áp dụng mã: {appliedVoucher.code} (-
                  {formatPrice(appliedVoucher.discountAmount)}đ)
                </p>
              )}
            </div>

            {/* Cost display */}
            <div className="space-y-3 pt-4 border-t border-[#F4F4F2] mb-6">
              <div className="flex justify-between items-center text-zinc-500 font-semibold text-sm">
                <span>Số lượng người tham gia</span>
                <span>{participantsCount} người</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 font-semibold text-sm">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}đ</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 font-semibold text-sm">
                <span>Giảm giá</span>
                <span className="text-red-500">-{formatPrice(discount)}đ</span>
              </div>
              <div className="flex justify-between items-center text-zinc-800 font-extrabold text-base pt-2 border-t border-dashed border-[#E5E4DE]">
                <span>Tổng cộng</span>
                <span className="text-lg text-[#0B3025]">{formatPrice(total)}đ</span>
              </div>
            </div>

            {/* Pay button */}
            <AppButton
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0B3025] hover:bg-[#072019] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors border-none"
            >
              {isSubmitting ? 'Đang tạo giao dịch...' : 'Thanh toán ngay'}
            </AppButton>

            <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Thanh toán an toàn & bảo mật</span>
            </div>
            {/* Refund Info Alert */}
            <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl text-xs font-semibold flex gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Chính sách hoàn tiền: Hoàn 100% nếu hủy trước khởi hành 7 ngày.</span>
            </div>
          </AppCard>
        </div>
      </form>
    </div>
  );
}
