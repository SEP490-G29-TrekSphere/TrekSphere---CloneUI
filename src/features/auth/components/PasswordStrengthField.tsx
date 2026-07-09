import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

const EMPTY_ARRAY: string[] = [];

interface PasswordStrengthFieldProps {
  passwordFieldName?: string;
  userInputFieldNames?: string[];
  additionalUserInputs?: string[];
}

export function PasswordStrengthField({
  passwordFieldName = 'password',
  userInputFieldNames = EMPTY_ARRAY,
  additionalUserInputs = EMPTY_ARRAY,
}: PasswordStrengthFieldProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('PasswordStrengthField must be used within a FormProvider');
  }

  const { control } = context;

  const password =
    useWatch({
      control,
      name: passwordFieldName,
      defaultValue: '',
    }) ?? '';

  // Dynamically watch form fields for user inputs (e.g. fullName, email)
  const watchedValues = (useWatch({
    control,
    name: userInputFieldNames,
    defaultValue: EMPTY_ARRAY,
  }) || EMPTY_ARRAY) as unknown[];

  const userInputs = useMemo(() => {
    const inputs: string[] = [];

    // Add values watched from form inputs
    for (const val of watchedValues) {
      if (val && typeof val === 'string') {
        inputs.push(val);
      }
    }

    // Add additional static values (e.g. from logged-in user store)
    for (const val of additionalUserInputs) {
      if (val) {
        inputs.push(val);
      }
    }

    return inputs;
  }, [watchedValues, additionalUserInputs]);

  const { score, feedback, isLoading, hasError } = usePasswordStrength(password, userInputs);

  return (
    <PasswordStrengthMeter
      score={score}
      feedback={feedback}
      isLoading={isLoading}
      hasError={hasError}
      visible={password.length > 0}
    />
  );
}
