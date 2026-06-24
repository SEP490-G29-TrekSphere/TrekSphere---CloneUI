import * as React from 'react';

export type AppLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const AppLabel = React.forwardRef<HTMLLabelElement, AppLabelProps>(
  ({ className, ...props }, ref) => {
    const combinedClassName =
      `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`.trim();
    // biome-ignore lint/a11y/noLabelWithoutControl: We don't need to use htmlFor here
    return <label ref={ref} className={combinedClassName} {...props} />;
  }
);
AppLabel.displayName = 'AppLabel';

export { AppLabel };
