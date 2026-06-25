import { forwardRef, type InputHTMLAttributes, useState } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';

interface AuthInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  placeholder?: string;
  autoComplete?: string;
  suffixIcon?: React.ReactNode;
  onSuffixClick?: () => void;
  borderRadius?: 'sm' | 'lg' | 'full';
}

const radiusClasses = {
  sm: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps<FieldValues, string>>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      autoComplete,
      suffixIcon,
      onSuffixClick,
      borderRadius = 'sm',
    },
    ref
  ) => {
    const { control } = useFormContext();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-2">
        <label
          htmlFor={name}
          className="block text-xs font-semibold tracking-wide uppercase"
          style={{ color: '#6F7B75' }}
        >
          {label}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => (
            <div className="relative">
              <input
                {...field}
                ref={ref}
                id={name}
                type={effectiveType}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`w-full px-4 py-3 text-sm text-[#1F3933] placeholder-[#6F7B75]/50 bg-[#F0EEE6] border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F3933]/20 ${radiusClasses[borderRadius]} ${
                  fieldState.error ? 'border-red-400' : 'border-transparent focus:border-[#1F3933]'
                }`}
                style={{ backgroundColor: '#F0EEE6' }}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F3933] hover:opacity-70 transition-opacity"
                  tabIndex={-1}
                  aria-label={showPassword ? 'áº¨n máº­t kháº©u' : 'Hiá»‡n máº­t kháº©u'}
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              )}
              {suffixIcon && !isPassword && (
                <button
                  type="button"
                  onClick={onSuffixClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F3933] hover:opacity-70 transition-opacity"
                  tabIndex={-1}
                >
                  {suffixIcon}
                </button>
              )}
            </div>
          )}
        />
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
