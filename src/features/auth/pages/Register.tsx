import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService, PasswordStrengthField } from '@/features/auth';
import { AppButton, AppFormInput, AppFormPasswordInput, AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import AuthLayout from '../components/AuthLayout';
import { type RegisterFormValues, registerSchema } from '../validations/auth.schema';

const REGISTER_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80';

export default function Register() {
  const navigate = useNavigate();

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

    // BE register không trả token — chỉ trả `{ userId, email, fullName }`.
    // Điều hướng sang trang login kèm email vừa đăng ký để người dùng đăng nhập luôn.
    toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
    navigate(PATHS.LOGIN, { state: { registeredEmail: data.email } });
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
            <AppFormPasswordInput
              name="password"
              label="Mật khẩu"
              placeholder="••••••••"
              autoComplete="new-password"
              control={methods.control}
            />
            <AppFormPasswordInput
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              placeholder="••••••••"
              autoComplete="new-password"
              control={methods.control}
            />
          </div>

          <PasswordStrengthField
            passwordFieldName="password"
            userInputFieldNames={['fullName', 'email']}
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
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký'
            )}
          </AppButton>
        </form>
      </FormProvider>
    </AuthLayout>
  );
}
