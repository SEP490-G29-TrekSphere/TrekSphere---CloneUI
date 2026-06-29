/**
 * Shared UI components (barrel export).
 *
 * Import tá»« Ä‘Ã¢y Ä‘á»ƒ import ngáº¯n gá»n:
 *   import { AppButton, AppInput } from '@/shared/ui';
 *
 * Cáº¥u trÃºc bÃªn trong:
 *   - primitives/  : button, input, label, icon, badge, spinner, slider, checkbox
 *   - form/        : AppFormInput (wrapper cho react-hook-form)
 *   - data-display/: AppCard, AppTable, AppEmptyState
 *   - feedback/    : AppGlobalToast, AppGlobalLoadingSpinner
 *
 * Má»—i folder con váº«n cÃ³ thá»ƒ import trá»±c tiáº¿p náº¿u cáº§n:
 *   import { AppButton } from '@/shared/ui/primitives/AppButton';
 */

// Data display
export {
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardFooter,
  AppCardHeader,
  AppCardTitle,
} from './data-display/AppCard';
export { AppEmptyState, type AppEmptyStateProps } from './data-display/AppEmptyState';
export {
  AppTable,
  AppTableBody,
  AppTableCaption,
  AppTableCell,
  AppTableFooter,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
} from './data-display/AppTable';
// Feedback
export { AppGlobalLoadingSpinner } from './feedback/AppGlobalLoadingSpinner';
export { AppSpinner, type AppSpinnerProps, type AppSpinnerSize } from './feedback/AppSpinner';
export { AppGlobalToast } from './feedback/AppToast';
// Form
export { AppFormInput, type AppFormInputProps } from './form/AppFormInput';
// Primitives
export { AppBadge, type AppBadgeProps, type AppBadgeVariant } from './primitives/AppBadge';
export {
  AppButton,
  type AppButtonProps,
  type AppButtonSize,
  type AppButtonVariant,
} from './primitives/AppButton';
export { AppCheckbox, type AppCheckboxProps } from './primitives/AppCheckbox';
export { AppIcon, type AppIconProps, type AppIconSize } from './primitives/AppIcon';
export { AppInput, type AppInputProps } from './primitives/AppInput';
export { AppLabel, type AppLabelProps } from './primitives/AppLabel';
// Logo
export {
  AppLogo,
  TrekSphereLogo,
  type TrekSphereLogoProps,
  type TrekSphereLogoTone,
  type TrekSphereLogoVariant,
} from './primitives/AppLogo';
export { default as Slider, type SliderProps } from './primitives/Slider';
