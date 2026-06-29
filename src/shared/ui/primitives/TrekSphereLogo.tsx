import * as React from 'react';

import FullDark from '@/assets/logos/treksphere-logo-dark.svg?react';
import FullLight from '@/assets/logos/treksphere-logo-light.svg?react';
import MarkDark from '@/assets/logos/treksphere-mark-dark.svg?react';
import MarkLight from '@/assets/logos/treksphere-mark-light.svg?react';

export type TrekSphereLogoVariant = 'mark' | 'full';
export type TrekSphereLogoTone = 'dark' | 'light';

export interface TrekSphereLogoProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * `mark` chỉ hiển thị icon hình núi trong vòng tròn.
   * `full` hiển thị icon + wordmark "TrekSphere".
   */
  variant?: TrekSphereLogoVariant;
  /**
   * `dark` dùng màu primary (mặc định) — phù hợp nền sáng.
   * `light` dùng màu trắng — phù hợp nền tối / ảnh hero.
   */
  tone?: TrekSphereLogoTone;
  /**
   * Chiều cao của logo tính bằng px. Mặc định `32`.
   *
   * Với `variant="mark"`: đây là cạnh của icon vuông.
   * Với `variant="full"`: đây là chiều cao của cả icon + wordmark;
   * chiều rộng được suy ra theo tỉ lệ asset (220:64).
   */
  height?: number;
  /**
   * @deprecated Với logo dạng SVG asset, không thể ẩn một phần wordmark
   * bằng CSS thuần. Nếu cần responsive, hãy render 2 logo tách biệt theo
   * breakpoint và chọn `variant="mark"` trên mobile.
   */
  hideTextOnMobile?: boolean;
}

const FULL_ASPECT = 320 / 64;

const LOGO_MAP = {
  'mark-dark': MarkDark,
  'mark-light': MarkLight,
  'full-dark': FullDark,
  'full-light': FullLight,
} as const;

/**
 * Logo "TrekSphere" — render từ SVG asset trong `src/assets/logos`.
 *
 * Có 4 biến thể asset:
 * - mark-dark  : icon đơn, tone primary.
 * - mark-light : icon đơn, tone trắng.
 * - full-dark  : icon + wordmark "TrekSphere", tone primary.
 * - full-light : icon + wordmark "TrekSphere", tone trắng.
 *
 * Component chọn asset theo `variant` + `tone` và scale theo `height`.
 */
export const TrekSphereLogo = React.forwardRef<HTMLSpanElement, TrekSphereLogoProps>(
  (
    {
      variant = 'full',
      tone = 'dark',
      height = 32,
      className = '',
      hideTextOnMobile: _hideTextOnMobile,
      ...props
    },
    ref
  ) => {
    const key = `${variant}-${tone}` as keyof typeof LOGO_MAP;
    const Component = LOGO_MAP[key] as React.FC<React.SVGProps<SVGSVGElement>>;

    const width = variant === 'full' ? Math.round(height * FULL_ASPECT) : height;

    return (
      <span
        ref={ref}
        role="img"
        aria-label="TrekSphere"
        className={`inline-flex items-center ${className}`.trim()}
        {...props}
      >
        <Component
          width={width}
          height={height}
          aria-hidden="true"
          focusable="false"
          className="shrink-0 block"
        />
      </span>
    );
  }
);

TrekSphereLogo.displayName = 'TrekSphereLogo';

export default TrekSphereLogo;
