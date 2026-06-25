/**
 * Types riÃªng cho feature auth.
 * Chá»‰ nhá»¯ng type thuá»™c vá» login/register/forgot-password má»›i Ä‘áº·t á»Ÿ Ä‘Ã¢y.
 */
import type { Role } from '@/constants';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}
