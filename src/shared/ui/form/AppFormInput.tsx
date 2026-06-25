import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { AppInput, type AppInputProps } from '@/shared/ui/primitives/AppInput';
import { AppLabel } from '@/shared/ui/primitives/AppLabel';

export interface AppFormInputProps<TFieldValues extends FieldValues>
  extends Omit<AppInputProps, 'name'> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  helperText?: string;
}

export const AppFormInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  helperText,
  id,
  className,
  ...props
}: AppFormInputProps<TFieldValues>) => {
  const inputId = id || name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <div className={`space-y-2 ${className || ''}`}>
          {label && (
            <AppLabel htmlFor={inputId} className={error ? 'text-destructive' : ''}>
              {label}
            </AppLabel>
          )}

          <AppInput
            id={inputId}
            onChange={onChange}
            onBlur={onBlur}
            value={value || ''}
            ref={ref}
            aria-invalid={!!error}
            className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
            {...props}
          />

          {(error?.message || helperText) && (
            <p className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
              {error?.message || helperText}
            </p>
          )}
        </div>
      )}
    />
  );
};
