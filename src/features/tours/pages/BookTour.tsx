import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Gift,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getBookingPaymentPath } from '@/constants/paths';
import { CancellationPolicyNotice } from '@/features/tours/components/CancellationPolicyNotice';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import { tourService } from '@/features/tours/services/tourService';
import type { ParticipantGender } from '@/features/tours/types';
import { useVendorActiveVouchers } from '@/features/vendor-vouchers';
import { AppButton, AppCard, AppFormDatePicker, AppFormInput } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatPrice } from '@/utils/format';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const participantSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên đầy đủ'),
  dateOfBirth: z.string().min(1, 'Vui lòng chọn ngày sinh'),
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

const bookingFormSchema = z.object({
  scheduleId: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
  paymentMethod: z.enum(['card', 'bank', 'wallet']),
  participants: z
    .array(participantSchema)
    .min(1, 'Vui lòng nhập thông tin ít nhất 1 người tham gia'),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

// ---------------------------------------------------------------------------
// Helper — collapsed participant header summary
// ---------------------------------------------------------------------------

function ParticipantSummary({
  name,
  phone,
  index,
}: {
  name: string;
  phone: string;
  index: number;
}) {
  if (!name && !phone) return null;
  return (
    <p className="mt-1 text-xs text-muted-foreground truncate">
      {name || `Người tham gia ${index + 1}`}
      {phone ? ` · ${phone}` : ''}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BookTour() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlScheduleId = searchParams.get('scheduleId') || '';
  const preSelectedParticipantsStr = searchParams.get('participants');
  const parsedPart = preSelectedParticipantsStr ? parseInt(preSelectedParticipantsStr, 10) : 1;
  const preSelectedParticipantsCount = Number.isNaN(parsedPart) || parsedPart < 1 ? 1 : parsedPart;

  const { data: tour, isLoading, error } = useTourDetail(id);
  const { data: activeVouchersData } = useVendorActiveVouchers(tour?.vendorId || '', {
    page: 0,
    size: 50,
  });
  const activeVouchers = activeVouchersData?.content || [];

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [expandedParticipants, setExpandedParticipants] = useState<Set<number>>(() => new Set([0]));

  // Refs for auto-scroll to newly added participant
  const participantRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Form
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

  const selectedSchedule = tour?.schedules.find((s) => s.scheduleId === selectedScheduleId);

  // --- Effects ---

  useEffect(() => {
    if (urlScheduleId && urlScheduleId !== selectedScheduleId) {
      setValue('scheduleId', urlScheduleId, { shouldValidate: true });
    }
  }, [urlScheduleId, setValue, selectedScheduleId]);

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

  // --- Derived values ---

  const basePrice = selectedSchedule?.price ?? tour?.basePrice ?? 0;
  const subtotal = basePrice * participantsCount;
  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';
  const remainingSlots = selectedSchedule
    ? Math.max(0, selectedSchedule.availableSlots - selectedSchedule.bookedSlots)
    : 10;
  const openSchedules = tour
    ? tour.schedules.filter((s) => s.status === 'OPEN' && s.availableSlots - s.bookedSlots > 0)
    : [];

  // --- Handlers ---

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

  const toggleParticipant = (index: number) => {
    setExpandedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addParticipant = () => {
    append(createDefaultParticipant());
    const newIndex = fields.length;
    setExpandedParticipants((prev) => new Set(prev).add(newIndex));
    // Auto-scroll to new participant after render
    setTimeout(() => {
      const el = participantRefs.current.get(newIndex);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const removeParticipant = (index: number) => {
    remove(index);
    setExpandedParticipants((prev) => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      }
      return next;
    });
  };

  const handleApplyVoucher = async (codeOverride?: string) => {
    const code = codeOverride || voucherCode;
    if (!code.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherError(null);
    try {
      const response = await tourService.validateVoucher(code, subtotal, tour?.vendorId);
      if (response.isValid) {
        setAppliedVoucher({
          code,
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

  const onFormSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedParticipants = data.participants.map((p) => {
        let formattedDOB = p.dateOfBirth;
        if (p.dateOfBirth?.includes('T')) {
          formattedDOB = p.dateOfBirth.split('T')[0];
        }
        return {
          fullName: p.fullName.trim(),
          dateOfBirth: formattedDOB,
          gender: p.gender,
          idNumber: p.idNumber.trim(),
          phone: p.phone.trim(),
          email: p.email?.trim() || undefined,
          address: p.address?.trim() || undefined,
          specialRequirements: p.specialRequirements?.trim() || undefined,
        };
      });

      const bookingResponse = await tourService.createBooking({
        scheduleId: data.scheduleId,
        voucherCode: appliedVoucher?.code || undefined,
        participants: formattedParticipants,
      });

      toast.success('Đặt tour thành công! Đang chuyển đến trang thanh toán.');
      navigate(getBookingPaymentPath(bookingResponse.bookingId));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo đặt chỗ.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading state ---

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // --- Error state ---

  if (error || !tour) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl border border-border shadow-lg space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-extrabold text-foreground">Không tìm thấy thông tin tour</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error?.message || 'Có lỗi xảy ra khi tải dữ liệu.'}
          </p>
          <div className="pt-2">
            <AppButton onClick={() => navigate('/tours')}>Quay lại danh sách tour</AppButton>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 lg:pb-12">
      {/* ── Progress Steps ── */}
      <nav aria-label="Tiến trình đặt tour" className="mb-10">
        <ol className="flex items-center justify-center gap-0">
          {[
            { label: 'Chọn lịch', done: !!selectedScheduleId },
            { label: 'Thông tin', done: fields.length > 0 },
            { label: 'Thanh toán', done: false },
          ].map((step, i, arr) => (
            <li key={step.label} className="flex items-center">
              <span className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step.done
                      ? 'bg-primary text-primary-foreground'
                      : i === arr.findIndex((s) => !s.done)
                        ? 'bg-primary/15 text-primary ring-2 ring-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-sm font-semibold hidden sm:inline ${
                    step.done || i === arr.findIndex((s) => !s.done)
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </span>
              {i < arr.length - 1 && (
                <div
                  className={`mx-3 h-px w-8 sm:w-14 ${step.done ? 'bg-primary' : 'bg-border'}`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Page Header ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Đặt tour mới</h1>
        <p className="text-muted-foreground mt-2 font-medium text-sm">
          Vui lòng điền đầy đủ thông tin danh sách thành viên tham gia tour.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]"
      >
        {/* ================================================================
            LEFT COLUMN — Input Details
        ================================================================ */}
        <div className="space-y-6">
          {/* ── Schedule Selection ── */}
          <AppCard className="p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar className="h-[18px] w-[18px]" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">Chọn ngày khởi hành</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {openSchedules.length} lịch khả dụng
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {openSchedules.map((s) => {
                const remaining = Math.max(0, s.availableSlots - s.bookedSlots);
                const isSelected = selectedScheduleId === s.scheduleId;
                const isLow = remaining <= 3 && remaining > 0;

                return (
                  <button
                    key={s.scheduleId}
                    type="button"
                    onClick={() => handleScheduleSelect(s.scheduleId)}
                    className={`relative flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          className="h-3 w-3 text-primary-foreground"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}

                    <span className="font-bold text-sm text-foreground">
                      {new Date(s.departureDate).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className={`text-[11px] mt-1 font-semibold ${
                        isLow ? 'text-destructive' : 'text-muted-foreground'
                      }`}
                    >
                      Còn {remaining} chỗ
                    </span>
                    <span className="text-base font-extrabold mt-2 text-foreground">
                      {formatPrice(s.price)}đ
                    </span>
                  </button>
                );
              })}
            </div>

            {errors.scheduleId && (
              <p className="text-xs text-destructive mt-3">{errors.scheduleId.message}</p>
            )}
          </AppCard>

          {/* ── Participant List ── */}
          <AppCard className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base">
                    Danh sách người tham gia
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {fields.length} người · Tối đa {remainingSlots} người
                  </p>
                </div>
              </div>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                disabled={fields.length >= remainingSlots}
                onClick={addParticipant}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Thêm người
              </AppButton>
            </div>

            {errors.participants?.root && (
              <p className="text-xs text-destructive mb-4 font-semibold">
                {errors.participants.root.message}
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const isExpanded = expandedParticipants.has(index);
                const pv = participantsList?.[index];

                return (
                  <div
                    key={field.id}
                    ref={(el) => {
                      if (el) participantRefs.current.set(index, el);
                    }}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isExpanded
                        ? 'border-primary/30 bg-card shadow-sm'
                        : 'border-border bg-muted/30 hover:border-border'
                    }`}
                  >
                    {/* Collapsed header — always visible */}
                    <button
                      type="button"
                      onClick={() => toggleParticipant(index)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            pv?.fullName
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-foreground block">
                            {pv?.fullName || `Người tham gia ${index + 1}`}
                          </span>
                          {!isExpanded && (
                            <ParticipantSummary
                              name={pv?.fullName || ''}
                              phone={pv?.phone || ''}
                              index={index}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {fields.length > 1 && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeParticipant(index);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                removeParticipant(index);
                              }
                            }}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors cursor-pointer"
                            title="Xóa người tham gia"
                          >
                            <Trash2 className="h-4 w-4" />
                          </span>
                        )}
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded form */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-1 space-y-4 border-t border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                          <AppFormInput
                            control={control}
                            name={`participants.${index}.fullName`}
                            label="Họ và tên *"
                            placeholder="Nguyễn Văn A"
                          />
                          <AppFormInput
                            control={control}
                            name={`participants.${index}.phone`}
                            label="Số điện thoại *"
                            placeholder="0987654321"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <AppFormDatePicker
                            control={control}
                            name={`participants.${index}.dateOfBirth`}
                            label="Ngày sinh *"
                            placeholderText="Chọn ngày sinh..."
                            className="w-full"
                          />
                          <div className="space-y-2">
                            <label
                              htmlFor={`participants.${index}.gender`}
                              className="text-sm font-medium text-foreground block"
                            >
                              Giới tính *
                            </label>
                            <select
                              id={`participants.${index}.gender`}
                              {...register(`participants.${index}.gender`)}
                              className="w-full h-10 px-3 bg-card border border-input rounded-md text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                            >
                              <option value="MALE">Nam</option>
                              <option value="FEMALE">Nữ</option>
                              <option value="OTHER">Khác</option>
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
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <AppFormInput
                            control={control}
                            name={`participants.${index}.email`}
                            label="Email"
                            placeholder="nguyenvana@gmail.com"
                          />
                          <AppFormInput
                            control={control}
                            name={`participants.${index}.address`}
                            label="Địa chỉ"
                            placeholder="Cầu Giấy, Hà Nội"
                          />
                        </div>

                        <AppFormInput
                          control={control}
                          name={`participants.${index}.specialRequirements`}
                          label="Yêu cầu đặc biệt"
                          placeholder="Không ăn được thịt bò, dị ứng thực phẩm..."
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </AppCard>
        </div>

        {/* ================================================================
            RIGHT COLUMN — Order Summary + Policies

            `sticky` đặt ở wrapper (không phải riêng thẻ Tóm tắt) để 2 card dính
            và cuộn cùng nhau — nếu chỉ thẻ Tóm tắt sticky, nó sẽ đè lên card
            chính sách nằm dưới khi người dùng cuộn trang. Cao quá viewport thì
            cuộn nội bộ; popover voucher render qua Portal nên không bị cắt.
        ================================================================ */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          {/* ── Order Summary Card ── */}
          <AppCard className="p-6">
            <h3 className="font-extrabold text-foreground text-base tracking-tight pb-4 border-b border-border mb-4">
              Tóm tắt đơn hàng
            </h3>

            {/* Mini Tour Card */}
            <div className="flex gap-3 mb-5">
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
                className="w-16 h-16 rounded-xl object-cover ring-1 ring-border"
              />
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2">
                  {tour.tourName}
                </h4>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
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
                {selectedSchedule && (
                  <div className="flex items-center gap-1.5 text-muted-foreground mt-1 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{tour.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Voucher ── */}
            <div className="mb-5 pt-4 border-t border-border">
              <label
                htmlFor="voucherCodeInput"
                className="text-foreground font-bold text-xs mb-2 flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5 text-primary" />
                Mã ưu đãi
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  id="voucherCodeInput"
                  type="text"
                  className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 outline-none w-full text-foreground font-bold text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  placeholder="Nhập mã..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isValidatingVoucher}
                  onClick={() => handleApplyVoucher()}
                  className="shrink-0"
                >
                  {isValidatingVoucher ? '...' : 'Áp dụng'}
                </AppButton>
              </div>

              {/* Applied voucher badge */}
              {appliedVoucher && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
                  <span className="text-xs font-bold text-primary">✓ {appliedVoucher.code}</span>
                  <span className="text-xs text-destructive font-bold ml-auto">
                    -{formatPrice(appliedVoucher.discountAmount)}đ
                  </span>
                </div>
              )}

              {voucherError && (
                <p className="text-xs text-destructive mt-2 font-medium">{voucherError}</p>
              )}

              {/* ── Ưu đãi dành cho bạn — ticket-style coupons ── */}
              {activeVouchers.length > 0 && (
                <div className="mt-3">
                  <Popover>
                    <PopoverTrigger className="w-full flex items-center justify-between text-xs font-bold text-primary hover:bg-primary/5 rounded-xl px-3 py-2.5 cursor-pointer transition-colors border border-dashed border-primary/25 group">
                      <span className="flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5" />
                        Ưu đãi dành cho bạn
                      </span>
                      <span className="bg-primary/10 text-primary text-[11px] font-extrabold px-2 py-0.5 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {activeVouchers.length}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="end"
                      sideOffset={8}
                      className="w-[340px] bg-card border border-border rounded-2xl shadow-xl p-0 overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="px-4 pt-4 pb-3 border-b border-border">
                        <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                            <Gift className="h-3.5 w-3.5 text-primary" />
                          </span>
                          Ưu đãi dành cho bạn
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-semibold mt-1">
                          Chọn mã để áp dụng ngay
                        </p>
                      </div>

                      {/* Voucher list */}
                      <div className="max-h-56 overflow-y-auto p-3 space-y-2">
                        {activeVouchers.map((voucher) => {
                          const isApplied = appliedVoucher?.code === voucher.code;
                          return (
                            <button
                              type="button"
                              key={voucher.voucherId}
                              onClick={() => {
                                setVoucherCode(voucher.code);
                                handleApplyVoucher(voucher.code);
                              }}
                              disabled={isApplied}
                              className={`w-full group relative flex overflow-hidden rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-ring ${
                                isApplied
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                  : 'border-border hover:border-primary/40 hover:shadow-md'
                              }`}
                            >
                              {/* Left stub — discount value */}
                              <div className="flex flex-col items-center justify-center w-20 shrink-0 bg-primary/10 px-2 py-3 relative">
                                <span className="font-extrabold text-base text-primary leading-none">
                                  {voucher.discountType === 'PERCENTAGE'
                                    ? `${voucher.discountValue}%`
                                    : formatPrice(voucher.discountValue)}
                                </span>
                                <span className="text-[9px] font-bold text-primary/70 mt-1 uppercase tracking-wider">
                                  {voucher.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Giảm'}
                                </span>
                                {/* Notch circles */}
                                <span className="absolute -top-1.5 right-0 w-3 h-3 rounded-full bg-card" />
                                <span className="absolute -bottom-1.5 right-0 w-3 h-3 rounded-full bg-card" />
                              </div>

                              {/* Dashed separator */}
                              <div className="w-px border-r border-dashed border-border/60 self-stretch my-2" />

                              {/* Right content */}
                              <div className="flex-1 px-3 py-2.5 flex flex-col justify-between min-w-0">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono font-extrabold text-xs text-foreground bg-muted/80 px-2 py-0.5 rounded-md truncate">
                                      {voucher.code}
                                    </span>
                                    {isApplied && (
                                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                        Đã chọn
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] font-semibold text-muted-foreground">
                                    Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}đ
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-1.5">
                                  <p className="text-[10px] text-muted-foreground/70">
                                    HSD: {new Date(voucher.validUntil).toLocaleDateString('vi-VN')}
                                  </p>
                                  {!isApplied && (
                                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                      Nhấn để chọn →
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* ── Cost Breakdown ── */}
            <div className="space-y-3 pt-4 border-t border-border mb-5">
              <div className="flex justify-between items-center text-muted-foreground font-semibold text-sm">
                <span>Số lượng người tham gia</span>
                <span className="text-foreground">{participantsCount} người</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground font-semibold text-sm">
                <span>Đơn giá</span>
                <span className="text-foreground">{formatPrice(basePrice)}đ</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground font-semibold text-sm">
                <span>Tạm tính</span>
                <span className="text-foreground">{formatPrice(subtotal)}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-muted-foreground font-semibold text-sm">
                  <span>Giảm giá</span>
                  <span className="text-destructive">-{formatPrice(discount)}đ</span>
                </div>
              )}
              <div className="flex justify-between items-center text-foreground font-extrabold text-base pt-3 border-t-2 border-dashed border-border">
                <span>Tổng cộng</span>
                <span className="text-lg text-primary">{formatPrice(total)}đ</span>
              </div>
            </div>

            {/* ── CTA Button ── */}
            <AppButton
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 text-sm font-bold gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Đang tạo giao dịch...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Thanh toán ngay
                </>
              )}
            </AppButton>

            <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium">
              Thanh toán an toàn &middot; Xác nhận qua email
            </p>
          </AppCard>

          {/* ── Cancellation Policy — cho khách nắm rõ trước khi thanh toán ── */}
          <CancellationPolicyNotice policies={tour.cancellationPolicies} />
        </div>
      </form>

      {/* ── Mobile Sticky CTA ──
          Nằm ngoài <form> nên phải dùng type="button" + handleSubmit thủ công;
          để type="submit" ở đây sẽ không kích hoạt submit của form. */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 py-3 lg:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-semibold">Tổng cộng</p>
            <p className="text-lg font-extrabold text-primary">{formatPrice(total)}đ</p>
          </div>
          <AppButton
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onFormSubmit)}
            className="shrink-0 px-6 font-bold gap-2"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              'Thanh toán'
            )}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
