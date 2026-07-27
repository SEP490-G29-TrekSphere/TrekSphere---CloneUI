import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ApiScheduleStatus, CreateSchedulePayload, UpdateSchedulePayload } from '../types';

const STATUS_OPTIONS: Array<{ value: ApiScheduleStatus; label: string }> = [
  { value: 'OPEN', label: 'Đang mở' },
  { value: 'CLOSED', label: 'Đã đóng' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
];

const scheduleFormSchema = z
  .object({
    departureDate: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
    returnDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    price: z.coerce.number().min(0, 'Giá tiền không hợp lệ'),
    availableSlots: z.coerce.number().int().min(1, 'Tối thiểu 1 chỗ'),
    status: z.enum(['OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED']),
  })
  .refine((data) => data.returnDate >= data.departureDate, {
    message: 'Ngày kết thúc phải sau ngày khởi hành',
    path: ['returnDate'],
  });

/** Giá trị sau khi zod coerce (số thật) — dùng khi submit. */
type ScheduleFormValues = z.output<typeof scheduleFormSchema>;
/** Giá trị trước khi coerce (khớp kiểu input HTML) — dùng cho defaultValues/register. */
type ScheduleFormInput = z.input<typeof scheduleFormSchema>;

export interface ScheduleFormDefaultValues {
  departureDate: string;
  returnDate: string;
  price: number;
  availableSlots: number;
  status: ApiScheduleStatus;
}

const EMPTY_DEFAULTS: ScheduleFormInput = {
  departureDate: '',
  returnDate: '',
  price: 0,
  availableSlots: 1,
  status: 'OPEN',
};

export interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Giá trị có sẵn để đổ vào form — merge lên trên `EMPTY_DEFAULTS`. */
  defaultValues?: Partial<ScheduleFormDefaultValues>;
  /** Số chỗ đã đặt của lịch đang sửa — chặn không cho hạ `availableSlots` xuống dưới số này. */
  bookedSlots?: number;
  isPending?: boolean;
  onSubmit: (payload: CreateSchedulePayload | UpdateSchedulePayload) => void;
}

/**
 * Dialog dùng chung cho Tạo lịch khởi hành (`POST .../schedules`) và Sửa lịch
 * (`PUT .../schedules/{scheduleId}`) — chỉ mode 'edit' mới hiện ô Trạng thái,
 * vì `CreateScheduleRequest` không có field này (BE luôn tạo mới ở OPEN).
 */
export function ScheduleFormDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  bookedSlots = 0,
  isPending = false,
  onSubmit: onSubmitProp,
}: ScheduleFormDialogProps) {
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ScheduleFormInput, unknown, ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  // Đổ lại giá trị mỗi lần dialog mở, tránh giữ dữ liệu của lịch/lần mở trước (cho lịch khác).
  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ cần trigger reset khi mở dialog
  useEffect(() => {
    if (open) reset({ ...EMPTY_DEFAULTS, ...defaultValues });
  }, [open]);

  const submit = handleSubmit((values) => {
    if (isEdit && values.availableSlots < bookedSlots) {
      setError('availableSlots', {
        message: `Không thể đặt thấp hơn số chỗ đã đặt (${bookedSlots}).`,
      });
      return;
    }

    if (isEdit) {
      const payload: UpdateSchedulePayload = {
        departureDate: values.departureDate,
        returnDate: values.returnDate,
        price: values.price,
        availableSlots: values.availableSlots,
        status: values.status,
      };
      onSubmitProp(payload);
    } else {
      const payload: CreateSchedulePayload = {
        departureDate: values.departureDate,
        returnDate: values.returnDate,
        price: values.price,
        availableSlots: values.availableSlots,
      };
      onSubmitProp(payload);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? 'Sửa lịch khởi hành' : 'Tạo lịch khởi hành mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Điều chỉnh ngày đi, giá, số chỗ hoặc trạng thái của lịch khởi hành này.'
              : 'Thiết lập ngày đi, ngày về, giá riêng và giới hạn số chỗ cho lịch khởi hành mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="departureDate"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Ngày khởi hành <span className="text-red-500">*</span>
              </label>
              <input
                id="departureDate"
                type="date"
                {...register('departureDate')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.departureDate && (
                <p className="mt-1 text-xs text-red-500">{errors.departureDate.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="returnDate"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                id="returnDate"
                type="date"
                {...register('returnDate')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.returnDate && (
                <p className="mt-1 text-xs text-red-500">{errors.returnDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Giá vé (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                min={0}
                {...register('price')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label
                htmlFor="availableSlots"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Giới hạn số chỗ <span className="text-red-500">*</span>
              </label>
              <input
                id="availableSlots"
                type="number"
                min={isEdit ? bookedSlots : 1}
                {...register('availableSlots')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {isEdit && (
                <p className="mt-1 text-xs" style={{ color: '#6F7B75' }}>
                  Đã đặt: {bookedSlots} chỗ
                </p>
              )}
              {errors.availableSlots && (
                <p className="mt-1 text-xs text-red-500">{errors.availableSlots.message}</p>
              )}
            </div>
          </div>

          {isEdit && (
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Trạng thái
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter className="!mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-full text-white"
            style={{ backgroundColor: '#06261D' }}
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo lịch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
