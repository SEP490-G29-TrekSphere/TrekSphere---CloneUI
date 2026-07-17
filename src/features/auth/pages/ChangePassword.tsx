import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { authService, PasswordStrengthField } from '@/features/auth';
import PublicHeader from '@/features/home/components/PublicHeader';
import { AppButton, AppFormPasswordInput, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { type ChangePasswordFormValues, changePasswordSchema } from '../validations/auth.schema';

// Borderless underline style — override hoàn toàn classes mặc định của input
// (inputClassName thay thế PASSWORD_INPUT_CLASSES bên trong component).
const UNDERLINE_INPUT =
  'h-12 w-full border-0 border-b bg-transparent px-0 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none disabled:opacity-50 rounded-none';

export default function ChangePassword() {
  const methods = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const user = useAppStore((state) => state.user);
  const userInputs = useMemo(() => {
    const inputs: string[] = [];
    if (user?.name) inputs.push(user.name);
    if (user?.email) inputs.push(user.email);
    return inputs;
  }, [user]);

  const onSubmit = async (data: ChangePasswordFormValues) => {
    const result = await authService.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (result.error || (result.status && result.status >= 400)) {
      toast.error(result.error || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
      return;
    }

    toast.success('Đổi mật khẩu thành công!');
    methods.reset();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F1' }}>
      <PublicHeader />

      <main className="flex-1 pt-32 pb-16 px-4">
        <div className="mx-auto w-full max-w-[480px]">
          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-10">
            <div
              className="flex size-14 items-center justify-center rounded-full mb-5"
              style={{ backgroundColor: 'rgba(162, 235, 210, 0.3)' }}
            >
              <RefreshCw className="size-7" style={{ color: '#1F3933' }} strokeWidth={2.2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1F3933' }}>
              Đổi mật khẩu
            </h1>
            <p className="mt-2 text-sm max-w-[360px]" style={{ color: '#6F7B75' }}>
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để bảo vệ tài khoản của bạn.
            </p>
          </div>

          {/* Form */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <AppFormPasswordInput
                name="currentPassword"
                control={methods.control}
                label="Mật khẩu hiện tại"
                placeholder="Nhập mật khẩu hiện tại"
                autoComplete="current-password"
                inputClassName={UNDERLINE_INPUT}
                style={{ color: '#1F3933' }}
              />

              <div className="space-y-2">
                <AppFormPasswordInput
                  name="newPassword"
                  control={methods.control}
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                  inputClassName={UNDERLINE_INPUT}
                  style={{ color: '#1F3933' }}
                />

                {/* Strength meter */}
                <PasswordStrengthField
                  passwordFieldName="newPassword"
                  additionalUserInputs={userInputs}
                />
              </div>

              <AppFormPasswordInput
                name="confirmPassword"
                control={methods.control}
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                inputClassName={UNDERLINE_INPUT}
                style={{ color: '#1F3933' }}
              />

              <AppButton
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-lg text-sm font-semibold mt-2"
                style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
              >
                {isSubmitting ? (
                  <>
                    <AppSpinner size="sm" className="text-white" />
                    Đang lưu...
                  </>
                ) : (
                  <>Lưu mật khẩu</>
                )}
              </AppButton>
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
}
