import * as React from 'react';

export type AppSpinnerSize = 'default' | 'sm' | 'lg' | 'xl';

export interface AppSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: AppSpinnerSize;
}

const sizeStyles: Record<AppSpinnerSize, string> = {
  default: 'h-4 w-4',
  sm: 'h-3 w-3',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

const baseStyles = 'animate-spin text-muted-foreground';

const AppSpinner = React.forwardRef<SVGSVGElement, AppSpinnerProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${className || ''}`.trim();
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={combinedClassName}
        {...props}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    );
  }
);
AppSpinner.displayName = 'AppSpinner';

export { AppSpinner };
