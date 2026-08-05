import { vi } from 'date-fns/locale/vi';
import { forwardRef, useEffect } from 'react';
import DatePicker, { type DatePickerProps, registerLocale } from 'react-datepicker';

// Register the Vietnamese locale
registerLocale('vi', vi);

export interface AppDatePickerProps extends Omit<DatePickerProps, 'locale' | 'dateFormat'> {
  className?: string;
  dateFormat?: string;
  placeholderText?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const AppDatePicker = forwardRef<DatePicker, AppDatePickerProps>(
  (
    { className, dateFormat, placeholderText = 'Chọn ngày...', disabled = false, style, ...props },
    ref
  ) => {
    useEffect(() => {
      if (typeof window !== 'undefined' && !document.getElementById('react-datepicker-portal')) {
        const portalDiv = document.createElement('div');
        portalDiv.id = 'react-datepicker-portal';
        document.body.appendChild(portalDiv);
      }
    }, []);

    const combinedClassName =
      `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`.trim();

    // Automatically adjust dateFormat to include time if showTimeSelect is used
    const actualDateFormat =
      dateFormat || (props.showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');

    return (
      <div className="relative w-full AppDatePicker-wrapper" style={style}>
        <DatePicker
          ref={ref}
          locale="vi"
          dateFormat={actualDateFormat}
          placeholderText={placeholderText}
          disabled={disabled}
          className={combinedClassName}
          popperClassName={`z-[9999] ${props.popperClassName || ''}`}
          portalId="react-datepicker-portal"
          {...(props as any)}
        />
      </div>
    );
  }
);

AppDatePicker.displayName = 'AppDatePicker';
