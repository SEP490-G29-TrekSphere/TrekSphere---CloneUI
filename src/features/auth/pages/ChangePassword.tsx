import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService, PasswordStrengthField } from '@/features/auth';
import PublicHeader from '@/features/home/components/PublicHeader';
import { cn } from '@/lib/utils';
import { AppButton, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { type ChangePasswordFormValues, changePasswordSchema } from '../validations/auth.schema';

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  autoComplete: string;
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: '#1F3933' }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={cn(
            'h-12 w-full border-0 border-b bg-transparent px-0 pr-10 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus-visible:outline-none',
            'disabled:opacity-50',
            error ? 'border-destructive' : 'border-input focus:border-primary'
          )}
          style={{ color: '#1F3933' }}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

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
    control,
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
              <Controller
                name="currentPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <PasswordField
                    id="currentPassword"
                    label="Mật khẩu hiện tại"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    autoComplete="current-password"
                  />
                )}
              />

              <div className="space-y-2">
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field, fieldState }) => (
                    <PasswordField
                      id="newPassword"
                      label="Mật khẩu mới"
                      placeholder="Nhập mật khẩu mới"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                      autoComplete="new-password"
                    />
                  )}
                />

                {/* Strength meter */}
                <PasswordStrengthField
                  passwordFieldName="newPassword"
                  additionalUserInputs={userInputs}
                />
              </div>

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <PasswordField
                    id="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    placeholder="Nhập lại mật khẩu mới"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    autoComplete="new-password"
                  />
                )}
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

              <div className="flex justify-center pt-1">
                <Link
                  to={PATHS.FORGOT_PASSWORD}
                  className="text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: '#1F3933' }}
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
}
