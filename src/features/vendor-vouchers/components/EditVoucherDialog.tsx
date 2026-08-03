import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { UpdateVoucherRequest, VoucherResponse } from '../types';
import {
  type UpdateVoucherFormInput,
  type UpdateVoucherFormValues,
  updateVoucherSchema,
} from '../validations/voucherSchema';

interface EditVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherResponse | null;
  isPending?: boolean;
  onSubmit: (payload: UpdateVoucherRequest) => void;
}

const formatToLocalDatetime = (isoStr: string) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

export function EditVoucherDialog({
  open,
  onOpenChange,
  voucher,
  isPending = false,
  onSubmit,
}: EditVoucherDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateVoucherFormInput, unknown, UpdateVoucherFormValues>({
    resolver: zodResolver(updateVoucherSchema),
  });

  // Load defaults when voucher changes or dialog opens
  useEffect(() => {
    if (open && voucher) {
      reset({
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderValue: voucher.minOrderValue,
        maxUsage: voucher.maxUsage,
        validFrom: formatToLocalDatetime(voucher.validFrom),
        validUntil: formatToLocalDatetime(voucher.validUntil),
        status: voucher.status,
      });
    }
  }, [open, voucher, reset]);

  const discountType = watch('discountType');

  const submit = handleSubmit((values) => {
    const formatDateTime = (val: string) => {
      if (!val) return '';
      if (val.split(':').length === 2) {
        return `${val}:00`;
      }
      return val;
    };

    const payload: UpdateVoucherRequest = {
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrderValue: values.minOrderValue,
      maxUsage: values.maxUsage,
      validFrom: formatDateTime(values.validFrom),
      validUntil: formatDateTime(values.validUntil),
      status: values.status,
    };
    onSubmit(payload);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: '#06261D' }}>
            Sửa thông tin Voucher
          </DialogTitle>
          <DialogDescription>
            Cập nhật cấu hình loại giảm giá, giá trị, thời hạn hoặc trạng thái của mã voucher.
          </DialogDescription>
        </DialogHeader>

        {voucher && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-1">
            {/* Code (Read-Only) */}
            <div>
              <label
                htmlFor="edit-code"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Mã Voucher
              </label>
              <input
                id="edit-code"
                type="text"
                value={voucher.code}
                disabled
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold opacity-60 cursor-not-allowed"
                style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Discount Type */}
              <div>
                <label
                  htmlFor="edit-discountType"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Loại giảm giá <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-discountType"
                  {...register('discountType')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 appearance-none"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                >
                  <option value="PERCENTAGE">Theo phần trăm (%)</option>
                  <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                </select>
                {errors.discountType && (
                  <p className="mt-1 text-xs text-red-500">{errors.discountType.message}</p>
                )}
              </div>

              {/* Discount Value */}
              <div>
                <label
                  htmlFor="edit-discountValue"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Giá trị giảm <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-discountValue"
                  type="number"
                  min={0}
                  placeholder={discountType === 'PERCENTAGE' ? 'Ví dụ: 10' : 'Ví dụ: 50000'}
                  {...register('discountValue')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.discountValue && (
                  <p className="mt-1 text-xs text-red-500">{errors.discountValue.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Minimum Order Value */}
              <div>
                <label
                  htmlFor="edit-minOrderValue"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Đơn hàng tối thiểu (đ) <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-minOrderValue"
                  type="number"
                  min={0}
                  placeholder="Ví dụ: 200000"
                  {...register('minOrderValue')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.minOrderValue && (
                  <p className="mt-1 text-xs text-red-500">{errors.minOrderValue.message}</p>
                )}
              </div>

              {/* Max Usage */}
              <div>
                <label
                  htmlFor="edit-maxUsage"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Số lượng tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-maxUsage"
                  type="number"
                  min={1}
                  placeholder="Ví dụ: 100"
                  {...register('maxUsage')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.maxUsage && (
                  <p className="mt-1 text-xs text-red-500">{errors.maxUsage.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valid From */}
              <div>
                <label
                  htmlFor="edit-validFrom"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Bắt đầu từ ngày <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-validFrom"
                  type="datetime-local"
                  {...register('validFrom')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.validFrom && (
                  <p className="mt-1 text-xs text-red-500">{errors.validFrom.message}</p>
                )}
              </div>

              {/* Valid Until */}
              <div>
                <label
                  htmlFor="edit-validUntil"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Hết hạn vào ngày <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-validUntil"
                  type="datetime-local"
                  {...register('validUntil')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.validUntil && (
                  <p className="mt-1 text-xs text-red-500">{errors.validUntil.message}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="edit-status"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-status"
                {...register('status')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 appearance-none"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Tạm dừng (INACTIVE)</option>
                <option value="EXPIRED">Hết hạn (EXPIRED)</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="!mt-4">
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
            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
