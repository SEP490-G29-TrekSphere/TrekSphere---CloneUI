/**
 * Types riêng cho feature profile.
 * Lưu ý: UserProfile / UpdateProfilePayload nằm trong features/auth/types.ts
 * vì chúng là payload của auth service. Ở đây chỉ chứa các type UI-only.
 */
export interface ProfileStat {
  label: string;
  value: string | number;
}

export const GENDER_LABELS: Record<'male' | 'female' | 'other', string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};
