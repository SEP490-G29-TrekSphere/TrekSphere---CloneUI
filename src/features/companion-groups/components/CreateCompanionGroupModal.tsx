import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlignLeft,
  Calendar,
  Clock,
  Copy,
  Info,
  Loader2,
  MapPin,
  Plus,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PATHS } from '@/constants/paths';
import { useTours } from '@/features/tours/hooks/useTours';
import { AppDatePicker } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useCreateMatchingGroup } from '../hooks/useCreateMatchingGroup';

// ---------------------------------------------------------------------------
// Validation Schema — maps 1-to-1 with POST /api/v1/matching-groups body
// ---------------------------------------------------------------------------
const createGroupSchema = z
  .object({
    tourId: z.string().uuid('Vui lòng chọn Tour hợp lệ').min(1, 'Vui lòng chọn Tour bạn muốn đi'),
    groupName: z
      .string()
      .min(3, 'Tên nhóm phải có ít nhất 3 ký tự')
      .max(100, 'Tên nhóm tối đa 100 ký tự'),
    description: z.string().optional(),
    maxSize: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() !== '' ? Number(val) : val),
      z
        .number({ message: 'Số lượng phải là con số' })
        .min(2, 'Tối thiểu 2 người')
        .max(100, 'Tối đa 100 người')
        .int()
    ),
    targetDate: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
    matchingDeadline: z.string().min(1, 'Vui lòng chọn hạn chót đăng ký'),
  })
  .refine(
    (data) => {
      if (!data.targetDate || !data.matchingDeadline) return true;
      return new Date(data.matchingDeadline) <= new Date(data.targetDate);
    },
    {
      message: 'Hạn chót đăng ký phải trước hoặc bằng ngày khởi hành',
      path: ['matchingDeadline'],
    }
  );

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface CreateCompanionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVendorClone?: () => void;
}

export function CreateCompanionGroupModal({
  isOpen,
  onClose,
  onOpenVendorClone,
}: CreateCompanionGroupModalProps) {
  const navigate = useNavigate();
  const createMutation = useCreateMatchingGroup();

  // Fetch real tour list — load a generous page to populate the dropdown
  const { tours, isLoading: toursLoading } = useTours({ page: 0, size: 100 });

  const form = useForm<
    z.input<typeof createGroupSchema>,
    undefined,
    z.output<typeof createGroupSchema>
  >({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      tourId: '',
      groupName: '',
      description: '',
      maxSize: 4,
      targetDate: '',
      matchingDeadline: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateGroupFormValues) => {
    // Build ISO date-time for matchingDeadline (the form gives 'yyyy-MM-ddTHH:mm')
    const matchingDeadlineIso = data.matchingDeadline.includes('T')
      ? `${data.matchingDeadline}:00.000Z`
      : `${data.matchingDeadline}T00:00:00.000Z`;

    try {
      const newGroup = await createMutation.mutateAsync({
        tourId: data.tourId,
        groupName: data.groupName,
        description: data.description,
        maxSize: data.maxSize,
        targetDate: data.targetDate,
        matchingDeadline: matchingDeadlineIso,
      });

      toast.success('Tạo nhóm đồng hành thành công! Nhóm của bạn đã được đăng công khai.');
      form.reset();
      onClose();
      navigate(`${PATHS.GROUPS}/${newGroup.matchingGroupId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tạo nhóm thất bại. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const isPending = createMutation.isPending;
  const description = form.watch('description') || '';
  const maxDescriptionLength = 500;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-card rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="px-6 py-5 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold text-foreground">Tạo nhóm đồng hành</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Khởi tạo nhóm mới để tìm kiếm những người bạn cùng chung đam mê khám phá.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 hide-scrollbar">
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
            {/* Vendor Tour Clone Shortcut Banner */}
            {onOpenVendorClone && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Copy className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Muốn tạo nhanh từ Lịch trình có sẵn?</span> Kế thừa
                    Checkpoints & vật dụng từ Tour mẫu Vendor.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVendorClone();
                  }}
                  className="rounded-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-[11px] font-bold shrink-0 transition"
                >
                  Dùng Tour Vendor (Clone)
                </button>
              </div>
            )}

            {/* Tour Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Chọn tour <span className="text-destructive">*</span>
              </label>
              <div className="relative group">
                <select
                  {...form.register('tourId')}
                  disabled={toursLoading || isPending}
                  className="w-full h-11 px-4 pr-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm font-medium text-foreground transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                >
                  <option value="" disabled>
                    {toursLoading ? 'Đang tải...' : 'Chọn điểm đến của bạn'}
                  </option>
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {form.formState.errors.tourId && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <Info className="w-3.5 h-3.5" />
                  {form.formState.errors.tourId.message}
                </p>
              )}
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Tên nhóm <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...form.register('groupName')}
                disabled={isPending}
                placeholder="Ví dụ: Nhóm Fansipan tháng 8"
                className="w-full h-11 px-4 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all disabled:opacity-50 outline-none"
              />
              {form.formState.errors.groupName && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <Info className="w-3.5 h-3.5" />
                  {form.formState.errors.groupName.message}
                </p>
              )}
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Departure Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Khởi hành <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="targetDate"
                  control={form.control}
                  render={({ field }) => (
                    <AppDatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date: Date | null) => {
                        if (!date) {
                          field.onChange('');
                          return;
                        }
                        const offset = date.getTimezoneOffset();
                        const localDate = new Date(date.getTime() - offset * 60 * 1000);
                        field.onChange(localDate.toISOString().split('T')[0]);
                      }}
                      disabled={isPending}
                      className="w-full h-11 px-4 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm font-medium text-foreground transition-all cursor-pointer outline-none"
                      placeholderText="Chọn ngày"
                    />
                  )}
                />
                {form.formState.errors.targetDate && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <Info className="w-3.5 h-3.5" />
                    {form.formState.errors.targetDate.message}
                  </p>
                )}
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Hạn đăng ký <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="matchingDeadline"
                  control={form.control}
                  render={({ field }) => (
                    <AppDatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date: Date | null) => {
                        if (!date) {
                          field.onChange('');
                          return;
                        }
                        const offset = date.getTimezoneOffset();
                        const localDate = new Date(date.getTime() - offset * 60 * 1000);
                        field.onChange(localDate.toISOString().slice(0, 16));
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Giờ"
                      disabled={isPending}
                      className="w-full h-11 px-4 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm font-medium text-foreground transition-all cursor-pointer outline-none"
                      placeholderText="Chọn hạn"
                    />
                  )}
                />
                {form.formState.errors.matchingDeadline && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <Info className="w-3.5 h-3.5" />
                    {form.formState.errors.matchingDeadline.message}
                  </p>
                )}
              </div>

              {/* Max Members */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Số người tối đa <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  {...form.register('maxSize')}
                  disabled={isPending}
                  placeholder="4"
                  className="w-full h-11 px-4 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all disabled:opacity-50 outline-none"
                />
                {form.formState.errors.maxSize && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <Info className="w-3.5 h-3.5" />
                    {form.formState.errors.maxSize.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlignLeft className="w-4 h-4 text-muted-foreground" />
                Mô tả nhóm
                <span className="text-xs font-normal text-muted-foreground">(Không bắt buộc)</span>
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  {...form.register('description')}
                  disabled={isPending}
                  maxLength={maxDescriptionLength}
                  placeholder="Chia sẻ về bản thân, yêu cầu thể lực, kinh nghiệm mong muốn của thành viên..."
                  className="w-full px-4 py-3 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all resize-none disabled:opacity-50 outline-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {description.length}/{maxDescriptionLength}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg">
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
                Nhóm của bạn sẽ được hiển thị công khai ngay sau khi tạo. Các thành viên khác có thể
                gửi yêu cầu tham gia và bạn sẽ quyết định chấp nhận hay từ chối.
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-2 border border-input bg-background hover:bg-muted hover:text-foreground rounded-lg font-medium text-sm text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Tạo nhóm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
