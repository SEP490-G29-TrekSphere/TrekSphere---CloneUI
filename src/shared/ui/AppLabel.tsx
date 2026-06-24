import * as React from 'react';

export type AppLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const AppLabel = React.forwardRef<HTMLLabelElement, AppLabelProps>(
  ({ className, htmlFor, children, ...props }, ref) => {
    const combinedClassName =
      `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`.trim();

    return (
      <label ref={ref} className={combinedClassName} htmlFor={htmlFor} {...props}>
        {children}
      </label>
    );
  }
);
AppLabel.displayName = 'AppLabel';

export { AppLabel };
