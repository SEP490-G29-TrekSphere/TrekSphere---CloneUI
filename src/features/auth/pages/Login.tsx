import { zodResolver } from '@hookform/resolvers/zod';
import { type CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { queryClient } from '@/config/queryClient';
import { PATHS } from '@/constants';
import { extractRoles, getPostLoginRoute } from '@/constants/roles';
import { authService, toAppStoreUser } from '@/features/auth';
import {
  AppButton,
  AppCheckbox,
  AppFormInput,
  AppFormPasswordInput,
  AppSpinner,
} from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';
import AuthLayout from '../components/AuthLayout';
import { type LoginFormValues, loginSchema } from '../validations/auth.schema';

const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAppStore((state) => state.setUser);
  const [rememberMe, setRememberMe] = useState(false);
  // Nếu user vừa đăng ký xong, Register sẽ navigate sang kèm state.registeredEmail.
  const registeredEmail =
    (location.state as { registeredEmail?: string } | null)?.registeredEmail ?? '';

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: registeredEmail,
      password: '',
    },
  });

  useEffect(() => {
    if (registeredEmail) {
      methods.setValue('email', registeredEmail);
    }
  }, [registeredEmail, methods.setValue]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Store reference to the actual Google button element (captured via inline ref callback)
  const googleButtonRef = useRef<HTMLElement | null>(null);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    void (async () => {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
        return;
      }

      setIsGoogleLoading(true);
      try {
        const result = await authService.googleLogin(idToken);

        if (result.error || (result.status && result.status >= 400)) {
          toast.error(result.error || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
          return;
        }

        if (!result.data) {
          toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
          return;
        }

        const raw = result.data as unknown as Record<string, unknown>;
        const responseData = raw;
        const accessToken =
          (responseData.accessToken as string | undefined) ??
          (responseData.access_token as string | undefined) ??
          '';
        const refreshToken =
          (responseData.refreshToken as string | undefined) ??
          (responseData.refresh_token as string | undefined) ??
          '';

        storage.set('accessToken', accessToken);
        storage.set('refreshToken', refreshToken);

        const userData = (responseData.user ?? responseData) as Record<string, unknown>;
        const normalizedRoles = extractRoles(userData);

        const user = {
          id: (userData.id as string | undefined) ?? '',
          email: (userData.email as string | undefined) ?? '',
          fullName:
            (userData.fullName as string | undefined) ??
            (userData.name as string | undefined) ??
            '',
          avatarUrl:
            (userData.avatar as string | undefined) ?? (userData.avatarUrl as string | undefined),
          roles: normalizedRoles,
        };

        if (!user.id) {
          toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
          return;
        }

        // Xoá cache React Query của phiên trước (nếu có) — tránh trường hợp
        // đăng nhập tài khoản khác mà vẫn thấy dữ liệu cũ do staleTime 5 phút.
        queryClient.clear();
        setUser(toAppStoreUser(user));
        toast.success(`Chào mừng, ${user.fullName}!`);

        navigate(getPostLoginRoute(user.roles));
      } catch (err) {
        console.error('Google login error:', err);
        toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
      } finally {
        setIsGoogleLoading(false);
      }
    })();
  };

  const handleGoogleError = () => {
    toast.error('Đăng nhập Google bị hủy hoặc thất bại.');
  };

  // Forward click từ AppButton custom sang nút thật của Google (đang bị ẩn).
  const triggerGoogleLogin = () => {
    googleButtonRef.current?.click();
  };

  const onSubmit = (data: LoginFormValues) => {
    void (async () => {
      try {
        const result = await authService.login(data);

        if (result.error || (result.status && result.status >= 400)) {
          toast.error(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
          return;
        }

        if (!result.data) {
          toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
          return;
        }

        // Lưu tokens vào storage
        const raw = result.data as unknown as Record<string, unknown>;
        // `handleResponse` ở apiClient đã unwrap đúng cấu trúc (có thể phẳng
        // hoặc có 1-2 lớp envelope). Ở đây `raw` luôn là object đã unwrap —
        // chứa `user`, `access_token`, `refresh_token` ở cùng cấp.
        const responseData = raw;
        console.log('[Login] response keys:', Object.keys(responseData));
        const accessToken =
          (responseData.accessToken as string | undefined) ??
          (responseData.access_token as string | undefined) ??
          '';
        // QUAN TRỌNG: KHÔNG fallback refreshToken = accessToken.
        // Nếu BE không trả `refresh_token` riêng → để trống để API refresh biết
        // mà fail thay vì âm thầm dùng lại expired accessToken.
        const refreshToken =
          (responseData.refreshToken as string | undefined) ??
          (responseData.refresh_token as string | undefined) ??
          '';

        console.log(
          '[Login] accessToken length:',
          accessToken.length,
          'preview:',
          accessToken.slice(0, 30)
        );
        console.log(
          '[Login] refreshToken present:',
          refreshToken.length > 0,
          'length:',
          refreshToken.length
        );
        storage.set('accessToken', accessToken);
        storage.set('refreshToken', refreshToken);
        console.log('[Login] token saved. Verify:', storage.get('accessToken') ? 'OK' : 'MISSING');

        // Lấy thông tin user từ login response.
        // BE `POST /auth/login` thường unwrap trả về `{ user, accessToken }` ở
        // top-level (handleResponse trong apiClient đã unwrap envelope).
        // Tuy nhiên một số môi trường BE trả phẳng (không có `user` key) nên
        // fallback responseData để vẫn đọc được.
        const userData = (responseData.user ?? responseData) as Record<string, unknown>;

        // Dùng `extractRoles` để chuẩn hoá roles về lowercase + bỏ prefix
        // `role_`. Cờ `ROLES.ADMIN = 'admin'` được khai báo lowercase, nên nếu
        // giữ nguyên `["ADMIN"]` từ BE thì RequireRole sẽ từ chối truy cập.
        const normalizedRoles = extractRoles(userData);

        const user = {
          id: (userData.id as string | undefined) ?? '',
          email: (userData.email as string | undefined) ?? data.email,
          fullName:
            (userData.fullName as string | undefined) ??
            (userData.name as string | undefined) ??
            data.email.split('@')[0],
          avatarUrl:
            (userData.avatar as string | undefined) ?? (userData.avatarUrl as string | undefined),
          roles: normalizedRoles,
        };

        console.log('[Login] user (after normalize):', {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles,
        });

        if (!user.id) {
          toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
          return;
        }

        // Xoá cache React Query của phiên trước (nếu có) — tránh trường hợp
        // đăng nhập tài khoản khác mà vẫn thấy dữ liệu cũ do staleTime 5 phút.
        queryClient.clear();
        setUser(toAppStoreUser(user));
        toast.success(`Chào mừng quay trở lại, ${user.fullName}!`);

        // Điều hướng theo role (roles đã được normalize ở trên).
        navigate(getPostLoginRoute(user.roles));
      } catch (err) {
        console.error('Login error:', err);
        toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    })();
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Vui lòng nhập thông tin để tiếp tục hành trình của bạn."
      footerText="Chưa có tài khoản?"
      footerLink={{ label: 'Đăng ký ngay', to: PATHS.REGISTER }}
      image={LOGIN_IMAGE}
      variant="login"
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AppFormInput
            name="email"
            label="Email"
            type="email"
            placeholder="ten@vidu.com"
            autoComplete="email"
            control={methods.control}
          />

          <AppFormPasswordInput
            name="password"
            label="Mật khẩu"
            placeholder="••••••••"
            autoComplete="current-password"
            control={methods.control}
          />

          <div className="flex items-center justify-between">
            <AppCheckbox
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              label="Ghi nhớ đăng nhập"
              className="text-[#6F7B75]"
            />
            <Link
              to={PATHS.FORGOT_PASSWORD}
              className="text-sm font-semibold transition-opacity hover:opacity-70 text-[#1F3933]"
            >
              Quên mật khẩu?
            </Link>
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
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
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

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6E2D1]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-medium bg-[#FAF8F1] text-[#6F7B75]">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Nút Google thật của thư viện — render ẩn, chỉ dùng để mở popup
              đăng nhập và lấy `credential` (id_token). Không hiển thị cho user. */}
          <div
            ref={(el) => {
              googleButtonRef.current = el?.querySelector('div[role="button"]') ?? null;
            }}
            style={{ display: 'none' }}
          >
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>

          <AppButton
            type="button"
            variant="outline"
            disabled={isGoogleLoading}
            onClick={triggerGoogleLogin}
            className="w-full h-11 rounded-full border border-[#E6E2D1] text-sm font-medium text-[#1F3933]"
          >
            {isGoogleLoading ? (
              <>
                <AppSpinner size="sm" />
                Đang xử lý...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng nhập bằng Google
              </>
            )}
          </AppButton>
        </form>
      </FormProvider>
    </AuthLayout>
  );
}
