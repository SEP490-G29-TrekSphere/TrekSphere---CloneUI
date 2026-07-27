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
import type { CreateVendorEquipmentPayload, UpdateVendorEquipmentPayload } from '../types';

const equipmentFormSchema = z.object({
  equipmentName: z.string().min(1, 'Vui lòng nhập tên dụng cụ'),
  description: z.string().optional(),
  totalQuantity: z.coerce
    .number()
    .int('Số lượng phải là số nguyên')
    .min(0, 'Số lượng không hợp lệ'),
});

/** Giá trị sau khi zod coerce (số thật) — dùng khi submit. */
type EquipmentFormValues = z.output<typeof equipmentFormSchema>;
/** Giá trị trước khi coerce (khớp kiểu input HTML) — dùng cho defaultValues/register. */
type EquipmentFormInput = z.input<typeof equipmentFormSchema>;

export interface EquipmentFormDefaultValues {
  equipmentName: string;
  description?: string;
  totalQuantity: number;
}

const EMPTY_DEFAULTS: EquipmentFormInput = {
  equipmentName: '',
  description: '',
  totalQuantity: 0,
};

export interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Giá trị có sẵn để đổ vào form — merge lên trên `EMPTY_DEFAULTS`. */
  defaultValues?: Partial<EquipmentFormDefaultValues>;
  isPending?: boolean;
  onSubmit: (payload: CreateVendorEquipmentPayload | UpdateVendorEquipmentPayload) => void;
}

/**
 * Dialog dùng chung cho Thêm dụng cụ (`POST /vendor/equipments`) và Sửa dụng cụ
 * (`PUT /vendor/equipments/{id}`) — 2 API nhận cùng shape payload nên form Sửa
 * giống hệt form Thêm, chỉ khác tiêu đề và giá trị mặc định đã đổ sẵn.
 */
export function EquipmentFormDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  isPending = false,
  onSubmit: onSubmitProp,
}: EquipmentFormDialogProps) {
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormInput, unknown, EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  // Đổ lại giá trị mỗi lần dialog mở, tránh giữ dữ liệu của dụng cụ/lần mở trước.
  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ cần trigger reset khi mở dialog
  useEffect(() => {
    if (open) reset({ ...EMPTY_DEFAULTS, ...defaultValues });
  }, [open]);

  const submit = handleSubmit((values) => {
    const payload: CreateVendorEquipmentPayload = {
      equipmentName: values.equipmentName,
      description: values.description || undefined,
      totalQuantity: values.totalQuantity,
    };
    onSubmitProp(payload);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? 'Sửa dụng cụ' : 'Thêm dụng cụ mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật tên, mô tả hoặc số lượng tồn kho của dụng cụ này.'
              : 'Nhập thông tin dụng cụ mới (lều, bộ đàm, túi cứu thương...) để thêm vào kho.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="equipmentName"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#06261D' }}
            >
              Tên dụng cụ <span className="text-red-500">*</span>
            </label>
            <input
              id="equipmentName"
              type="text"
              placeholder="Ví dụ: Lều 4 người Summit Peak"
              {...register('equipmentName')}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
            />
            {errors.equipmentName && (
              <p className="mt-1 text-xs text-red-500">{errors.equipmentName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#06261D' }}
            >
              Mô tả
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Mô tả ngắn về dụng cụ (không bắt buộc)"
              {...register('description')}
              className="w-full resize-none rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
            />
          </div>

          <div>
            <label
              htmlFor="totalQuantity"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#06261D' }}
            >
              Số lượng tồn kho <span className="text-red-500">*</span>
            </label>
            <input
              id="totalQuantity"
              type="number"
              min={0}
              {...register('totalQuantity')}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
            />
            {errors.totalQuantity && (
              <p className="mt-1 text-xs text-red-500">{errors.totalQuantity.message}</p>
            )}
          </div>
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
            {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm dụng cụ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
