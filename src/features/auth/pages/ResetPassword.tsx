import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import heroImage from '@/assets/hero.png';
import { PATHS } from '@/constants';
import {
  authService,
  PasswordStrengthField,
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/features/auth';
import AuthLayout from '@/features/auth/components/AuthLayout';
import { AppButton, AppFormPasswordInput, AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

const RESET_PASSWORD_IMAGE = heroImage;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const methods = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Keep form state token in sync if search params load asynchronously
  useEffect(() => {
    if (token) {
      setValue('token', token);
    }
  }, [token, setValue]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      const result = await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });

      if (result.error || (result.status && result.status >= 400)) {
        toast.error(result.error || 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.');
        return;
      }

      toast.success('Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 2000);
    } catch (_error) {
      toast.error('Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle={
        token
          ? 'Nhập mật khẩu mới của bạn bên dưới để khôi phục quyền truy cập.'
          : 'Liên kết không hợp lệ.'
      }
      footerText={token ? 'Nhớ mật khẩu rồi?' : undefined}
      footerLink={token ? { label: 'Đăng nhập', to: PATHS.LOGIN } : undefined}
      image={RESET_PASSWORD_IMAGE}
      variant="reset-password"
    >
      {!token ? (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#1F3933]">Thiếu mã xác thực</h3>
            <p className="text-sm text-[#6F7B75]">
              Yêu cầu đặt lại mật khẩu của bạn thiếu mã xác thực (token) hoặc liên kết đã hết hạn.
              Vui lòng yêu cầu một liên kết mới.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to={PATHS.FORGOT_PASSWORD}
              className="flex items-center justify-center w-full h-12 rounded-full text-white font-semibold text-sm bg-[#06261D] hover:bg-[#06261D]/90 transition-colors"
            >
              Yêu cầu liên kết mới
            </Link>
            <Link
              to={PATHS.LOGIN}
              className="text-sm font-semibold hover:opacity-80 transition-opacity text-center py-2 text-[#1F3933]"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      ) : (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input type="hidden" {...methods.register('token')} />

            <AppFormPasswordInput
              name="newPassword"
              label="Mật khẩu mới"
              placeholder="••••••••"
              autoComplete="new-password"
              control={methods.control}
            />

            <PasswordStrengthField passwordFieldName="newPassword" />

            <AppFormPasswordInput
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              placeholder="••••••••"
              autoComplete="new-password"
              control={methods.control}
            />

            <AppButton
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full text-white font-semibold text-sm bg-[#06261D] hover:bg-[#06261D]/90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <AppSpinner size="sm" className="text-white" />
                  Đang xử lý...
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </AppButton>
          </form>
        </FormProvider>
      )}
    </AuthLayout>
  );
}
