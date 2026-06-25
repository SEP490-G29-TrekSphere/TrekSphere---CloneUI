import * as React from 'react';

export interface AppCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const AppCheckbox = React.forwardRef<HTMLInputElement, AppCheckboxProps>(
  ({ className, label, id, checked, onCheckedChange, onChange, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-2 cursor-pointer select-none group"
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className="h-4 w-4 rounded border border-border bg-background
            peer-checked:bg-primary peer-checked:border-primary
            peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2
            transition-all duration-150
            group-hover:border-primary/60
            peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          />
          <svg
            className="absolute top-0 left-0 h-4 w-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {label && (
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);
AppCheckbox.displayName = 'AppCheckbox';

export { AppCheckbox };
