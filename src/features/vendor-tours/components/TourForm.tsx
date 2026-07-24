import { zodResolver } from '@hookform/resolvers/zod';
import { Bold, Eye, ImagePlus, Info, Italic, Link2, List, Sparkles, Zap } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { profileService } from '@/features/profile/services/profileService';
import { toast } from '@/store/useToastStore';
import type { CheckpointSubmitItem, CreateTourPayload } from '../types';
import { type CheckpointDraft, CheckpointFields } from './CheckpointFields';

/** Form Tạo/Sửa chỉ hỗ trợ 3 mức độ khó (khớp đúng zod enum bên dưới). */
type FormDifficulty = 'EASY' | 'MODERATE' | 'HARD';

const DIFFICULTY_OPTIONS: Array<{ value: FormDifficulty; label: string }> = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Vừa' },
  { value: 'HARD', label: 'Khó' },
];

const MAX_COVER_SIZE_MB = 5;

const tourFormSchema = z
  .object({
    tourName: z.string().trim().min(1, 'Vui lòng nhập tên tour'),
    difficulty: z.enum(['EASY', 'MODERATE', 'HARD']),
    basePrice: z.coerce.number().min(0, 'Giá tiền không hợp lệ'),
    startingPoint: z.string().trim().min(1, 'Vui lòng nhập điểm bắt đầu'),
    endingPoint: z.string().trim().min(1, 'Vui lòng nhập điểm kết thúc'),
    minCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    maxCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    durationDays: z.coerce.number().int().min(1, 'Tối thiểu 1 ngày'),
    description: z.string().trim().min(1, 'Vui lòng nhập lịch trình chi tiết'),
  })
  .refine((data) => data.maxCapacity >= data.minCapacity, {
    message: 'Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu',
    path: ['maxCapacity'],
  });

/** Giá trị sau khi zod coerce (số thật) — dùng khi submit. */
type TourFormValues = z.output<typeof tourFormSchema>;
/** Giá trị trước khi coerce (khớp kiểu input HTML) — dùng cho defaultValues/register. */
type TourFormInput = z.input<typeof tourFormSchema>;

const EMPTY_DEFAULTS: TourFormInput = {
  tourName: '',
  difficulty: 'EASY',
  basePrice: 0,
  startingPoint: '',
  endingPoint: '',
  minCapacity: 1,
  maxCapacity: 1,
  durationDays: 1,
  description: '',
};

export interface TourFormProps {
  mode: 'create' | 'edit';
  /** Giá trị có sẵn để đổ vào form khi sửa — merge lên trên `EMPTY_DEFAULTS`. */
  defaultValues?: Partial<TourFormInput>;
  /** URL ảnh bìa hiện có (màn Sửa) — hiển thị sẵn trong preview, gửi lại nếu user không đổi ảnh. */
  existingCoverImageUrl?: string;
  /** Checkpoint đã có sẵn (màn Sửa) — mỗi item mang `checkpointId` thật để PUT/DELETE đúng. */
  initialCheckpoints?: CheckpointDraft[];
  /** Đang submit ở phía component cha (gọi API tạo/sửa) — dùng để disable nút. */
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (
    payload: CreateTourPayload,
    checkpoints: CheckpointSubmitItem[],
    deletedCheckpointIds: string[]
  ) => void;
}

/** Form dùng chung cho 2 màn Tạo Tour / Sửa Tour (cả Vendor Manager lẫn Vendor Staff) — chỉ khác nhau qua prop `mode`. */
export function TourForm({
  mode,
  defaultValues,
  existingCoverImageUrl,
  initialCheckpoints,
  isSubmitting: isParentSubmitting,
  onCancel,
  onSubmit: onSubmitProp,
}: TourFormProps) {
  const isEdit = mode === 'edit';

  const [checkpoints, setCheckpoints] = useState<CheckpointDraft[]>(initialCheckpoints ?? []);
  // Checkpoint id đã tồn tại lúc mở form — dùng để tính checkpoint nào bị xóa lúc submit
  // (còn lại trong `checkpoints` thì giữ/sửa, biến mất khỏi đây thì là bị xóa).
  const originalCheckpointIdsRef = useRef(
    new Set(
      (initialCheckpoints ?? []).map((c) => c.checkpointId).filter((id): id is string => !!id)
    )
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(existingCoverImageUrl ?? null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  // 2 công tắc dưới đây chưa có field tương ứng trên BE (CreateTourRequest không có
  // isPublic/instantBooking) — chỉ là UI hiển thị, không gửi lên API.
  const [isPublicDisplay, setIsPublicDisplay] = useState(true);
  const [instantBooking, setInstantBooking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TourFormInput, unknown, TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const difficulty = watch('difficulty');

  const handleCoverChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
      toast.error(`Ảnh tối đa ${MAX_COVER_SIZE_MB}MB.`);
      return;
    }
    setCoverPreview(URL.createObjectURL(file));
    setCoverFile(file);
  };

  const onSubmit = async (values: TourFormValues) => {
    let coverImageUrl: string | undefined = existingCoverImageUrl;

    if (coverFile) {
      setIsUploadingImages(true);
      const uploadRes = await profileService.uploadFile(coverFile, 'tours');
      setIsUploadingImages(false);
      if (uploadRes.error || !uploadRes.data) {
        toast.error(uploadRes.error || 'Không thể tải ảnh bìa lên.');
        return;
      }
      coverImageUrl = uploadRes.data;
    }

    const payload: CreateTourPayload = {
      tourName: values.tourName,
      description: values.description,
      difficulty: values.difficulty,
      location: `${values.startingPoint} → ${values.endingPoint}`,
      durationDays: values.durationDays,
      basePrice: values.basePrice,
      minCapacity: values.minCapacity,
      maxCapacity: values.maxCapacity,
      coverImageUrl,
    };

    const activeCheckpoints = checkpoints.filter((checkpoint) => checkpoint.name.trim());
    const checkpointItems: CheckpointSubmitItem[] = [];

    for (const [index, checkpoint] of activeCheckpoints.entries()) {
      let checkpointImageUrl = checkpoint.imageUrl;

      if (checkpoint.imageFile) {
        setIsUploadingImages(true);
        const uploadRes = await profileService.uploadFile(checkpoint.imageFile, 'checkpoints');
        setIsUploadingImages(false);
        if (uploadRes.error || !uploadRes.data) {
          toast.error(uploadRes.error || 'Không thể tải ảnh checkpoint lên.');
          return;
        }
        checkpointImageUrl = uploadRes.data;
      }

      checkpointItems.push({
        checkpointId: checkpoint.checkpointId,
        payload: {
          checkpointName: checkpoint.name.trim(),
          description: checkpoint.description.trim() || undefined,
          checkpointOrder: index + 1,
          latitude: checkpoint.latitude.trim() ? Number(checkpoint.latitude) : undefined,
          longitude: checkpoint.longitude.trim() ? Number(checkpoint.longitude) : undefined,
          altitude: checkpoint.altitude.trim() ? Number(checkpoint.altitude) : undefined,
          checkpointImageUrl,
        },
      });
    }

    // Checkpoint cũ nào không còn trong danh sách active (bị bấm xóa) → cần DELETE.
    const keptIds = new Set(checkpointItems.map((item) => item.checkpointId).filter(Boolean));
    const deletedCheckpointIds = [...originalCheckpointIdsRef.current].filter(
      (id) => !keptIds.has(id)
    );

    onSubmitProp(payload, checkpointItems, deletedCheckpointIds);
  };

  const isSaving = isSubmitting || isUploadingImages || isParentSubmitting;
  const submitLabelSaving = isEdit ? 'Đang cập nhật...' : 'Đang lưu...';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            {isEdit ? 'Sửa Tour' : 'Tạo Tour Mới'}
          </h2>
          <p className="mt-1 text-sm font-medium" style={{ color: '#6F7B75' }}>
            {isEdit
              ? 'Cập nhật thông tin hành trình trekking bên dưới.'
              : 'Điền đầy đủ thông tin bên dưới để đăng tải hành trình trekking mới lên hệ thống.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Cột trái — 60% */}
        <div className="space-y-6 lg:col-span-3">
          <section
            className="space-y-5 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Thông tin cơ bản
            </h3>

            <div>
              <label
                htmlFor="tourName"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Tên Tour <span className="text-red-500">*</span>
              </label>
              <input
                id="tourName"
                type="text"
                {...register('tourName')}
                placeholder="Ví dụ: Chinh phục đỉnh Fansipan 3 ngày 2 đêm"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.tourName && (
                <p className="mt-1 text-xs text-red-500">{errors.tourName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-sm font-semibold" style={{ color: '#06261D' }}>
                  Độ khó
                </span>
                <div
                  className="flex rounded-xl p-1"
                  style={{ backgroundColor: '#F8F6EF' }}
                  role="radiogroup"
                  aria-label="Độ khó"
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('difficulty', opt.value, { shouldValidate: true })}
                      className="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors"
                      style={
                        difficulty === opt.value
                          ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                          : { color: '#6F7B75' }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="basePrice"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Giá tiền (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="basePrice"
                    type="number"
                    min={0}
                    {...register('basePrice')}
                    placeholder="0"
                    className="w-full rounded-xl px-4 py-2.5 pr-14 text-sm font-medium focus:outline-none focus:ring-1"
                    style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                  />
                  <span
                    className="absolute inset-y-0 right-4 flex items-center text-xs font-bold"
                    style={{ color: '#6F7B75' }}
                  >
                    VNĐ
                  </span>
                </div>
                {errors.basePrice && (
                  <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startingPoint"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Điểm bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  id="startingPoint"
                  type="text"
                  {...register('startingPoint')}
                  placeholder="Ví dụ: Hà Nội"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.startingPoint && (
                  <p className="mt-1 text-xs text-red-500">{errors.startingPoint.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="endingPoint"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Điểm kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  id="endingPoint"
                  type="text"
                  {...register('endingPoint')}
                  placeholder="Ví dụ: Đỉnh Fansipan"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.endingPoint && (
                  <p className="mt-1 text-xs text-red-500">{errors.endingPoint.message}</p>
                )}
              </div>
            </div>

            {/* BE bắt buộc minCapacity/maxCapacity — không có trong thiết kế gốc nhưng
                thiếu thì không tạo được tour, nên thêm 2 ô này vào form. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="minCapacity"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Số khách tối thiểu <span className="text-red-500">*</span>
                </label>
                <input
                  id="minCapacity"
                  type="number"
                  min={1}
                  {...register('minCapacity')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.minCapacity && (
                  <p className="mt-1 text-xs text-red-500">{errors.minCapacity.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="maxCapacity"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Số khách tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  id="maxCapacity"
                  type="number"
                  min={1}
                  {...register('maxCapacity')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.maxCapacity && (
                  <p className="mt-1 text-xs text-red-500">{errors.maxCapacity.message}</p>
                )}
              </div>
            </div>
          </section>

          <section
            className="space-y-4 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Lịch trình & Checkpoints
            </h3>
            <CheckpointFields checkpoints={checkpoints} onChange={setCheckpoints} />
          </section>

          <section
            className="space-y-3 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#6F7B75' }}
              >
                Lịch trình chi tiết
              </h3>
              <div className="flex items-center gap-3" style={{ color: '#6F7B75' }}>
                <Bold className="h-4 w-4" />
                <Italic className="h-4 w-4" />
                <List className="h-4 w-4" />
                <Link2 className="h-4 w-4" />
              </div>
            </div>
            <textarea
              {...register('description')}
              rows={8}
              placeholder="Mô tả lịch trình chi tiết từng ngày, các điểm dừng chân, dịch vụ bao gồm và lưu ý quan trọng..."
              className="w-full resize-none rounded-[20px] px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </section>
        </div>

        {/* Cột phải — 40% */}
        <div className="space-y-6 lg:col-span-2">
          <section
            className="space-y-4 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Thời lượng
            </h3>
            <div>
              <label
                htmlFor="durationDays"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Số ngày <span className="text-red-500">*</span>
              </label>
              <input
                id="durationDays"
                type="number"
                min={1}
                {...register('durationDays')}
                placeholder="Ví dụ: 3"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.durationDays && (
                <p className="mt-1 text-xs text-red-500">{errors.durationDays.message}</p>
              )}
            </div>
          </section>

          <section
            className="space-y-3 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Hình ảnh bìa
            </h3>
            <label
              htmlFor="coverImage"
              className="flex aspect-[3/2] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl"
              style={{ backgroundColor: '#F8F6EF', border: '1px dashed #D8D3C4' }}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Ảnh bìa tour" className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6" style={{ color: '#6F7B75' }} />
                  <span className="text-xs font-semibold" style={{ color: '#6F7B75' }}>
                    Chọn ảnh bìa
                  </span>
                </>
              )}
              <input
                id="coverImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverChange(file);
                }}
              />
            </label>
            <p className="flex items-start gap-1.5 text-xs" style={{ color: '#6F7B75' }}>
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Hình ảnh đẹp sẽ giúp tour của bạn thu hút hơn. Kích thước khuyến nghị: 1200 x 800px.
              Định dạng JPG, PNG.
            </p>
          </section>

          <section
            className="space-y-4 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Cấu hình hiển thị
            </h3>

            <ToggleRow
              icon={Eye}
              title="Hiển thị công khai"
              subtitle="Cho phép khách hàng tìm thấy tour"
              checked={isPublicDisplay}
              onChange={setIsPublicDisplay}
            />
            <ToggleRow
              icon={Zap}
              title="Đặt chỗ nhanh"
              subtitle="Xác nhận đơn ngay lập tức"
              checked={instantBooking}
              onChange={setInstantBooking}
            />

            <div className="rounded-2xl p-4" style={{ backgroundColor: '#DFF3E9' }}>
              <p
                className="flex items-start gap-2 text-xs font-medium"
                style={{ color: '#0E7C6B' }}
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Mẹo cho Vendor:</strong> Tours có độ khó "Vừa" và "Dễ" thường nhận được
                  lượng booking cao hơn 40% vào các dịp cuối tuần. Hãy đảm bảo bạn có đầy đủ các cấp
                  độ.
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>

      <hr style={{ borderColor: '#E6E2D1' }} />

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D3C4', color: '#06261D' }}
        >
          Quay lại danh sách
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: '#06261D' }}
        >
          {isSaving ? submitLabelSaving : isEdit ? 'Lưu thay đổi' : 'Xác nhận và Lưu'}
        </button>
      </div>
    </form>
  );
}

interface ToggleRowProps {
  icon: typeof Eye;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * `isPublicDisplay`/`instantBooking` ở trang cha chưa có field tương ứng trên
 * BE (CreateTourRequest không hỗ trợ) — toggle này chỉ đổi UI, không gửi API.
 */
function ToggleRow({ icon: Icon, title, subtitle, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0" style={{ color: '#6F7B75' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#06261D' }}>
            {title}
          </p>
          <p className="text-xs" style={{ color: '#6F7B75' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: checked ? '#06261D' : '#D8D3C4' }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}
