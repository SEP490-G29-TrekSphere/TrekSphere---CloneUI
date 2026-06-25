import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth';
import { AppButton, AppFormInput, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';
import AuthLayout from '../components/AuthLayout';
import { type RegisterFormValues, registerSchema } from '../validations/auth.schema';

const REGISTER_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80';

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await authService.register(data);

    if (result.error || (result.status && result.status >= 400)) {
      toast.error(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      return;
    }

    if (!result.data) {
      toast.error('Đăng ký thất bại. Vui lòng thử lại.');
      return;
    }

    const { accessToken, refreshToken, user } = result.data;
    storage.set('accessToken', accessToken);
    storage.set('refreshToken', refreshToken);
    setUser(user);
    toast.success('Tài khoản đã được tạo! Chào mừng bạn đến với TrekSphere.');
    navigate(PATHS.HOME);
  };

  return (
    <AuthLayout
      title="Gia nhập cộng đồng TrekSphere"
      subtitle="Bắt đầu hành trình khám phá của bạn ngay hôm nay."
      footerText="Đã có tài khoản?"
      footerLink={{ label: 'Đăng nhập', to: PATHS.LOGIN }}
      image={REGISTER_IMAGE}
      variant="register"
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppFormInput
            name="fullName"
            label="Họ tên"
            type="text"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            control={methods.control}
          />

          <AppFormInput
            name="email"
            label="Email"
            type="email"
            placeholder="email@vi-du.com"
            autoComplete="email"
            control={methods.control}
          />

          <div className="grid grid-cols-2 gap-3">
            <AppFormInput
              name="password"
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              control={methods.control}
            />
            <AppFormInput
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              control={methods.control}
            />
          </div>

          <AppButton
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full text-white font-semibold text-sm
              bg-[#06261D] hover:bg-[#06261D]/90 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <AppSpinner size="sm" className="text-white" />
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký'
            )}
          </AppButton>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6E2D1]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-semibold tracking-widest bg-[#FAF8F1] text-[#6F7B75]">
                HOẶC
              </span>
            </div>
          </div>

          <AppButton
            type="button"
            variant="outline"
            className="w-full h-11 rounded-full border border-[#E6E2D1] text-sm font-medium text-[#1F3933]"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.58 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng ký bằng Google
          </AppButton>
        </form>
      </FormProvider>
    </AuthLayout>
  );
}
