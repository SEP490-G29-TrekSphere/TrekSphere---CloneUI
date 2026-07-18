import * as z from 'zod';

/**
 * Zod schemas cho form login/register.
 * Mỗi schema đi kèm type `*FormValues` để dùng với react-hook-form.
 */

export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên quá dài'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
      .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết thường')
      .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số')
      .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const newPasswordRules = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(100, 'Mật khẩu không được vượt quá 100 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
  .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết thường')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số')
  .regex(/[!@#$%^&*()_\-+=~`[\]{}|;:'",.<>/?]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt');

export const checkPasswordsMatch = (data: { newPassword: string; confirmPassword: string }) =>
  data.newPassword === data.confirmPassword;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token không được để trống'),
    newPassword: newPasswordRules,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine(checkPasswordsMatch, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: newPasswordRules,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine(checkPasswordsMatch, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Schema cho form chỉnh sửa hồ sơ.
 * Email bị loại ra khỏi schema vì là field readonly.
 * Chỉ có các trường BE hỗ trợ: fullName, phone, dateOfBirth, gender.
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên quá dài'),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
