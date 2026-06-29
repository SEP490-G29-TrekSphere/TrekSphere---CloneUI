import * as React from 'react';

export type AppButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'accent';
export type AppButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
}

const variantStyles: Record<AppButtonVariant, string> = {
  default: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5 font-semibold',
  secondary: 'bg-accent text-primary hover:bg-accent/80 font-semibold',
  ghost: 'hover:bg-muted hover:text-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
  accent: 'bg-accent text-primary hover:bg-accent/80 font-semibold',
};

const sizeStyles: Record<AppButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const baseStyles =
  'inline-flex items-center justify-center shrink-0 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const combinedClassName =
      `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`.trim();

    return <button className={combinedClassName} ref={ref} {...props} />;
  }
);
AppButton.displayName = 'AppButton';

export { AppButton };
