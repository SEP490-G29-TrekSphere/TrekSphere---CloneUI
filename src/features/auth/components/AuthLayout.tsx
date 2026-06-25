import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type AuthLayoutVariant = 'login' | 'register';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLink?: { label: string; to: string };
  image: string;
  variant?: AuthLayoutVariant;
  badgeText?: string;
}

const BADGE_TEXT: Record<AuthLayoutVariant, string> = {
  login: '',
  register: '',
};

const HEADING_TEXT: Record<AuthLayoutVariant, { heading: string; desc: string }> = {
  login: {
    heading: 'Chinh phá»¥c Ä‘á»‰nh cao cÃ¹ng TrekSphere',
    desc: 'KhÃ¡m phÃ¡ nhá»¯ng cung Ä‘Æ°á»ng trekking tuyá»‡t vá»i nháº¥t táº¡i Viá»‡t Nam vÃ  káº¿t ná»‘i vá»›i cá»™ng Ä‘á»“ng yÃªu thiÃªn nhiÃªn.',
  },
  register: {
    heading: 'Chinh phá»¥c nhá»¯ng Ä‘á»‰nh cao má»›i cÃ¹ng TrekSphere.',
    desc: 'Tham gia máº¡ng lÆ°á»›i nhá»¯ng ngÆ°á»i yÃªu thÃ­ch leo nÃºi vÃ  khÃ¡m phÃ¡ thiÃªn nhiÃªn hoang dÃ£ lá»›n nháº¥t Viá»‡t Nam.',
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
}: AuthLayoutProps) {
  const leftContent = HEADING_TEXT[variant];
  const cornerLabel = badgeText ?? BADGE_TEXT[variant];
  const isRegister = variant === 'register';

  return (
    <div className="flex min-h-screen">
      {/* Left â€” Banner Panel */}
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

        {/* Corner label */}
        <div className="absolute top-8 left-8">
          <span className="text-sm font-medium text-white/70">{cornerLabel}</span>
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-10 space-y-3">
          <h2 className="text-3xl font-bold text-white leading-snug max-w-md">
            {leftContent.heading}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">{leftContent.desc}</p>
        </div>
      </div>

      {/* Right â€” Form Panel */}
      <div
        className={`flex flex-1 flex-col justify-center px-6 py-12 sm:px-8 lg:w-1/2 ${
          isRegister ? 'lg:rounded-[2rem] lg:m-4 lg:bg-white' : ''
        }`}
        style={isRegister ? { backgroundColor: '#FAF8F1' } : { backgroundColor: '#FAF8F1' }}
      >
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden mb-2">
            <span className="text-xl font-bold" style={{ color: '#1F3933' }}>
              TrekSphere
            </span>
          </Link>

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
      </div>
    </div>
  );
}
