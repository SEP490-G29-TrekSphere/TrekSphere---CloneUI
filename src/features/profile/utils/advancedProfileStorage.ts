import type { TrekkerAdvancedProfile } from '../types';

const STORAGE_KEY_PREFIX = 'treksphere_adv_profile_';

export const DEFAULT_ADVANCED_PROFILE: TrekkerAdvancedProfile = {
  emergencyMedical: {
    bloodType: 'O+',
    medicalConditions: 'Không có tiền sử bệnh lý tim mạch. Sức khỏe bình thường.',
    allergies: 'Dị ứng nhẹ với phấn hoa rừng vào xuân',
    emergencyContactName: 'Nguyễn Văn Minh (Bố ruột)',
    emergencyContactPhone: '0988 123 456',
    emergencyRelationship: 'Bố / Mẹ',
    citizenId: '001098012345',
    insuranceId: 'DN 4 01 0123456789',
  },
  preferences: {
    fitnessLevel: 'intermediate',
    paceStyle: 'steady',
    trekkingFrequency: '1-2 lần / tháng',
    skillsAndEquipment: ['bivouac', 'firstaid', 'navigation'],
    preferredTerrains: ['mountain', 'jungle'],
    planningNotes: 'Đang tìm kiếm nhóm ghép chinh phục Lảo Thần hoặc Tà Xùa dịp cuối tháng. Đã chuẩn bị sẵn lều 2 người và dụng cụ y tế cá nhân.',
  },
};

export function getAdvancedProfile(userId: string): TrekkerAdvancedProfile {
  if (!userId) return DEFAULT_ADVANCED_PROFILE;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const em = parsed.emergencyMedical || {};
      return {
        emergencyMedical: {
          ...DEFAULT_ADVANCED_PROFILE.emergencyMedical,
          ...em,
          citizenId: em.citizenId || em.insuranceId || DEFAULT_ADVANCED_PROFILE.emergencyMedical.citizenId,
        },
        preferences: {
          ...DEFAULT_ADVANCED_PROFILE.preferences,
          ...(parsed.preferences || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to load advanced profile from localStorage', e);
  }
  return DEFAULT_ADVANCED_PROFILE;
}

export function saveAdvancedProfile(userId: string, data: TrekkerAdvancedProfile): void {
  if (!userId) return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save advanced profile to localStorage', e);
  }
}
