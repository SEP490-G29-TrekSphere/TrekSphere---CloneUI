import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AppButton } from '@/shared/ui/AppButton';
import { AppFormInput } from '@/shared/ui/AppFormInput';
import { useAppStore } from '@/store/useAppStore';
import { type LoginFormValues, loginSchema } from '@/validations/auth.schema';

export default function Login() {
  const setUser = useAppStore((state) => state.setUser);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Form data:', data);
    setUser({ id: '1', name: 'Admin User' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="bg-background p-8 rounded-lg shadow-md w-full max-w-sm border">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Login</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppFormInput
            name="email"
            label="Email"
            control={control}
            type="email"
            placeholder="admin@example.com"
          />

          <AppFormInput
            name="password"
            label="Password"
            control={control}
            type="password"
            placeholder="••••••••"
          />

          <AppButton variant="default" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </AppButton>
        </form>
      </div>
    </div>
  );
}
