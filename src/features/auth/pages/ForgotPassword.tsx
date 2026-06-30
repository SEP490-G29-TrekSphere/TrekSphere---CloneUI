import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth';
import { AppButton, AppFormInput, AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import AuthLayout from '../components/AuthLayout';
import { type ForgotPasswordFormValues, forgotPasswordSchema } from '../validations/auth.schema';

const FORGOT_PASSWORD_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';

export default function ForgotPassword() {
  const methods = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const result = await authService.forgotPassword(data.email);

    if (result.error || (result.status && result.status >= 400)) {
      toast.error(result.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      return;
    }

    toast.success('Đã gửi liên kết khôi phục! Vui lòng kiểm tra email của bạn.');
  };

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu."
      footerText="Nhớ mật khẩu rồi?"
      footerLink={{ label: 'Đăng nhập', to: PATHS.LOGIN }}
      image={FORGOT_PASSWORD_IMAGE}
      variant="forgot-password"
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AppFormInput
            name="email"
            label="Email"
            type="email"
            placeholder="ví dụ: ten@email.com"
            autoComplete="email"
            control={methods.control}
          />

          <AppButton
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full text-white font-semibold text-sm
              bg-[#06261D] hover:bg-[#06261D]/90 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <AppSpinner size="sm" className="text-white" />
                Đang gửi...
              </>
            ) : (
              <>
                Gửi liên kết khôi phục
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </AppButton>

          <div className="flex justify-center pt-1">
            <Link
              to={PATHS.LOGIN}
              className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: '#1F3933' }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </FormProvider>
    </AuthLayout>
  );
}
