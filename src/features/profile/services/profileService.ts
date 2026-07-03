import { ApiService } from '@/config/apiClient';
import type { UpdateProfilePayload, UserProfile } from '@/features/auth';

/**
 * Service gọi API liên quan tới profile.
 * Tách riêng khỏi authService để dễ mở rộng (upload avatar, change password, ...).
 */
export const profileService = {
  getProfile: () => ApiService<UserProfile>('/users/profile', 'GET'),
  updateProfile: (data: UpdateProfilePayload) =>
    ApiService<UserProfile>('/users/profile', 'PUT', data),
};
