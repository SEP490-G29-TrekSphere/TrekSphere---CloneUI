import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { AppDatePicker, type AppDatePickerProps } from '@/shared/ui/primitives/AppDatePicker';
import { AppLabel } from '@/shared/ui/primitives/AppLabel';

export interface AppFormDatePickerProps<TFieldValues extends FieldValues>
  extends Omit<AppDatePickerProps, 'name'> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  helperText?: string;
}

export function AppFormDatePicker<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  helperText,
  id,
  className,
  ...props
}: AppFormDatePickerProps<TFieldValues>) {
  const inputId = id || name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        // Ensure the value passed to DatePicker is a Date object or null
        const selectedDate = value ? new Date(value) : null;

        return (
          <div className={`space-y-2 ${className || ''}`}>
            {label && (
              <AppLabel htmlFor={inputId} className={error ? 'text-destructive' : ''}>
                {label}
              </AppLabel>
            )}

            <AppDatePicker
              id={inputId}
              selected={selectedDate}
              onChange={(date: Date | null) => {
                // Return ISO string or date representation expected by your forms
                onChange(date ? date.toISOString() : '');
              }}
              onBlur={onBlur}
              ref={ref}
              disabled={props.disabled}
              className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              {...props}
            />

            {(error?.message || helperText) && (
              <p className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
                {error?.message || helperText}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
