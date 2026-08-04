import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PATHS } from '@/constants/paths';
import { useTours } from '@/features/tours/hooks/useTours';
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
}

export function CreateCompanionGroupModal({ isOpen, onClose }: CreateCompanionGroupModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#FAF8F5] dark:bg-card border border-stone-200 dark:border-border rounded-[2.5rem] p-6 sm:p-10 max-w-5xl w-full shadow-2xl relative my-8">
        {/* Main Grid: Left Banner + Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (Banner & Tips) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Green Scenic Banner */}
            <div className="relative rounded-[2rem] overflow-hidden min-h-[320px] lg:min-h-[420px] flex flex-col justify-end p-6 sm:p-8 text-white bg-[#0d2a22] shadow-lg">
              <div className="relative z-10 space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  Kết nối đam mê,
                  <br />
                  Chia sẻ hành trình.
                </h3>
                <p className="text-xs sm:text-sm text-stone-200 font-medium leading-relaxed">
                  Tạo nhóm để tìm kiếm những người bạn đồng hành chung chí hướng cho chuyến đi sắp
                  tới của bạn.
                </p>
              </div>
            </div>

            {/* Note box */}
            <div className="bg-[#F5F2EA] dark:bg-muted/40 border border-stone-200/70 dark:border-border/60 rounded-[1.5rem] p-5 space-y-3">
              <span className="text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase block">
                Lưu ý cho bạn
              </span>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                  Mô tả chi tiết giúp bạn nhanh chóng tìm được người phù hợp nhất.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                  Số lượng người nên cân đối với độ khó của tour trekking.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                  Hạn chót đăng ký nên đặt trước ngày khởi hành để có thời gian chuẩn bị.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Form Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-foreground tracking-tight">
                  Tạo Nhóm Đồng Hành
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-muted-foreground mt-1">
                  Điền thông tin bên dưới để bắt đầu tìm kiếm đồng đội.
                </p>
              </div>

              {/* Form Inputs */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Field 1: Tour Select */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                    CHỌN TOUR MUỐN ĐI <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <select
                      {...form.register('tourId')}
                      disabled={toursLoading}
                      className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-10 text-sm font-medium text-stone-800 dark:text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-[#1f3933] cursor-pointer disabled:opacity-60"
                    >
                      <option value="" disabled>
                        {toursLoading ? 'Đang tải danh sách tour...' : 'Tìm điểm đến của bạn...'}
                      </option>
                      {tours.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      ▼
                    </div>
                  </div>
                  {form.formState.errors.tourId && (
                    <p className="text-xs text-red-500 mt-1 pl-2">
                      {form.formState.errors.tourId.message}
                    </p>
                  )}
                </div>

                {/* Field 2: Group Name */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                    TÊN NHÓM <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                      <Tag className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      {...form.register('groupName')}
                      placeholder="Ví dụ: Nhóm Fansipan tháng 8 🏔️"
                      className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-stone-800 dark:text-foreground placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1f3933]"
                    />
                  </div>
                  {form.formState.errors.groupName && (
                    <p className="text-xs text-red-500 mt-1 pl-2">
                      {form.formState.errors.groupName.message}
                    </p>
                  )}
                </div>

                {/* Grid row: Date & Deadline & Members */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Field 3: Target Date */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                      NGÀY KHỞI HÀNH <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        {...form.register('targetDate')}
                        className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-stone-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#1f3933]"
                      />
                    </div>
                    {form.formState.errors.targetDate && (
                      <p className="text-xs text-red-500 mt-1 pl-2">
                        {form.formState.errors.targetDate.message}
                      </p>
                    )}
                  </div>

                  {/* Field 4: Matching Deadline */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                      HẠN ĐĂNG KÝ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                        <Clock className="w-5 h-5" />
                      </div>
                      <input
                        type="datetime-local"
                        {...form.register('matchingDeadline')}
                        className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-stone-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#1f3933]"
                      />
                    </div>
                    {form.formState.errors.matchingDeadline && (
                      <p className="text-xs text-red-500 mt-1 pl-2">
                        {form.formState.errors.matchingDeadline.message}
                      </p>
                    )}
                  </div>

                  {/* Field 5: Max Size */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                      SỐ NGƯỜI TỐI ĐA <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                        <Users className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        min={2}
                        max={100}
                        {...form.register('maxSize')}
                        placeholder="Ví dụ: 8"
                        className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-stone-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#1f3933]"
                      />
                    </div>
                    {form.formState.errors.maxSize && (
                      <p className="text-xs text-red-500 mt-1 pl-2">
                        {form.formState.errors.maxSize.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Field 6: Description */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                    MÔ TẢ LỜI MỜI
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-4 text-stone-500 pointer-events-none">
                      <FileText className="w-5 h-5" />
                    </div>
                    <textarea
                      rows={4}
                      {...form.register('description')}
                      placeholder="Chia sẻ thêm về bản thân, yêu cầu về thể lực hoặc kinh nghiệm của thành viên bạn muốn tìm..."
                      className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl p-4 pl-12 text-sm font-medium text-stone-800 dark:text-foreground placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1f3933] resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 bg-[#0a231c] hover:bg-[#071914] text-white rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo nhóm...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Đăng bài</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-stone-500 dark:text-muted-foreground mt-3">
                    Nhóm sẽ được hiển thị công khai ngay sau khi tạo.
                  </p>
                </div>
              </form>
            </div>

            {/* Modal Close Button */}
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="text-xs text-stone-500 hover:text-stone-800 dark:text-muted-foreground dark:hover:text-foreground font-semibold underline cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ / Đóng lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
