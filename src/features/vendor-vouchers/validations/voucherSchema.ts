import { z } from 'zod';

export const voucherSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Mã giảm giá không được để trống')
      .max(50, 'Mã giảm giá không được vượt quá 50 ký tự')
      .regex(
        /^[A-Z0-9_-]+$/,
        'Mã giảm giá chỉ được chứa chữ in hoa, số, dấu gạch ngang hoặc gạch dưới'
      ),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
      message: 'Vui lòng chọn loại giảm giá',
    }),
    discountValue: z.coerce.number().min(0, 'Giá trị giảm giá không được nhỏ hơn 0'),
    minOrderValue: z.coerce.number().min(0, 'Đơn hàng tối thiểu không được nhỏ hơn 0'),
    maxUsage: z.coerce
      .number()
      .int('Số lượng sử dụng phải là số nguyên')
      .min(1, 'Số lượng sử dụng tối đa phải từ 1 trở lên'),
    validFrom: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
    validUntil: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
  })
  .refine(
    (data) => {
      if (data.discountType === 'PERCENTAGE') {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: 'Giá trị giảm giá theo phần trăm không được vượt quá 100%',
      path: ['discountValue'],
    }
  )
  .refine(
    (data) => {
      const from = new Date(data.validFrom).getTime();
      const until = new Date(data.validUntil).getTime();
      return until > from;
    },
    {
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      path: ['validUntil'],
    }
  );

export type VoucherFormValues = z.output<typeof voucherSchema>;
export type VoucherFormInput = z.input<typeof voucherSchema>;

export const updateVoucherSchema = z
  .object({
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
      message: 'Vui lòng chọn loại giảm giá',
    }),
    discountValue: z.coerce.number().min(0, 'Giá trị giảm giá không được nhỏ hơn 0'),
    minOrderValue: z.coerce.number().min(0, 'Đơn hàng tối thiểu không được nhỏ hơn 0'),
    maxUsage: z.coerce
      .number()
      .int('Số lượng sử dụng phải là số nguyên')
      .min(1, 'Số lượng sử dụng tối đa phải từ 1 trở lên'),
    validFrom: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
    validUntil: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED'], {
      message: 'Vui lòng chọn trạng thái',
    }),
  })
  .refine(
    (data) => {
      if (data.discountType === 'PERCENTAGE') {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: 'Giá trị giảm giá theo phần trăm không được vượt quá 100%',
      path: ['discountValue'],
    }
  )
  .refine(
    (data) => {
      const from = new Date(data.validFrom).getTime();
      const until = new Date(data.validUntil).getTime();
      return until > from;
    },
    {
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      path: ['validUntil'],
    }
  );

export type UpdateVoucherFormValues = z.output<typeof updateVoucherSchema>;
export type UpdateVoucherFormInput = z.input<typeof updateVoucherSchema>;
