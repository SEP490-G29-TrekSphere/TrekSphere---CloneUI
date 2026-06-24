import type * as React from 'react';

export type AppBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface AppBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AppBadgeVariant;
}

const variantStyles: Record<AppBadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive:
    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground',
};

const baseStyles =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

export function AppBadge({ className, variant = 'default', ...props }: AppBadgeProps) {
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className || ''}`.trim();
  return <div className={combinedClassName} {...props} />;
}
