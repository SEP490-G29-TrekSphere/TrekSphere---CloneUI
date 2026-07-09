import type { StrengthScore, usePasswordStrength } from '../hooks/usePasswordStrength';

export const strengthBarColor: Record<StrengthScore, string> = {
  0: 'bg-destructive',
  1: 'bg-orange-500',
  2: 'bg-amber-500',
  3: 'bg-emerald-500',
  4: 'bg-primary',
};

export const strengthBarWidth: Record<StrengthScore, string> = {
  0: '20%',
  1: '40%',
  2: '60%',
  3: '80%',
  4: '100%',
};

export const strengthLabels: Record<StrengthScore, string> = {
  0: 'Rất yếu',
  1: 'Yếu',
  2: 'Trung bình',
  3: 'Mạnh',
  4: 'Rất mạnh',
};

export const strengthLabelColor: Record<StrengthScore, string> = {
  0: 'text-destructive',
  1: 'text-orange-500',
  2: 'text-amber-500',
  3: 'text-emerald-500',
  4: 'text-primary',
};

interface PasswordStrengthMeterProps {
  score: StrengthScore;
  feedback: ReturnType<typeof usePasswordStrength>['feedback'];
  isLoading?: boolean;
  hasError?: boolean;
  visible?: boolean;
}

export function PasswordStrengthMeter({
  score,
  feedback,
  isLoading = false,
  hasError = false,
  visible = true,
}: PasswordStrengthMeterProps) {
  if (!visible) return null;

  if (isLoading) {
    return (
      <div className="pt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Đang kiểm tra độ mạnh mật khẩu...
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="pt-1.5 text-xs text-muted-foreground italic">
        Đánh giá độ mạnh mật khẩu tạm thời không khả dụng.
      </div>
    );
  }

  return (
    <div className="pt-1.5 space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          Độ mạnh mật khẩu:{' '}
          <strong className={strengthLabelColor[score]}>{strengthLabels[score]}</strong>
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuetext={strengthLabels[score]}
        aria-label="Độ mạnh mật khẩu"
        aria-live="polite"
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${strengthBarColor[score]}`}
          style={{ width: strengthBarWidth[score] }}
        />
      </div>

      {feedback?.warning && (
        <p className="text-xs text-destructive font-medium flex items-center gap-1">
          <span aria-hidden="true">⚠️</span>
          <span>{feedback.warning}</span>
        </p>
      )}

      {feedback?.suggestions && feedback.suggestions.length > 0 && (
        <ul className="text-xs list-disc pl-4 space-y-0.5 text-muted-foreground">
          {feedback.suggestions.map((s, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: index is preferred key here
            <li key={index}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
