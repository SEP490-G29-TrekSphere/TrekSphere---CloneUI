import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/features/auth';
import { profileService } from '../services/profileService';

/**
 * Query keys dùng chung cho profile feature.
 * Centralized để tránh typo và dễ invalidate.
 */
export const profileKeys = {
  all: ['profile'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  /** Lấy profile của user hiện tại (chính mình). */
  me: () => [...profileKeys.all, 'me'] as const,
  /** Lấy profile của user khác theo userId. */
  detail: (userId: string) => [...profileKeys.all, 'detail', userId] as const,
};

/**
 * Shape thô mà BE `GET /users/me` trả về trong `data`:
 * {
 *   userID: string,
 *   email: string,
 *   fullName: string,
 *   phone: string | null,
 *   dateOfBirth: string | null,
 *   gender: string | null,
 *   avatarUrl: string | null,
 *   status: 'ACTIVE' | ...,
 *   emailVerified: boolean,
 *   roles: string[],
 * }
 *
 * FE dùng camelCase khác (`id`, `name`, `avatar`). Hàm này map từ shape
 * BE sang shape FE đang dùng.
 */
function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  const fullName = (raw.fullName as string | undefined) ?? '';
  const roles = Array.isArray(raw.roles) ? (raw.roles as string[]) : [];

  // Map gender từ BE (MALE/FEMALE/OTHER) sang FE (male/female/other)
  const rawGender = (raw.gender as string | null | undefined) ?? '';
  const genderMap: Record<string, UserProfile['gender']> = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
  };
  const gender = genderMap[rawGender.toUpperCase()] ?? undefined;

  return {
    id: (raw.userID as string | undefined) ?? (raw.id as string | undefined) ?? '',
    email: (raw.email as string | undefined) ?? '',
    name: fullName,
    phone: (raw.phone as string | null | undefined) ?? undefined,
    avatar: (raw.avatarUrl as string | null | undefined) ?? undefined,
    gender,
    dateOfBirth: (raw.dateOfBirth as string | null | undefined) ?? undefined,
    username:
      (raw.username as string | undefined) ?? `@${fullName.toLowerCase().replace(/\s+/g, '_')}`,
    roles,
    role: roles[0] ?? '',
    joinedAt:
      (raw.joinedAt as string | undefined) ??
      (raw.createdAt as string | undefined) ??
      (raw.updatedAt as string | undefined),
  };
}

/**
 * Hook lấy profile của user hiện tại (user đang đăng nhập).
 * Dùng cho các màn ViewProfile, EditProfile.
 *
 * Lưu ý: ApiService không throw mà trả về `{ error, status }` khi HTTP lỗi.
 * Ta throw để React Query chuyển `isError = true` và giữ message BE trên
 * `error.message` để UI hiển thị được nguyên nhân (vd: "Access Denied").
 */
export function useProfile() {
  const query = useQuery<UserProfile | null>({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      const res = await profileService.getProfile();
      if (res.error) {
        throw new Error(res.message || res.error);
      }
      const raw = res.data;
      if (!raw || typeof raw !== 'object') return null;
      return normalizeProfile(raw as unknown as Record<string, unknown>);
    },
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      // 401/403 là lỗi xác thực/phân quyền — không retry, tránh spam BE
      const msg = error instanceof Error ? error.message : '';
      if (/denied|unauthorized|forbidden/i.test(msg)) return false;
      return failureCount < 1;
    },
  });

  return query;
}
