import * as React from 'react';

export type AppIconSize = 'sm' | 'default' | 'lg' | 'xl';

export interface AppIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: AppIconSize;
  /**
   * The SVG component imported via vite-plugin-svgr
   * Example: import MailIcon from '@/assets/icons/mail.svg?react'
   */
  svg: React.ElementType;
}

const sizeStyles: Record<AppIconSize, string> = {
  sm: 'w-4 h-4',
  default: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

const baseStyles = 'inline-block shrink-0 fill-current';

/**
 * AppIcon Wrapper Component
 * - Wraps imported SVGs to provide consistent sizing and styling.
 */
const AppIcon = React.forwardRef<SVGSVGElement, AppIconProps>(
  ({ className, size = 'default', svg: SvgComponent, ...props }, ref) => {
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${className || ''}`.trim();

    return <SvgComponent ref={ref} className={combinedClassName} {...props} />;
  }
);

AppIcon.displayName = 'AppIcon';

export { AppIcon };
