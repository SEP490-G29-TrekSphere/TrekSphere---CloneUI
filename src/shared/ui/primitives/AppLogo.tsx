import type * as React from 'react';
import { Link } from 'react-router-dom';
import {
  TrekSphereLogo,
  type TrekSphereLogoProps,
  type TrekSphereLogoTone,
  type TrekSphereLogoVariant,
} from './TrekSphereLogo';

export interface AppLogoProps extends Omit<TrekSphereLogoProps, 'variant' | 'tone' | 'height'> {
  /** Loại hiển thị: full (icon + wordmark) hoặc mark (chỉ icon). */
  variant?: TrekSphereLogoVariant;
  /** Tone màu: dark (mặc định) hoặc light (dùng trên nền tối). */
  tone?: TrekSphereLogoTone;
  /** Chiều cao logo (px). Mặc định 48. */
  height?: number;
  /** Link đích khi click vào logo. Mặc định `/`. */
  to?: string;
  /** Bọc logo trong <Link> hay không. Mặc định `true`. */
  linkable?: boolean;
  /** className bổ sung cho wrapper. */
  wrapperClassName?: string;
  /** aria-label cho link. */
  ariaLabel?: string;
}

/**
 * `AppLogo` — wrapper chuẩn hoá việc sử dụng TrekSphereLogo trong app.
 *
 * @example
 *   // Trên header nền sáng
 *   <AppLogo height={48} />
 *
 *   // Trên hero nền tối
 *   <AppLogo height={56} tone="light" />
 *
 *   // Chỉ hiển thị mark (icon) cho favicon / mobile
 *   <AppLogo variant="mark" height={32} />
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'full',
  tone = 'dark',
  height = 48,
  to = '/',
  linkable = true,
  wrapperClassName = 'inline-flex items-center shrink-0',
  ariaLabel = 'TrekSphere — Trang chủ',
  ...logoProps
}) => {
  const logo = <TrekSphereLogo variant={variant} tone={tone} height={height} {...logoProps} />;

  if (!linkable) {
    return <span className={wrapperClassName}>{logo}</span>;
  }

  return (
    <Link
      to={to}
      className={`${wrapperClassName} focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md`}
      aria-label={ariaLabel}
    >
      {logo}
    </Link>
  );
};

AppLogo.displayName = 'AppLogo';

export { TrekSphereLogo } from './TrekSphereLogo';
export type { TrekSphereLogoProps, TrekSphereLogoTone, TrekSphereLogoVariant };
