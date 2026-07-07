import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth';
import { AppButton, AppSpinner } from '@/shared/ui';
import AuthLayout from '../components/AuthLayout';

const VERIFY_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
        if (result.status === 302 || result.status === 301) {
          navigate(PATHS.LOGIN);
          return;
        }
        if (result.error || (result.status && result.status >= 400)) {
          setStatus('error');
          setErrorMessage(result.error || 'Xác thực thất bại. Liên kết có thể đã hết hạn.');
          return;
        }
        navigate(PATHS.LOGIN);
      } catch {
        setStatus('error');
        setErrorMessage('Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.');
      }
    };

    verify();
  }, [token, navigate]);

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
                Email của bạn đã được xác thực. Bây giờ bạn có thể đăng nhập và trải nghiệm
                TrekSphere.
              </p>
            </div>
            <AppButton
              onClick={() => {
                window.location.href = PATHS.LOGIN;
              }}
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
                window.location.href = PATHS.LOGIN;
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
