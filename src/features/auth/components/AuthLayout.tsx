import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';

export type AuthLayoutVariant = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLink?: { label: string; to: string };
  image: string;
  variant?: AuthLayoutVariant;
  badgeText?: string;
  backLink?: { label: string; to: string };
}

const BADGE_TEXT: Record<AuthLayoutVariant, string> = {
  login: '',
  register: '',
  'forgot-password': '',
  'reset-password': '',
};

const DEFAULT_BACK_LINKS: Record<AuthLayoutVariant, { to: string; label: string } | null> = {
  login: null,
  register: { to: PATHS.LOGIN, label: 'Quay lại' },
  'forgot-password': { to: PATHS.LOGIN, label: 'Quay lại' },
  'reset-password': { to: PATHS.LOGIN, label: 'Quay lại' },
};

const HEADING_TEXT: Record<AuthLayoutVariant, { heading: string; desc: string }> = {
  login: {
    heading: 'Chinh phục đỉnh cao cùng TrekSphere',
    desc: 'Khám phá những cung đường trekking tuyệt vời nhất tại Việt Nam và kết nối với cộng đồng yêu thiên nhiên.',
  },
  register: {
    heading: 'Chinh phục những đỉnh cao mới cùng TrekSphere.',
    desc: 'Tham gia mạng lưới những người yêu thích leo núi và khám phá thiên nhiên hoang dã lớn nhất Việt Nam.',
  },
  'forgot-password': {
    heading: 'Hành trình bắt đầu từ chính bạn.',
    desc: 'Tìm lại quyền truy cập để tiếp tục chuyến phiêu lưu kỳ thú cùng cộng đồng TrekSphere.',
  },
  'reset-password': {
    heading: 'Đặt lại mật khẩu của bạn.',
    desc: 'Bảo mật tài khoản và quay trở lại hành trình khám phá TrekSphere.',
  },
};

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  image,
  variant = 'login',
  badgeText,
  backLink,
}: AuthLayoutProps) {
  const leftContent = HEADING_TEXT[variant];
  const cornerLabel = badgeText ?? BADGE_TEXT[variant];
  const isRegister = variant === 'register';
  const effectiveBackLink = backLink ?? DEFAULT_BACK_LINKS[variant];

  return (
    <div className="flex min-h-screen">
      {/* Left — Banner Panel */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isRegister ? ' ' : ''}`}>
        <img
          src={image}
          alt="TrekSphere scenic view"
          className={`h-full w-full object-cover ${isRegister ? '' : ''}`}
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 ${
            isRegister
              ? 'bg-gradient-to-b from-[#FAF8F1]/20 via-[#1F3933]/30 to-[#1F3933]/80'
              : 'bg-[#1F3933]/55'
          }`}
        />

        {/* Logo on Banner */}
        <div className="absolute top-8 left-8 z-10">
          <AppLogo height={40} tone="light" to={PATHS.HOME} />
        </div>

        {/* Corner label */}
        {cornerLabel && (
          <div className="absolute top-24 left-8 z-10">
            <span className="text-sm font-medium text-white/70">{cornerLabel}</span>
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-10 space-y-3 z-10">
          <h2 className="text-3xl font-bold text-white leading-snug max-w-md">
            {leftContent.heading}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">{leftContent.desc}</p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div
        className={`flex flex-1 flex-col justify-between px-6 py-8 sm:px-8 lg:w-1/2 min-h-screen ${
          isRegister ? 'lg:rounded-[2rem] lg:m-4 lg:bg-white' : ''
        }`}
        style={isRegister ? { backgroundColor: '#FAF8F1' } : { backgroundColor: '#FAF8F1' }}
      >
        {/* Top Header of Form Panel */}
        {effectiveBackLink && (
          <div className="mx-auto w-full max-w-md pt-2 pb-6">
            <Link
              to={effectiveBackLink.to}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F3933] hover:opacity-75 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{effectiveBackLink.label}</span>
            </Link>
          </div>
        )}

        {/* Form Content */}
        <div className="mx-auto w-full max-w-md space-y-6 my-auto">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold" style={{ color: '#1F3933' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm" style={{ color: '#6F7B75' }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Form content slot */}
          {children}

          {/* Footer link */}
          {footerText && footerLink && (
            <p className="text-center text-sm" style={{ color: '#6F7B75' }}>
              {footerText}{' '}
              <Link
                to={footerLink.to}
                className="font-semibold transition-colors hover:opacity-80"
                style={{ color: '#1F3933' }}
              >
                {footerLink.label}
              </Link>
            </p>
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}
