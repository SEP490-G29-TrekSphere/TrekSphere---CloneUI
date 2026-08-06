import * as React from 'react';
import { formatDate, formatDateTime } from '@/utils/format';

export type AppInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ className, type, onFocus, onBlur, onChange, style, ...props }, ref) => {
    const isDateOrDateTime = type === 'date' || type === 'datetime-local';
    const [isFocused, setIsFocused] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(props.value || props.defaultValue || '');

    React.useEffect(() => {
      if (props.value !== undefined) {
        setInputValue(props.value);
      }
    }, [props.value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    };

    const combinedClassName =
      `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`.trim();

    const showOverlay = isDateOrDateTime && !isFocused && inputValue;

    let displayValue = '';
    if (showOverlay) {
      if (type === 'date') {
        displayValue = formatDate(inputValue as string);
      } else {
        displayValue = formatDateTime(inputValue as string);
      }
    }

    const inputElement = (
      <input
        type={type}
        className={combinedClassName}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleValueChange}
        style={{
          ...style,
          color: showOverlay ? 'transparent' : style?.color || 'inherit',
        }}
        {...props}
      />
    );

    if (isDateOrDateTime) {
      return (
        <div className="relative w-full">
          {inputElement}
          {showOverlay && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm font-medium select-none"
              style={{ color: style?.color || 'currentColor' }}
            >
              {displayValue}
            </div>
          )}
        </div>
      );
    }

    return inputElement;
  }
);
AppInput.displayName = 'AppInput';

export { AppInput };
