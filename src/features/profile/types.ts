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

/** Thông tin Y tế & Khẩn cấp bắt buộc (Phục vụ SOS & Cứu hộ) */
export interface EmergencyMedicalInfo {
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | 'unknown';
  medicalConditions: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  citizenId?: string;
  insuranceId?: string;
}

/** Hồ sơ Nâng cao & Sở thích Kế hoạch Trekking (Dùng đề xuất ghép nhóm) */
export interface TrekkingPreferences {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'other';
  fitnessLevelCustom?: string;
  paceStyle: 'leisure' | 'steady' | 'fast' | 'other';
  paceStyleCustom?: string;
  trekkingFrequency: string;
  skillsAndEquipment: string[];
  skillsCustom?: string;
  preferredTerrains: string[];
  terrainsCustom?: string;
  planningNotes?: string;
}

export interface TrekkerAdvancedProfile {
  emergencyMedical: EmergencyMedicalInfo;
  preferences: TrekkingPreferences;
}

export const BLOOD_TYPES = [
  { value: 'unknown', label: 'Chưa xác định' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'O+', label: 'O+ (Phổ biến)' },
  { value: 'O-', label: 'O-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
];

export const FITNESS_LEVELS = [
  {
    value: 'beginner',
    label: 'Tân binh',
    desc: 'Trekker mới bắt đầu, chọn chặng nhẹ < 10km, địa hình bằng phẳng',
  },
  {
    value: 'intermediate',
    label: 'Trung bình',
    desc: 'Thể lực dẻo dai, chặng 10-20km, vượt dốc vừa phải',
  },
  {
    value: 'advanced',
    label: 'Bền bỉ',
    desc: 'Kinh nghiệm phong phú, chinh phục đỉnh núi dốc cao 2-3 ngày',
  },
  {
    value: 'expert',
    label: 'Chuyên nghiệp',
    desc: 'Chinh phục độ cao lớn, kỹ thuật leo núi & sinh tồn rừng sâu',
  },
  {
    value: 'other',
    label: 'Khác / Linh hoạt',
    desc: 'Mức độ thể lực hoặc yêu cầu hỗ trợ đặc thù (mô tả trong ghi chú)',
  },
];

export const PACE_STYLES = [
  { value: 'leisure', label: 'Thong thả & Chụp ảnh', desc: 'Đi thong thả, ngắm cảnh và chụp hình' },
  {
    value: 'steady',
    label: 'Tốc độ bền bỉ & Giữ khoảng cách',
    desc: 'Đồng hành cùng nhóm, duy trì nhịp thở',
  },
  {
    value: 'fast',
    label: 'Tốc độ nhanh & Thể thao',
    desc: 'Tập trung thể lực, hoàn thành mốc sớm',
  },
  { value: 'other', label: 'Khác / Tùy chỉnh', desc: 'Di chuyển linh hoạt theo tình hình thực tế' },
];

export const SKILL_OPTIONS = [
  { id: 'bivouac', label: 'Có lều trại & túi ngủ riêng' },
  { id: 'cooking', label: 'Kỹ năng nấu ăn dã ngoại' },
  { id: 'firstaid', label: 'Sơ cứu y tế cơ bản (First Aid)' },
  { id: 'navigation', label: 'Định vị GPS & Đọc bản đồ' },
  { id: 'climbing', label: 'Leo dây & Bám địa hình dốc' },
  { id: 'other', label: 'Trang bị & Kỹ năng khác (Bộ đàm, Flycam, SUP...)' },
];

export const TERRAIN_OPTIONS = [
  { id: 'mountain', label: 'Đỉnh núi cao / Săn mây' },
  { id: 'jungle', label: 'Rừng nguyên sinh / Rừng rậm' },
  { id: 'stream', label: 'Suối / Thác nước / Trekking lội nước' },
  { id: 'cave', label: 'Hang động / Thám hiểm' },
  { id: 'other', label: 'Địa hình khác (Đồi cỏ, Biển/Đảo, Thảm rêu...)' },
];

/** Khoảnh khắc Check-in công khai của User (Locket/Moments style) */
export interface UserMoment {
  id: string;
  locationName: string;
  altitude?: string;
  tripTitle: string;
  imageUrl: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  caption: string;
  coordinates?: string;
}

/** Bài viết / Kinh nghiệm chia sẻ công khai */
export interface UserPublicPost {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  createdAt: string;
  viewCount: number;
  commentsCount: number;
  category: string;
}

/** Chuyến đi & Nhóm đồng hành công khai */
export interface UserPublicTrip {
  id: string;
  title: string;
  role: 'LEADER' | 'MEMBER';
  status: 'COMPLETED' | 'RECRUITING' | 'IN_PROGRESS';
  startDate: string;
  membersCount: number;
  coverImage: string;
  location: string;
}

/** Dữ liệu Trang cá nhân Công khai đầy đủ (Public User Profile) */
export interface UserPublicProfileData {
  id: string;
  fullName: string;
  handle: string;
  avatarUrl: string;
  coverUrl: string;
  role: string;
  bio: string;
  location: string;
  joinedDate: string;
  verifiedBadge?: boolean;
  reputationScore: number;
  reviewCount: number;
  stats: {
    tripsCount: number;
    postsCount: number;
    momentsCount: number;
  };
  preferences?: TrekkingPreferences;
  moments: UserMoment[];
  posts: UserPublicPost[];
  trips: UserPublicTrip[];
}
