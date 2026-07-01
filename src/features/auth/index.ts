/**
 * Barrel export cho feature auth.
 *
 *   import { Login } from '@/features/auth/pages';
 *   import { authService } from '@/features/auth/services';
 *   import { loginSchema } from '@/features/auth/validations/auth.schema';
 */

export { default as ChangePassword } from './pages/ChangePassword';
export { default as ForgotPassword } from './pages/ForgotPassword';
export { default as Login } from './pages/Login';
export { default as Register } from './pages/Register';
export { authService } from './services/authService';
export * from './types';
export * from './validations/auth.schema';
