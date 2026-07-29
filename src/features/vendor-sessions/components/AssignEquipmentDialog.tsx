import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
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
import type { VendorEquipmentItem } from '@/features/vendor-equipment/types';
import type { AssignEquipmentPayload } from '../types';

const assignEquipmentSchema = z.object({
  equipmentId: z.string().min(1, 'Vui lòng chọn thiết bị'),
  quantity: z.coerce.number().int('Số lượng phải là số nguyên').min(1, 'Tối thiểu 1'),
  note: z.string().optional(),
});

type AssignEquipmentValues = z.output<typeof assignEquipmentSchema>;
type AssignEquipmentInput = z.input<typeof assignEquipmentSchema>;

export interface AssignEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: VendorEquipmentItem[];
  isPending?: boolean;
  onSubmit: (payload: AssignEquipmentPayload) => void;
}

/**
 * Dialog "Cấp thiết bị" — gọi `POST /vendor/sessions/{id}/equipments`. Không loại thiết
 * bị đã cấp khỏi danh sách chọn (BE có thể cho cấp thêm cùng loại), chỉ hiện tổng số
 * lượng trong kho làm gợi ý — không tính được "còn lại bao nhiêu" vì BE không trả về
 * số đã phân bổ ở các phiên khác.
 */
export function AssignEquipmentDialog({
  open,
  onOpenChange,
  candidates,
  isPending = false,
  onSubmit: onSubmitProp,
}: AssignEquipmentDialogProps) {
  const emptyDefaults: AssignEquipmentInput = useMemo(
    () => ({ equipmentId: candidates[0]?.id ?? '', quantity: 1, note: '' }),
    [candidates]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignEquipmentInput, unknown, AssignEquipmentValues>({
    resolver: zodResolver(assignEquipmentSchema),
    defaultValues: emptyDefaults,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ cần trigger reset khi mở dialog
  useEffect(() => {
    if (open) reset(emptyDefaults);
  }, [open]);

  const submit = handleSubmit((values) => {
    onSubmitProp({
      equipmentId: values.equipmentId,
      quantity: values.quantity,
      note: values.note?.trim() || undefined,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Cấp thiết bị</DialogTitle>
          <DialogDescription>
            Xuất kho trang thiết bị cho phiên tour này — chọn thiết bị, số lượng và ghi chú.
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-sm" style={{ color: '#6F7B75' }}>
            Kho chưa có thiết bị nào — hãy thêm thiết bị ở trang Thiết bị trước.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="equipmentId"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Thiết bị
              </label>
              <select
                id="equipmentId"
                {...register('equipmentId')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              >
                {candidates.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name} (Tổng kho: {equipment.totalQuantity})
                  </option>
                ))}
              </select>
              {errors.equipmentId && (
                <p className="mt-1 text-xs text-red-500">{errors.equipmentId.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Số lượng
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                {...register('quantity')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="equipmentNote"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Ghi chú
              </label>
              <textarea
                id="equipmentNote"
                rows={3}
                placeholder="Ví dụ: Kiểm tra cọc lều trước khi xuất kho"
                {...register('note')}
                className="w-full resize-none rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
            </div>
          </div>
        )}

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
            disabled={isPending || candidates.length === 0}
          >
            {isPending ? 'Đang cấp...' : 'Cấp thiết bị'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
