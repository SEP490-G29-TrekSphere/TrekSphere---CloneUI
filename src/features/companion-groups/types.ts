export type CompanionDifficulty = 'Dễ' | 'Vừa' | 'Khó' | 'Rất khó';

export interface CompanionLeader {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  role?: string;
}

export type UserRoleInGroup = 'leader' | 'member' | 'guest';

export interface CompanionGroup {
  id: string;
  title: string;
  thumbnailUrl: string;
  difficulty: CompanionDifficulty;
  departureDate: string; // e.g. '15/10/2024'
  location: string;
  currentMembers: number;
  maxMembers: number;
  neededMembers: number;
  leader: CompanionLeader;
  description?: string;
  isBookmarked?: boolean;
  isHidden?: boolean;
  tags?: string[];
}

export interface CompanionFilterParams {
  searchQuery?: string;
  location?: string;
  date?: string;
  difficulty?: CompanionDifficulty | 'All';
}

export interface JoinRequest {
  id: string;
  userName: string;
  avatarUrl?: string;
  initials: string;
  experienceInfo: string;
  message: string;
  createdAt?: string;
}

export interface GroupMemberDetail {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  role: 'Leader' | 'Chốt đoàn' | 'Thành viên';
  roleTitle?: string;
  isLeader?: boolean;
}
