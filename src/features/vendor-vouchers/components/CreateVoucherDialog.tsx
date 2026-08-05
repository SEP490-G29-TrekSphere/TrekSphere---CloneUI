import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AppDatePicker } from '@/shared/ui';
import type { CreateVoucherRequest } from '../types';
import {
  type VoucherFormInput,
  type VoucherFormValues,
  voucherSchema,
} from '../validations/voucherSchema';

interface CreateVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onSubmit: (payload: CreateVoucherRequest) => void;
}

const DEFAULT_VALUES: VoucherFormInput = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  minOrderValue: 0,
  maxUsage: 10,
  validFrom: '',
  validUntil: '',
};

export function CreateVoucherDialog({
  open,
  onOpenChange,
  isPending = false,
  onSubmit,
}: CreateVoucherDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<VoucherFormInput, unknown, VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run when dialog is opened
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
    }
  }, [open]);

  const discountType = watch('discountType');

  // Automatically uppercase the code field
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('code', e.target.value.toUpperCase());
  };

  const submit = handleSubmit((values) => {
    // Format input datetime-local to backend format (yyyy-MM-ddTHH:mm:ss)
    // datetime-local returns "2026-07-01T00:00", we can append :00 if missing seconds
    const formatDateTime = (val: string) => {
      if (!val) return '';
      if (val.split(':').length === 2) {
        return `${val}:00`;
      }
      return val;
    };

    const payload: CreateVoucherRequest = {
      code: values.code.trim(),
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrderValue: values.minOrderValue,
      maxUsage: values.maxUsage,
      validFrom: formatDateTime(values.validFrom),
      validUntil: formatDateTime(values.validUntil),
    };
    onSubmit(payload);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: '#06261D' }}>
            Tạo mã giảm giá mới
          </DialogTitle>
          <DialogDescription>
            Thiết lập cấu hình mã giảm giá (% hoặc tiền mặt, đơn tối thiểu, số lượng sử dụng và thời
            hạn).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-1">
          {/* Code */}
          <div>
            <label
              htmlFor="code"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#06261D' }}
            >
              Mã Voucher <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              type="text"
              placeholder="Ví dụ: SUMMER2026"
              {...register('code')}
              onChange={handleCodeChange}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
            />
            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Discount Type */}
            <div>
              <label
                htmlFor="discountType"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                id="discountType"
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
                htmlFor="discountValue"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                id="discountValue"
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
                htmlFor="minOrderValue"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Đơn hàng tối thiểu (đ) <span className="text-red-500">*</span>
              </label>
              <input
                id="minOrderValue"
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
                htmlFor="maxUsage"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Số lượng tối đa <span className="text-red-500">*</span>
              </label>
              <input
                id="maxUsage"
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
                htmlFor="validFrom"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Bắt đầu từ ngày <span className="text-red-500">*</span>
              </label>
              <Controller
                name="validFrom"
                control={control}
                render={({ field }) => (
                  <AppDatePicker
                    id="validFrom"
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
                    timeCaption="Thời gian"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 cursor-pointer"
                    style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                    placeholderText="Chọn ngày bắt đầu"
                  />
                )}
              />
              {errors.validFrom && (
                <p className="mt-1 text-xs text-red-500">{errors.validFrom.message}</p>
              )}
            </div>

            {/* Valid Until */}
            <div>
              <label
                htmlFor="validUntil"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Hết hạn vào ngày <span className="text-red-500">*</span>
              </label>
              <Controller
                name="validUntil"
                control={control}
                render={({ field }) => (
                  <AppDatePicker
                    id="validUntil"
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
                    timeCaption="Thời gian"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 cursor-pointer"
                    style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                    placeholderText="Chọn ngày hết hạn"
                  />
                )}
              />
              {errors.validUntil && (
                <p className="mt-1 text-xs text-red-500">{errors.validUntil.message}</p>
              )}
            </div>
          </div>
        </div>

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
            {isPending ? 'Đang tạo...' : 'Tạo Voucher'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
