import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService, toAppStoreUser } from '@/features/auth';
import { AppButton, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { storage } from '@/utils/storage';
import AuthLayout from '../components/AuthLayout';

const VERIFY_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // Lưu lại timeout id để huỷ nếu user unmount/click nút trước thời hạn.
  const redirectTimeoutRef = useRef<number | null>(null);

  // Lưu / huỷ timeout khi component unmount.
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Liên kết xác thực không hợp lệ. Vui lòng kiểm tra email và thử lại.');
      return;
    }

    const verify = async () => {
      setStatus('loading');
      try {
        const result = await authService.verifyEmail(token);

        // ── Debug-only summary ở caller ────────────────────────────────────────
        // eslint-disable-next-line no-console
        console.group('[VerifyEmail] verify result');
        // eslint-disable-next-line no-console
        console.log('status:', result.status);
        // eslint-disable-next-line no-console
        console.log('error:', result.error);
        // eslint-disable-next-line no-console
        console.log('message:', result.message);
        // eslint-disable-next-line no-console
        console.log('data:', result.data);
        // eslint-disable-next-line no-console
        console.groupEnd();

        if (result.error && (result.status === 401 || result.status === 400)) {
          setStatus('error');
          setErrorMessage(result.error || 'Token không hợp lệ hoặc đã hết hạn.');
          return;
        }

        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error || 'Xác thực thất bại. Vui lòng thử lại.');
          return;
        }

        // ── Luồng sau verify (theo đúng BE spec) ───────────────────────────────
        // BE /auth/verify CHỈ xác nhận email đã verified (trả `data: "Email verified
        // successfully"`). BE KHÔNG cấp token trong body. User phải đăng nhập lại
        // để lấy access/refresh token. Tuy nhiên nếu sau này BE thêm token thì
        // logic dưới vẫn hoạt động backward-compat.
        const data = result.data;
        const accessToken = data?.access_token;
        const refreshToken = data?.refresh_token;
        const verifiedUser = data?.user;

        // Lưu token + set user vào store nếu BE có trả về (backward-compat).
        if (accessToken) {
          storage.set('accessToken', accessToken);
        }
        if (refreshToken) {
          storage.set('refreshToken', refreshToken);
        }

        if (verifiedUser) {
          useAppStore.getState().setUser(toAppStoreUser(verifiedUser));
        }

        // Render UI success — KHÔNG navigate ngay để user kịp đọc.
        setStatus('success');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[VerifyEmail] verify threw:', err);
        setStatus('error');
        setErrorMessage('Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.');
      }
    };

    verify();
  }, [token]);

  // Hàm điều hướng dùng chung cho cả auto-redirect và nút bấm.
  //
  // Theo BE spec: /auth/verify KHÔNG cấp token. User cần login lại để lấy
  // access/refresh token (token được set qua HttpOnly cookie bởi Spring Security).
  // Flow này navigate về /login sau verify thành công — KHÔNG vào Home.
  const goToLogin = useCallback(() => {
    navigate(PATHS.LOGIN, { replace: true });
  }, [navigate]);

  // Auto-redirect sau khi success (3 giây, đủ để user đọc thông báo).
  useEffect(() => {
    if (status !== 'success') return;
    redirectTimeoutRef.current = window.setTimeout(() => {
      goToLogin();
    }, 3000);
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [status, goToLogin]);

  const handleSuccessAction = () => {
    if (redirectTimeoutRef.current !== null) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    goToLogin();
  };

  return (
    <AuthLayout
      title="Xác thực email"
      subtitle="Chúng tôi đang xác minh địa chỉ email của bạn."
      footerText="Đã xác thực?"
      footerLink={{ label: 'Đăng nhập ngay', to: PATHS.LOGIN }}
      image={VERIFY_IMAGE}
      variant="register"
    >
      <div className="space-y-6 text-center">
        {status === 'idle' || status === 'loading' ? (
          <>
            <div className="flex justify-center">
              <AppSpinner size="lg" className="text-[#1F3933]" />
            </div>
            <p className="text-sm" style={{ color: '#6F7B75' }}>
              Đang xác thực email của bạn, vui lòng chờ...
            </p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#1F3933' }}>
                Xác thực thành công!
              </h3>
              <p className="mt-2 text-sm" style={{ color: '#6F7B75' }}>
                Email của bạn đã được xác thực. Đang đưa bạn về trang đăng nhập...
              </p>
            </div>
            <AppButton
              onClick={handleSuccessAction}
              className="w-full h-12 rounded-full text-white font-semibold text-sm
                bg-[#06261D] hover:bg-[#06261D]/90"
            >
              Đăng nhập ngay
            </AppButton>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#1F3933' }}>
                Xác thực thất bại
              </h3>
              <p className="mt-2 text-sm" style={{ color: '#6F7B75' }}>
                {errorMessage}
              </p>
            </div>
            <AppButton
              onClick={() => {
                navigate(PATHS.LOGIN);
              }}
              className="w-full h-12 rounded-full text-white font-semibold text-sm
                bg-[#06261D] hover:bg-[#06261D]/90"
            >
              Quay lại đăng nhập
            </AppButton>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
